import {
  formatUnitRoomLabel,
  getBusinessTodayDate,
  getExpectedAmount,
  type CheckinStatus,
} from "@/lib/check-in/options";
import type { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type RoomRow = Pick<Database["public"]["Tables"]["rooms"]["Row"], "id" | "unit_number" | "name" | "type" | "status">;
type CheckinRow = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "assigned_room_id"
  | "full_name"
  | "check_in_date"
  | "check_out_date"
  | "status"
  | "cnic_verified"
  | "payment_verified"
  | "issue_type"
  | "guest_tag"
  | "total_expected_amount_pkr"
  | "agreed_room_rate_pkr"
  | "amount_paid_pkr"
>;
type MaintenanceRow = Pick<Database["public"]["Tables"]["room_maintenance_logs"]["Row"], "id" | "room_id" | "issue_title" | "status">;
type ChargeRow = Pick<Database["public"]["Tables"]["guest_charges"]["Row"], "guest_checkin_id" | "total_amount_pkr" | "is_paid">;

export type OccupancyStatus = "vacant" | "occupied" | "due_out_today" | "reserved_upcoming" | "needs_attention" | "maintenance";

export const occupancyStatusLabels: Record<OccupancyStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  due_out_today: "Due Out Today",
  reserved_upcoming: "Reserved / Upcoming",
  needs_attention: "Needs Attention",
  maintenance: "Maintenance",
};

export const occupancyStatusTone: Record<OccupancyStatus, "neutral" | "success" | "warning" | "danger" | "info" | "blue"> = {
  vacant: "success",
  occupied: "blue",
  due_out_today: "warning",
  reserved_upcoming: "info",
  needs_attention: "danger",
  maintenance: "danger",
};

export type UnitOccupancyRow = {
  room: RoomRow;
  unitLabel: string;
  status: OccupancyStatus;
  currentStay: CheckinRow | null;
  upcomingStay: CheckinRow | null;
  openMaintenance: MaintenanceRow | null;
  attentionReasons: string[];
  outstandingBalance: number;
};

export type OccupancySnapshot = {
  today: string;
  units: UnitOccupancyRow[];
  summary: {
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    dueOutToday: number;
    upcomingArrivals: number;
    needsAttentionUnits: number;
    maintenanceUnits: number;
    occupancyPercentage: number;
  };
  errors: string[];
};

function isOpenStay(checkin: CheckinRow) {
  return checkin.status !== "checked_out";
}

function isActiveStay(checkin: CheckinRow, today: string) {
  return isOpenStay(checkin) && checkin.check_in_date <= today && (!checkin.check_out_date || checkin.check_out_date >= today);
}

function isUpcomingStay(checkin: CheckinRow, today: string) {
  return isOpenStay(checkin) && checkin.check_in_date > today;
}

function chargeSummary(charges: ChargeRow[]) {
  return charges.reduce(
    (summary, charge) => ({
      total: summary.total + charge.total_amount_pkr,
      paid: summary.paid + (charge.is_paid ? charge.total_amount_pkr : 0),
    }),
    { total: 0, paid: 0 },
  );
}

function getOutstandingBalance(checkin: CheckinRow, charges: ChargeRow[]) {
  const baseExpected = getExpectedAmount(checkin) ?? 0;
  const basePaid = checkin.amount_paid_pkr ?? 0;
  const folio = chargeSummary(charges);

  return Math.max(baseExpected + folio.total - basePaid - folio.paid, 0);
}

function getAttentionReasons({
  checkin,
  hasRejectedDocument,
  outstandingBalance,
}: {
  checkin: CheckinRow | null;
  hasRejectedDocument: boolean;
  outstandingBalance: number;
}) {
  if (!checkin) {
    return [];
  }

  const reasons: string[] = [];

  if (!checkin.cnic_verified) {
    reasons.push("CNIC pending");
  }

  if (!checkin.payment_verified) {
    reasons.push("Payment proof pending");
  }

  if (hasRejectedDocument) {
    reasons.push("Document issue");
  }

  if (outstandingBalance > 0) {
    reasons.push("Outstanding balance");
  }

  if (checkin.issue_type) {
    reasons.push(checkin.issue_type === "guest_exception" ? "Exception check-in" : "Issue flagged");
  }

  if (checkin.status === "issue" || checkin.guest_tag === "issue") {
    reasons.push("Needs correction");
  }

  if (!checkin.check_out_date) {
    reasons.push("Missing checkout date");
  }

  return Array.from(new Set(reasons));
}

function sortByCheckout(a: CheckinRow, b: CheckinRow) {
  return (a.check_out_date || "9999-12-31").localeCompare(b.check_out_date || "9999-12-31");
}

function sortByCheckin(a: CheckinRow, b: CheckinRow) {
  return a.check_in_date.localeCompare(b.check_in_date);
}

function getUnitStatus({
  room,
  currentStay,
  upcomingStay,
  openMaintenance,
  attentionReasons,
  today,
}: {
  room: RoomRow;
  currentStay: CheckinRow | null;
  upcomingStay: CheckinRow | null;
  openMaintenance: MaintenanceRow | null;
  attentionReasons: string[];
  today: string;
}): OccupancyStatus {
  if (room.status === "maintenance" || openMaintenance) {
    return "maintenance";
  }

  if (currentStay?.check_out_date === today) {
    return "due_out_today";
  }

  if (currentStay) {
    return "occupied";
  }

  if (upcomingStay) {
    return "reserved_upcoming";
  }

  if (attentionReasons.length > 0) {
    return "needs_attention";
  }

  return "vacant";
}

