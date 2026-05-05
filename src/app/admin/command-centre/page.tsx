import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CalendarDays, Hotel, LogOut, Plus, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  formatEnumLabel,
  formatPkr,
  getBusinessTodayDate,
  getGuestFinancialSummary,
} from "@/lib/check-in/options";
import { fetchOccupancySnapshot } from "@/lib/occupancy/snapshot";
import { buildBusinessReport, fetchReportInputs } from "@/lib/reports/analytics";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Command Centre",
};

type Checkin = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "full_name"
  | "phone"
  | "booking_source"
  | "check_in_date"
  | "check_out_date"
  | "status"
  | "assigned_room_id"
  | "cnic_verified"
  | "payment_verified"
  | "payment_status"
  | "payment_method"
  | "total_expected_amount_pkr"
  | "agreed_room_rate_pkr"
  | "amount_paid_pkr"
  | "issue_type"
  | "guest_tag"
>;
type GuestCharge = Pick<
  Database["public"]["Tables"]["guest_charges"]["Row"],
  "guest_checkin_id" | "total_amount_pkr" | "is_paid" | "charged_at"
>;
type RejectedDocument = Pick<Database["public"]["Tables"]["guest_documents"]["Row"], "checkin_id">;
type MaintenanceLog = Pick<
  Database["public"]["Tables"]["room_maintenance_logs"]["Row"],
  "id" | "room_id" | "issue_title" | "status" | "reported_date"
>;

type CommandAction = {
  id: string;
  title: string;
  detail: string;
  href: string;
  urgency: number;
  tone: "danger" | "warning" | "info";
  meta?: string;
};

const quickActions = [
  { label: "New Guest", href: "/admin/guests/new", icon: UserPlus },
  { label: "Assign Room", href: "/admin/guest-records?view=needs_review", icon: Hotel },
  { label: "Extend Stay", href: "/admin/guest-records?view=active", icon: CalendarDays },
  { label: "Add Charges", href: "/admin/guest-records?view=active", icon: Plus },
  { label: "Mark Payment", href: "/admin/guest-records?verification=payment", icon: Banknote },
];

