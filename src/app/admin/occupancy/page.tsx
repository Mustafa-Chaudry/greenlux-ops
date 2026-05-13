import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  Hotel,
  ShieldAlert,
  Sparkles,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";
import { updateRoomCleaningStatus } from "@/app/admin/rooms/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  formatEnumLabel,
  formatPkr,
  roomCleaningStatusLabels,
  roomCleaningStatusOptions,
  type RoomCleaningStatus,
} from "@/lib/check-in/options";
import { formatStayRangeWithNights } from "@/lib/check-in/stay-dates";
import { fetchOccupancySnapshot, type UnitOccupancyRow, type VerificationSignal } from "@/lib/occupancy/snapshot";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Room Reality Board",
};

type RoomRealityKind =
  | "action_required"
  | "arriving_today"
  | "departing_today"
  | "occupied"
  | "ready_vacant"
  | "cleaning_required"
  | "cleaning_in_progress"
  | "maintenance_blocked"
  | "turnover_needed"
  | "maintenance";

type RoomRealityCard = {
  unit: UnitOccupancyRow;
  href: string;
  hrefLabel: string;
  state: RoomRealityKind;
  stateLabel: string;
  primaryText: string;
  priority: number;
};

const roomRealityPriority: Record<RoomRealityKind, number> = {
  action_required: 1,
  maintenance_blocked: 2,
  cleaning_required: 3,
  turnover_needed: 4,
  cleaning_in_progress: 5,
  arriving_today: 6,
  departing_today: 7,
  occupied: 8,
  ready_vacant: 9,
  maintenance: 10,
};

const stateStyles: Record<RoomRealityKind, string> = {
  action_required: "border-orange-200 bg-orange-50/80 hover:border-orange-300",
  arriving_today: "border-sky-200 bg-sky-50/80 hover:border-sky-300",
  departing_today: "border-amber-200 bg-amber-50/80 hover:border-amber-300",
  occupied: "border-brand-sage bg-white hover:border-brand-fresh/70",
  ready_vacant: "border-emerald-200 bg-emerald-50/80 hover:border-emerald-300",
  cleaning_required: "border-orange-200 bg-orange-50/80 hover:border-orange-300",
  cleaning_in_progress: "border-sky-200 bg-sky-50/80 hover:border-sky-300",
  maintenance_blocked: "border-red-200 bg-red-50/80 hover:border-red-300",
  turnover_needed: "border-slate-300 bg-slate-50 hover:border-slate-400",
  maintenance: "border-yellow-300 bg-yellow-50/80 hover:border-yellow-400",
};

const stateTone: Record<RoomRealityKind, "neutral" | "success" | "warning" | "danger" | "info" | "blue"> = {
  action_required: "warning",
  arriving_today: "blue",
  departing_today: "warning",
  occupied: "info",
  ready_vacant: "success",
  cleaning_required: "warning",
  cleaning_in_progress: "blue",
  maintenance_blocked: "danger",
  turnover_needed: "neutral",
  maintenance: "warning",
};

const verificationTone: Record<VerificationSignal, "neutral" | "success" | "warning" | "danger" | "info" | "blue"> = {
  verified: "success",
  pending: "warning",
  missing: "warning",
  rejected: "danger",
};

const verificationText: Record<VerificationSignal, { id: string; payment: string }> = {
  verified: { id: "ID verified", payment: "Payment verified" },
  pending: { id: "ID pending", payment: "Payment pending" },
  missing: { id: "ID missing", payment: "Payment missing" },
  rejected: { id: "ID rejected", payment: "Payment rejected" },
};

const cleaningTone: Record<RoomCleaningStatus, "neutral" | "success" | "warning" | "danger" | "info" | "blue"> = {
  ready: "success",
  cleaning_required: "warning",
  cleaning_in_progress: "blue",
  maintenance_blocked: "danger",
};

function SummaryMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-brand-deep">{value}</p>
    </div>
  );
}

function formatStayDateRange(unit: UnitOccupancyRow) {
  const stay = unit.currentStay ?? unit.upcomingStay ?? unit.departedToday;

  if (!stay) {
    return null;
  }

  return formatStayRangeWithNights(stay.check_in_date, stay.check_out_date);
}

function isActionRequired(unit: UnitOccupancyRow) {
  return (
    unit.attentionReasons.length > 0 ||
    unit.idVerificationStatus !== "verified" ||
    unit.paymentVerificationStatus !== "verified" ||
    unit.outstandingBalance > 0
  );
}