export async function fetchOccupancySnapshot(supabase: SupabaseServerClient, today = getBusinessTodayDate()): Promise<OccupancySnapshot> {
  const [roomsResult, checkinsResult, maintenanceResult] = await Promise.all([
    supabase
      .from("rooms")
      .select("id,unit_number,name,type,status")
      .order("unit_number", { nullsFirst: false }),
    supabase
      .from("guest_checkins")
      .select(
        "id,assigned_room_id,full_name,check_in_date,check_out_date,status,cnic_verified,payment_verified,issue_type,guest_tag,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr",
      )
      .not("assigned_room_id", "is", null)
      .neq("status", "checked_out"),
    supabase
      .from("room_maintenance_logs")
      .select("id,room_id,issue_title,status")
      .in("status", ["reported", "in_progress"]),
  ]);
  const checkins = (checkinsResult.data ?? []) as CheckinRow[];
  const checkinIds = checkins.map((checkin) => checkin.id);
  const [chargesResult, documentsResult] = checkinIds.length
    ? await Promise.all([
        supabase
          .from("guest_charges")
          .select("guest_checkin_id,total_amount_pkr,is_paid")
          .in("guest_checkin_id", checkinIds),
        supabase
          .from("guest_documents")
          .select("checkin_id")
          .eq("document_status", "rejected")
          .in("checkin_id", checkinIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  const chargesByCheckin = new Map<string, ChargeRow[]>();
  ((chargesResult.data ?? []) as ChargeRow[]).forEach((charge) => {
    const charges = chargesByCheckin.get(charge.guest_checkin_id) ?? [];
    charges.push(charge);
    chargesByCheckin.set(charge.guest_checkin_id, charges);
  });
  const rejectedDocumentCheckins = new Set((documentsResult.data ?? []).map((document) => document.checkin_id));
  const checkinsByRoom = new Map<string, CheckinRow[]>();
  checkins.forEach((checkin) => {
    if (!checkin.assigned_room_id) {
      return;
    }

    const roomCheckins = checkinsByRoom.get(checkin.assigned_room_id) ?? [];
    roomCheckins.push(checkin);
    checkinsByRoom.set(checkin.assigned_room_id, roomCheckins);
  });
  const maintenanceByRoom = new Map<string, MaintenanceRow>();
  ((maintenanceResult.data ?? []) as MaintenanceRow[]).forEach((maintenance) => {
    if (!maintenanceByRoom.has(maintenance.room_id)) {
      maintenanceByRoom.set(maintenance.room_id, maintenance);
    }
  });

  const units = ((roomsResult.data ?? []) as RoomRow[]).map((room) => {
    const roomCheckins = checkinsByRoom.get(room.id) ?? [];
    const currentStay = roomCheckins.filter((checkin) => isActiveStay(checkin, today)).sort(sortByCheckout)[0] ?? null;
    const upcomingStay = roomCheckins.filter((checkin) => isUpcomingStay(checkin, today)).sort(sortByCheckin)[0] ?? null;
    const displayStay = currentStay ?? upcomingStay;
    const charges = displayStay ? chargesByCheckin.get(displayStay.id) ?? [] : [];
    const outstandingBalance = displayStay ? getOutstandingBalance(displayStay, charges) : 0;
    const attentionReasons = getAttentionReasons({
      checkin: displayStay,
      hasRejectedDocument: displayStay ? rejectedDocumentCheckins.has(displayStay.id) : false,
      outstandingBalance,
    });
    const openMaintenance = maintenanceByRoom.get(room.id) ?? null;
    const status = getUnitStatus({ room, currentStay, upcomingStay, openMaintenance, attentionReasons, today });

    return {
      room,
      unitLabel: formatUnitRoomLabel(room),
      status,
      currentStay,
      upcomingStay,
      openMaintenance,
      attentionReasons,
      outstandingBalance,
    };
  });
  const occupiedUnits = units.filter((unit) => unit.currentStay).length;
  const totalUnits = units.length;

  return {
    today,
    units,
    summary: {
      totalUnits,
      occupiedUnits,
      vacantUnits: units.filter((unit) => unit.status === "vacant").length,
      dueOutToday: units.filter((unit) => unit.status === "due_out_today").length,
      upcomingArrivals: units.filter((unit) => unit.status === "reserved_upcoming").length,
      needsAttentionUnits: units.filter((unit) => unit.attentionReasons.length > 0).length,
      maintenanceUnits: units.filter((unit) => unit.status === "maintenance").length,
      occupancyPercentage: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
    },
    errors: [roomsResult.error, checkinsResult.error, maintenanceResult.error, chargesResult.error, documentsResult.error]
      .filter((error): error is NonNullable<typeof error> => Boolean(error))
      .map((error) => error.message),
  };
}

export function isOperationallyOpenStatus(status: CheckinStatus) {
  return status !== "checked_out";
}