function addDays(dateText: string, days: number) {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function actionTone(tone: CommandAction["tone"]) {
  if (tone === "danger") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-brand-sage bg-brand-ivory text-brand-deep";
}

function roomLabel(roomNames: Map<string, string>, roomId: string | null) {
  if (!roomId) {
    return "No unit assigned";
  }

  return roomNames.get(roomId) ?? "Assigned unit";
}

function getChargesByCheckin(charges: GuestCharge[]) {
  const chargesByCheckin = new Map<string, GuestCharge[]>();

  charges.forEach((charge) => {
    const guestCharges = chargesByCheckin.get(charge.guest_checkin_id) ?? [];
    guestCharges.push(charge);
    chargesByCheckin.set(charge.guest_checkin_id, guestCharges);
  });

  return chargesByCheckin;
}

function buildImmediateActions({
  checkins,
  chargesByCheckin,
  rejectedDocuments,
  maintenanceLogs,
  roomNames,
  today,
}: {
  checkins: Checkin[];
  chargesByCheckin: Map<string, GuestCharge[]>;
  rejectedDocuments: Set<string>;
  maintenanceLogs: MaintenanceLog[];
  roomNames: Map<string, string>;
  today: string;
}) {
  const actions: CommandAction[] = [];
  const openCheckins = checkins.filter((checkin) => checkin.status !== "checked_out");

  openCheckins
    .filter((checkin) => checkin.check_out_date === today)
    .forEach((checkin) => {
      actions.push({
        id: `due-out-${checkin.id}`,
        title: "Check-outs due today",
        detail: `${checkin.full_name} - ${roomLabel(roomNames, checkin.assigned_room_id)}`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 10,
        tone: "danger",
        meta: checkin.phone,
      });
    });

  openCheckins
    .filter((checkin) => checkin.check_in_date === today && !checkin.assigned_room_id)
    .forEach((checkin) => {
      actions.push({
        id: `arrival-room-${checkin.id}`,
        title: "Check-ins today without unit",
        detail: `${checkin.full_name} needs a unit before arrival`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 20,
        tone: "danger",
        meta: formatEnumLabel(checkin.booking_source),
      });
    });

  openCheckins
    .filter((checkin) => !checkin.cnic_verified || rejectedDocuments.has(checkin.id))
    .forEach((checkin) => {
      actions.push({
        id: `cnic-${checkin.id}`,
        title: "CNIC not verified",
        detail: `${checkin.full_name}${rejectedDocuments.has(checkin.id) ? " has a rejected document" : " needs identity verification"}`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 30,
        tone: "warning",
        meta: roomLabel(roomNames, checkin.assigned_room_id),
      });
    });

  openCheckins
    .filter((checkin) => !checkin.payment_verified)
    .forEach((checkin) => {
      actions.push({
        id: `payment-${checkin.id}`,
        title: "Payment not verified",
        detail: `${checkin.full_name} payment proof is pending`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 40,
        tone: "warning",
        meta: formatEnumLabel(checkin.payment_status),
      });
    });

  openCheckins.forEach((checkin) => {
    const financialSummary = getGuestFinancialSummary({
      checkin,
      charges: chargesByCheckin.get(checkin.id) ?? [],
    });

    if (financialSummary.outstanding > 0) {
      actions.push({
        id: `balance-${checkin.id}`,
        title: "Outstanding balances",
        detail: `${checkin.full_name} owes ${formatPkr(financialSummary.outstanding)}`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 50,
        tone: "warning",
        meta: roomLabel(roomNames, checkin.assigned_room_id),
      });
    }
  });

  maintenanceLogs.forEach((log) => {
    actions.push({
      id: `maintenance-${log.id}`,
      title: "Maintenance issues",
      detail: `${roomLabel(roomNames, log.room_id)} - ${log.issue_title}`,
      href: "/admin/maintenance",
      urgency: log.status === "reported" ? 60 : 70,
      tone: log.status === "reported" ? "warning" : "info",
      meta: formatEnumLabel(log.status),
    });
  });

  openCheckins
    .filter((checkin) => !checkin.check_out_date)
    .forEach((checkin) => {
      actions.push({
        id: `missing-checkout-${checkin.id}`,
        title: "Missing checkout date",
        detail: `${checkin.full_name} needs an expected departure date`,
        href: `/admin/guest-records/${checkin.id}`,
        urgency: 80,
        tone: "info",
        meta: roomLabel(roomNames, checkin.assigned_room_id),
      });
    });

  return actions.sort((a, b) => a.urgency - b.urgency);
}

function Metric({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-brand-deep">{value}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition hover:shadow-soft">
      {content}
    </Link>
  ) : (
    content
  );
}

export default async function CommandCentrePage() {
  const today = getBusinessTodayDate();
  const tomorrow = addDays(today, 1);
  const { supabase } = await requireRole(managementRoles);

  const [occupancy, reportInputs, checkinsResult, maintenanceResult, todayChargesResult] = await Promise.all([
    fetchOccupancySnapshot(supabase, today),
    fetchReportInputs(supabase, { preset: "custom", startDate: today, endDate: today, label: "Today" }),
    supabase
      .from("guest_checkins")
      .select(
        "id,full_name,phone,booking_source,check_in_date,check_out_date,status,assigned_room_id,cnic_verified,payment_verified,payment_status,payment_method,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr,issue_type,guest_tag",
      )
      .neq("status", "checked_out")
      .order("check_in_date", { ascending: true }),
    supabase
      .from("room_maintenance_logs")
      .select("id,room_id,issue_title,status,reported_date")
      .in("status", ["reported", "in_progress"])
      .order("reported_date", { ascending: true }),
    supabase
      .from("guest_charges")
      .select("guest_checkin_id,total_amount_pkr,is_paid,charged_at")
      .gte("charged_at", `${today}T00:00:00+05:00`)
      .lt("charged_at", `${tomorrow}T00:00:00+05:00`),
  ]);

  const checkins = (checkinsResult.data ?? []) as Checkin[];
  const checkinIds = checkins.map((checkin) => checkin.id);
  const [chargesResult, rejectedDocumentsResult] = checkinIds.length
    ? await Promise.all([
        supabase
          .from("guest_charges")
          .select("guest_checkin_id,total_amount_pkr,is_paid,charged_at")
          .in("guest_checkin_id", checkinIds),
        supabase
          .from("guest_documents")
          .select("checkin_id")
          .eq("document_status", "rejected")
          .in("checkin_id", checkinIds),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  const report = buildBusinessReport(reportInputs);
  const roomNames = new Map(occupancy.units.map((unit) => [unit.room.id, unit.unitLabel]));
  const charges = (chargesResult.data ?? []) as GuestCharge[];
  const chargesByCheckin = getChargesByCheckin(charges);
  const rejectedDocuments = new Set(((rejectedDocumentsResult.data ?? []) as RejectedDocument[]).map((document) => document.checkin_id));
  const maintenanceLogs = (maintenanceResult.data ?? []) as MaintenanceLog[];
  const actions = buildImmediateActions({
    checkins,
    chargesByCheckin,
    rejectedDocuments,
    maintenanceLogs,
    roomNames,
    today,
  });
  const checkInsToday = checkins.filter((checkin) => checkin.check_in_date === today);
  const checkOutsToday = checkins.filter((checkin) => checkin.check_out_date === today);
  const openOutstanding = checkins.reduce((sum, checkin) => {
    const summary = getGuestFinancialSummary({ checkin, charges: chargesByCheckin.get(checkin.id) ?? [] });
    return sum + summary.outstanding;
  }, 0);
  const newChargesToday = ((todayChargesResult.data ?? []) as GuestCharge[]).reduce((sum, charge) => sum + charge.total_amount_pkr, 0);
  const errors = [
    ...occupancy.errors,
    ...reportInputs.errors,
    checkinsResult.error?.message,
    maintenanceResult.error?.message,
    todayChargesResult.error?.message,
    chargesResult.error?.message,
    rejectedDocumentsResult.error?.message,
  ].filter((message): message is string => Boolean(message));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Daily operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Command Centre</h1>
            <p className="mt-2 text-sm text-slate-600">
              Action list for {today}: arrivals, departures, verification, balances, units, and maintenance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Back to admin</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/guests/new">
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                New Guest
              </Link>
            </Button>
          </div>
        </header>

        {errors.length > 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {errors.join(" ")}
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Immediate Actions</CardTitle>
                <CardDescription>Sorted by front-desk urgency.</CardDescription>
              </div>
              <Badge tone={actions.length ? "warning" : "success"}>{actions.length} open</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {actions.length ? (
                actions.map((action) => (
                  <Link
                    key={action.id}
                    href={action.href}
                    className={`block rounded-lg border p-4 transition hover:shadow-soft ${actionTone(action.tone)}`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{action.title}</p>
                        <p className="mt-1 text-sm">{action.detail}</p>
                        {action.meta ? <p className="mt-1 text-xs opacity-80">{action.meta}</p> : null}
                      </div>
                      <span className="text-sm font-semibold">Open</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  No urgent operational actions right now.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common staff flows.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {quickActions.map((action) => (
                <Button key={action.href} asChild variant="outline" className="justify-start">
                  <Link href={action.href}>
                    <action.icon className="h-4 w-4" aria-hidden="true" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Today Timeline</CardTitle>
              <CardDescription>{occupancy.summary.occupiedUnits} current in-house.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-deep">Check-ins today</h2>
                  <Badge tone="info">{checkInsToday.length}</Badge>
                </div>
                {checkInsToday.length ? (
                  checkInsToday.map((checkin) => (
                    <Link key={checkin.id} href={`/admin/guest-records/${checkin.id}`} className="block rounded-lg bg-brand-ivory p-3 text-sm">
                      <p className="font-semibold text-brand-deep">{checkin.full_name}</p>
                      <p className="text-slate-600">{roomLabel(roomNames, checkin.assigned_room_id)}</p>
                      <p className="text-xs text-slate-500">{formatEnumLabel(checkin.booking_source)}</p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg bg-brand-ivory p-3 text-sm text-slate-600">No arrivals scheduled.</p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-brand-deep">Check-outs today</h2>
                  <Badge tone="warning">{checkOutsToday.length}</Badge>
                </div>
                {checkOutsToday.length ? (
                  checkOutsToday.map((checkin) => (
                    <Link key={checkin.id} href={`/admin/guest-records/${checkin.id}`} className="block rounded-lg bg-brand-ivory p-3 text-sm">
                      <p className="font-semibold text-brand-deep">{checkin.full_name}</p>
                      <p className="text-slate-600">{roomLabel(roomNames, checkin.assigned_room_id)}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-500">
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                        Mark checked-out from guest record
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-lg bg-brand-ivory p-3 text-sm text-slate-600">No departures due.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Unit Snapshot</CardTitle>
                <CardDescription>Live 11-unit operational position.</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/occupancy">Open occupancy</Link>
              </Button>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Metric label="Total units" value={occupancy.summary.totalUnits} href="/admin/occupancy" />
              <Metric label="Occupied" value={occupancy.summary.occupiedUnits} href="/admin/occupancy" />
              <Metric label="Vacant" value={occupancy.summary.vacantUnits} href="/admin/occupancy" />
              <Metric label="Maintenance" value={occupancy.summary.maintenanceUnits} href="/admin/occupancy" />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Money Snapshot</CardTitle>
              <CardDescription>
                Simple operating-day totals. Expenses today: {formatPkr(report.kpis.totalExpenses)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Metric label="Today's collected" value={formatPkr(report.kpis.totalRevenue)} />
              <Metric label="Outstanding" value={formatPkr(openOutstanding)} />
              <Metric label="New charges" value={formatPkr(newChargesToday)} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