function buildRoomRealityCard(unit: UnitOccupancyRow): RoomRealityCard {
  const stay = unit.currentStay ?? unit.upcomingStay;
  const hasMaintenanceIssue = unit.room.status === "maintenance" || Boolean(unit.openMaintenance);
  const isRoomInactive = unit.room.status === "inactive";
  const needsAction = Boolean(stay) && isActionRequired(unit);
  const cleaningStatus = unit.effectiveCleaningStatus;
  let state: RoomRealityKind = "ready_vacant";
  let stateLabel = "Ready / Vacant";
  let primaryText = "Ready for guest";

  if (cleaningStatus === "maintenance_blocked") {
    state = "maintenance_blocked";
    stateLabel = "Maintenance Blocked";
    primaryText = unit.openMaintenance?.issue_title ?? "Maintenance blocking readiness";
  } else if (!stay && unit.inferredTurnoverNeeded) {
    state = "turnover_needed";
    stateLabel = "Inferred turnover needed";
    primaryText = "Turnover likely after checkout";
  } else if (cleaningStatus === "cleaning_required") {
    state = "cleaning_required";
    stateLabel = "Cleaning Required";
    primaryText = "Cleaning required";
  } else if (cleaningStatus === "cleaning_in_progress") {
    state = "cleaning_in_progress";
    stateLabel = "Cleaning In Progress";
    primaryText = "Cleaning in progress";
  } else if (needsAction) {
    state = "action_required";
    stateLabel = "Action Required";
    primaryText = unit.attentionReasons[0] ?? "Action required";
  } else if (unit.arrivalToday && unit.upcomingStay) {
    state = "arriving_today";
    stateLabel = "Arriving Today";
    primaryText = "Arriving today";
  } else if (unit.departureToday) {
    state = "departing_today";
    stateLabel = "Departing Today";
    primaryText = "Departing today";
  } else if (unit.currentStay) {
    state = "occupied";
    stateLabel = "Occupied";
    primaryText = `Guest: ${unit.currentStay.full_name}`;
  } else if (hasMaintenanceIssue || isRoomInactive) {
    state = "maintenance";
    stateLabel = isRoomInactive ? "Out of Service" : "Maintenance";
    primaryText = unit.openMaintenance?.issue_title ?? "Maintenance active";
  }

  let href = "/admin/occupancy";
  let hrefLabel = "Open occupancy";

  if (stay) {
    href = `/admin/guest-records/${stay.id}`;
    hrefLabel = "Open guest stay";
  } else if (hasMaintenanceIssue || isRoomInactive) {
    href = "/admin/maintenance";
    hrefLabel = "Open maintenance";
  }

  return {
    unit,
    href,
    hrefLabel,
    state,
    stateLabel,
    primaryText,
    priority: roomRealityPriority[state],
  };
}

function statusIconFor(state: RoomRealityKind) {
  if (state === "ready_vacant") {
    return CheckCircle2;
  }

  if (state === "occupied") {
    return UserRound;
  }

  if (state === "arriving_today") {
    return CalendarCheck;
  }

  if (state === "departing_today") {
    return CalendarClock;
  }

  if (state === "turnover_needed") {
    return Sparkles;
  }

  if (state === "cleaning_required" || state === "cleaning_in_progress") {
    return Sparkles;
  }

  if (state === "maintenance_blocked") {
    return AlertTriangle;
  }

  if (state === "maintenance") {
    return Wrench;
  }

  return AlertTriangle;
}

