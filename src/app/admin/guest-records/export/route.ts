import { NextRequest, NextResponse } from "next/server";
import {
  bookingSourceOptions,
  formatEnumLabel,
  getBalanceDue,
  isReadyToApprove,
  paymentStatusOptions,
} from "@/lib/check-in/options";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type Checkin = Database["public"]["Tables"]["guest_checkins"]["Row"];
type OperatorView = "all" | "needs_review" | "ready" | "active" | "completed" | "issues";

const operatorViews = ["all", "needs_review", "ready", "active", "completed", "issues"] as const;

function getActiveView(value: string | null): OperatorView {
  return operatorViews.includes(value as OperatorView) ? (value as OperatorView) : "all";
}

function csvEscape(value: string | number | boolean | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function toNumberCell(value: number | null | undefined) {
  return value === null || value === undefined ? "" : value;
}

async function requireManagementForExport() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, error: NextResponse.json({ error: "Unauthenticated" }, { status: 401 }) };
  }

  const { data: profile } = await supabase.from("users_profile").select("role").eq("id", user.id).single();
  if (!profile || !["manager", "admin", "super_admin"].includes(profile.role)) {
    return { supabase, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, error: null };
}

export async function GET(request: NextRequest) {
  const { supabase, error: authError } = await requireManagementForExport();

  if (authError) {
    return authError;
  }

  const params = request.nextUrl.searchParams;
  const activeView = getActiveView(params.get("view"));
  let query = supabase.from("guest_checkins").select("*").order("created_at", { ascending: false });

  if (activeView === "needs_review") {
    query = query.eq("status", "submitted");
  } else if (activeView === "ready") {
    query = query.in("status", ["submitted", "under_review"]);
  } else if (activeView === "active") {
    query = query.eq("status", "checked_in");
  } else if (activeView === "completed") {
    query = query.eq("status", "checked_out");
  } else if (activeView === "issues") {
    query = query.eq("status", "issue");
  }

  const search = params.get("q")?.trim().replace(/,/g, " ");
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const paymentStatus = params.get("payment_status");
  if (paymentStatus && paymentStatusOptions.some((option) => option.value === paymentStatus)) {
    query = query.eq("payment_status", paymentStatus as Checkin["payment_status"]);
  }

  const bookingSource = params.get("booking_source");
  if (bookingSource && bookingSourceOptions.some((option) => option.value === bookingSource)) {
    query = query.eq("booking_source", bookingSource as Checkin["booking_source"]);
  }

  const dateFrom = params.get("date_from");
  if (dateFrom) {
    query = query.gte("check_in_date", dateFrom);
  }

  const dateTo = params.get("date_to");
  if (dateTo) {
    query = query.lte("check_in_date", dateTo);
  }

  const verification = params.get("verification");
  if (verification === "cnic") {
    query = query.eq("cnic_verified", false);
  } else if (verification === "payment") {
    query = query.eq("payment_verified", false);
  } else if (verification === "any") {
    query = query.or("cnic_verified.eq.false,payment_verified.eq.false");
  }

  const { data: records, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const visibleRecords = activeView === "ready" ? (records ?? []).filter(isReadyToApprove) : records ?? [];
  const assignedRoomIds = Array.from(
    new Set(visibleRecords.map((record) => record.assigned_room_id).filter((id): id is string => Boolean(id))),
  );
  const { data: rooms } = assignedRoomIds.length
    ? await supabase.from("rooms").select("id,name").in("id", assignedRoomIds)
    : { data: [] };
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, room.name]));

  const headers = [
    "guest name",
    "guest type",
    "phone",
    "email",
    "check-in date",
    "check-out date",
    "number of guests",
    "booking source",
    "payment method",
    "assigned room",
    "agreed_room_rate_pkr",
    "advance_paid_amount_pkr",
    "total_expected_amount_pkr",
    "amount_paid_pkr",
    "balance_due_pkr",
    "payment_status",
    "cnic_verified",
    "payment_verified",
    "status",
    "guest_tag",
    "created_at",
  ];

  const rows = visibleRecords.map((record) => [
    record.full_name,
    formatEnumLabel(record.guest_type),
    record.phone,
    record.email,
    record.check_in_date,
    record.check_out_date,
    record.number_of_guests,
    formatEnumLabel(record.booking_source),
    formatEnumLabel(record.payment_method),
    record.assigned_room_id ? roomNames.get(record.assigned_room_id) ?? "Assigned" : "",
    toNumberCell(record.agreed_room_rate_pkr),
    toNumberCell(record.advance_paid_amount_pkr),
    toNumberCell(record.total_expected_amount_pkr),
    toNumberCell(record.amount_paid_pkr),
    toNumberCell(getBalanceDue(record)),
    record.payment_status,
    record.cnic_verified,
    record.payment_verified,
    record.status,
    record.guest_tag,
    record.created_at,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const filename = `greenlux-guest-records-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