function VerificationBadge({
  label,
  status,
  icon: Icon,
}: {
  label: string;
  status: VerificationSignal;
  icon: typeof ShieldAlert;
}) {
  return (
    <Badge tone={verificationTone[status]} className="gap-1.5">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}

function cleaningActionLabel(status: RoomCleaningStatus) {
  if (status === "ready") {
    return "Mark Ready";
  }

  if (status === "cleaning_required") {
    return "Mark Cleaning Required";
  }

  if (status === "cleaning_in_progress") {
    return "Mark Cleaning In Progress";
  }

  return "Mark Maintenance Blocked";
}

function CleaningActionButtons({ roomId, currentStatus }: { roomId: string; currentStatus: RoomCleaningStatus }) {
  return (
    <div className="grid gap-2 border-t border-white/70 pt-3 sm:grid-cols-2">
      {roomCleaningStatusOptions.map((option) => (
        <form key={option.value} action={updateRoomCleaningStatus}>
          <input type="hidden" name="id" value={roomId} />
          <input type="hidden" name="cleaning_status" value={option.value} />
          <input type="hidden" name="return_to" value="/admin/occupancy" />
          <Button type="submit" size="sm" variant={option.value === currentStatus ? "secondary" : "outline"} className="w-full justify-start">
            {cleaningActionLabel(option.value)}
          </Button>
        </form>
      ))}
    </div>
  );
}

export default async function OccupancyPage() {
  const { supabase } = await requireRole(managementRoles);
  const snapshot = await fetchOccupancySnapshot(supabase);
  const roomRealityCards = snapshot.units
    .map(buildRoomRealityCard)
    .sort((a, b) => a.priority - b.priority || (a.unit.room.unit_number ?? 999) - (b.unit.room.unit_number ?? 999));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Live operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Room Reality Board</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              High-clarity 11-unit property map for {snapshot.today}. Every Room Reality Card uses text, icons, and calm
              status styling so staff can spot the next operational move quickly.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </header>

        {snapshot.errors.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {snapshot.errors.join(" ")}
          </div>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" aria-label="Room reality summary">
          <SummaryMetric label="Total units" value={snapshot.summary.totalUnits} />
          <SummaryMetric label="Occupied" value={snapshot.summary.occupiedUnits} />
          <SummaryMetric label="Vacant" value={snapshot.summary.vacantUnits} />
          <SummaryMetric label="Departing" value={snapshot.summary.dueOutToday} />
          <SummaryMetric label="Arriving today" value={snapshot.summary.arrivingToday} />
          <SummaryMetric label="Needs action" value={snapshot.summary.needsAttentionUnits} />
          <SummaryMetric label="Occupancy" value={`${snapshot.summary.occupancyPercentage}%`} />
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Room Reality Cards">
          {roomRealityCards.map((card) => {
            const unit = card.unit;
            const stay = unit.currentStay ?? unit.upcomingStay;
            const StatusIcon = statusIconFor(card.state);
            const stayDateRange = formatStayDateRange(unit);

            return (
              <Card key={unit.room.id} className={cn("flex h-full flex-col overflow-hidden transition-shadow hover:shadow-soft", stateStyles[card.state])}>
                  <CardHeader className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardDescription>Unit {unit.room.unit_number ?? "-"}</CardDescription>
                        <CardTitle className="mt-1 text-2xl leading-tight">{unit.room.name}</CardTitle>
                      </div>
                      <span className="shrink-0 rounded-lg border border-white/70 bg-white/80 px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                        {formatEnumLabel(unit.room.type)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge tone={stateTone[card.state]} className="gap-1.5">
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {card.stateLabel}
                      </Badge>
                      {unit.room.status !== "active" ? <Badge tone="neutral">{formatEnumLabel(unit.room.status)}</Badge> : null}
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-0">
                    <div className="rounded-lg border border-white/70 bg-white/75 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-500">Current state</p>
                      <p className="mt-2 text-lg font-semibold leading-snug text-brand-deep">{card.primaryText}</p>
                      {stayDateRange ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                          <CalendarClock className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                          {stayDateRange}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2">
                      {stay ? (
                        <>
                          <VerificationBadge
                            label={verificationText[unit.idVerificationStatus].id}
                            status={unit.idVerificationStatus}
                            icon={ShieldAlert}
                          />
                          <VerificationBadge
                            label={verificationText[unit.paymentVerificationStatus].payment}
                            status={unit.paymentVerificationStatus}
                            icon={WalletCards}
                          />
                          {unit.outstandingBalance > 0 ? (
                            <Badge tone="warning" className="gap-1.5">
                              <WalletCards className="h-3.5 w-3.5" aria-hidden="true" />
                              Outstanding balance {formatPkr(unit.outstandingBalance)}
                            </Badge>
                          ) : (
                            <Badge tone="success" className="gap-1.5">
                              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              No balance due
                            </Badge>
                          )}
                        </>
                      ) : null}

                      {unit.arrivalToday ? (
                        <Badge tone="blue" className="gap-1.5">
                          <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Arrival today
                        </Badge>
                      ) : null}

                      {unit.departureToday ? (
                        <Badge tone="warning" className="gap-1.5">
                          <DoorOpen className="h-3.5 w-3.5" aria-hidden="true" />
                          Departure today
                        </Badge>
                      ) : null}

                      {unit.turnoverNeeded ? (
                        <Badge tone={unit.inferredTurnoverNeeded ? "neutral" : cleaningTone[unit.effectiveCleaningStatus]} className="gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          {unit.inferredTurnoverNeeded ? "Inferred turnover needed" : roomCleaningStatusLabels[unit.effectiveCleaningStatus]}
                        </Badge>
                      ) : (
                        <Badge tone="success" className="gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Ready
                        </Badge>
                      )}

                      {unit.openMaintenance ? (
                        <Badge tone="warning" className="gap-1.5">
                          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                          Maintenance active
                        </Badge>
                      ) : null}

                      {!stay && !unit.turnoverNeeded && !unit.openMaintenance && unit.room.status === "active" ? (
                        <Badge tone="success" className="gap-1.5">
                          <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
                          Ready for guest
                        </Badge>
                      ) : null}
                    </div>

                    <CleaningActionButtons roomId={unit.room.id} currentStatus={unit.room.cleaning_status} />

                    <div className="flex items-center justify-between gap-3 border-t border-white/70 pt-3 text-sm font-semibold text-brand-deep">
                      <Button asChild size="sm" variant="ghost" className="px-0 text-brand-deep hover:bg-transparent">
                        <Link href={card.href} aria-label={`${unit.room.name}: ${card.stateLabel}. ${card.hrefLabel}`}>
                          {card.hrefLabel}
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
            );
          })}
        </section>

        <div className="flex justify-end">
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/rooms">
              <Hotel className="h-4 w-4" aria-hidden="true" />
              Unit settings
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
