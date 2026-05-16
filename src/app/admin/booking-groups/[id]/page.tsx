import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, MessageCircle, Plus, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusTone,
  formatEnumLabel,
  formatPkr,
  formatUnitRoomLabel,
  getCheckinStatusLabel,
  getGuestFinancialSummary,
  getWhatsAppGuestHref,
  roomCleaningStatusLabels,
} from "@/lib/check-in/options";
import { formatStayRangeWithNights, getStayNights } from "@/lib/check-in/stay-dates";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Lead Booking",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

type LinkedStay = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "full_name"
  | "phone"
  | "assigned_room_id"
  | "check_in_date"
  | "check_out_date"
  | "status"
  | "cnic_verified"
  | "payment_verified"
  | "payment_status"
  | "total_expected_amount_pkr"
  | "agreed_room_rate_pkr"
  | "amount_paid_pkr"
>;
type Room = Pick<
  Database["public"]["Tables"]["rooms"]["Row"],
  "id" | "unit_number" | "name" | "status" | "cleaning_status"
>;

function findLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T) {
  return options.find((option) => option.value === value)?.label ?? formatEnumLabel(value);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-brand-ivory p-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-brand-deep">{value || "Not provided"}</dd>
    </div>
  );
}

function getRatePerNightLabel(stay: {
  check_in_date: string;
  check_out_date: string | null;
  agreed_room_rate_pkr: number | null;
  total_expected_amount_pkr: number | null;
}) {
  if (stay.agreed_room_rate_pkr && stay.agreed_room_rate_pkr > 0) {
    return `${formatPkr(stay.agreed_room_rate_pkr)} / night`;
  }

  const nights = getStayNights(stay.check_in_date, stay.check_out_date);
  if (nights && stay.total_expected_amount_pkr && stay.total_expected_amount_pkr > 0) {
    return `${formatPkr(Math.round(stay.total_expected_amount_pkr / nights))} / night`;
  }

  return "Not available";
}

function getRoomReadiness(room: Room | null) {
  if (!room) {
    return { label: "Room to be assigned", tone: "warning" as const };
  }

  if (room.status !== "active") {
    return { label: "Maintenance Blocked", tone: "danger" as const };
  }

  if (room.cleaning_status === "ready") {
    return { label: "Ready for Arrival", tone: "success" as const };
  }

  return { label: roomCleaningStatusLabels[room.cleaning_status], tone: "warning" as const };
}

export default async function LeadBookingPage({ params }: PageProps) {
  const { id } = await params;
  const { supabase } = await requireRole(managementRoles);

  const [{ data: bookingGroup, error: bookingGroupError }, { data: linkedStays }, { data: rooms }] = await Promise.all([
    supabase.from("booking_groups").select("*").eq("id", id).single(),
    supabase
      .from("guest_checkins")
      .select(
        "id,full_name,phone,assigned_room_id,check_in_date,check_out_date,status,cnic_verified,payment_verified,payment_status,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr",
      )
      .eq("booking_group_id", id)
      .order("check_in_date", { ascending: true }),
    supabase.from("rooms").select("id,unit_number,name,status,cleaning_status").order("unit_number", { nullsFirst: false }),
  ]);

  if (bookingGroupError || !bookingGroup) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Lead Booking not found</CardTitle>
              <CardDescription>{bookingGroupError?.message ?? "This Lead Booking may have been removed."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/guest-records">Back to Guest Stays</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const stays = (linkedStays ?? []) as LinkedStay[];
  const roomById = new Map((rooms ?? []).map((room) => [room.id, room as Room]));
  const stayIds = stays.map((stay) => stay.id);
  const { data: linkedCharges } = stayIds.length
    ? await supabase.from("guest_charges").select("guest_checkin_id,total_amount_pkr,is_paid").in("guest_checkin_id", stayIds)
    : { data: [] };
  const linkedChargesByStay = new Map<string, Array<{ total_amount_pkr: number; is_paid: boolean }>>();
  (linkedCharges ?? []).forEach((charge) => {
    const stayCharges = linkedChargesByStay.get(charge.guest_checkin_id) ?? [];
    stayCharges.push(charge);
    linkedChargesByStay.set(charge.guest_checkin_id, stayCharges);
  });

  const staySummaries = stays.map((stay) => ({
    stay,
    summary: getGuestFinancialSummary({
      checkin: stay,
      charges: linkedChargesByStay.get(stay.id) ?? [],
    }),
    room: stay.assigned_room_id ? roomById.get(stay.assigned_room_id) ?? null : null,
    nights: getStayNights(stay.check_in_date, stay.check_out_date) ?? 0,
  }));
  const linkedTotals = staySummaries.reduce(
    (totals, item) => ({
      expected: totals.expected + item.summary.totalExpected,
      paid: totals.paid + item.summary.totalPaid,
      balanceDue: totals.balanceDue + item.summary.outstanding,
      nights: totals.nights + item.nights,
    }),
    { expected: 0, paid: 0, balanceDue: 0, nights: 0 },
  );
  const averageRatePerNight = linkedTotals.nights > 0 ? Math.round(linkedTotals.expected / linkedTotals.nights) : null;
  const leadStay = stays.find((stay) => stay.phone === bookingGroup.lead_guest_phone) ?? stays[0] ?? null;
  const roomsNeedingReadiness = staySummaries.filter((item) => getRoomReadiness(item.room).tone !== "success");
  const staysMissingId = stays.filter((stay) => !stay.cnic_verified);
  const staysMissingPaymentConfirmation = stays.filter((stay) => !stay.payment_verified);
  const staysWithNeedsAttention = stays.filter((stay) => stay.status === "issue");
  const overallStatus = staysWithNeedsAttention.length
    ? { label: "Needs Attention", tone: "danger" as const }
    : linkedTotals.balanceDue > 0
      ? { label: "Payment Follow-up", tone: "warning" as const }
      : staysMissingId.length || staysMissingPaymentConfirmation.length
        ? { label: "Missing ID/Payment Confirmation", tone: "warning" as const }
        : roomsNeedingReadiness.length
          ? { label: "Room Not Ready", tone: "warning" as const }
          : { label: "Ready", tone: "success" as const };
  const leadMessage = `Hello ${bookingGroup.lead_guest_name}, this is GreenLux Residency. We are reviewing your Lead Booking and linked room stays. Our team will coordinate any Balance Due, ID Verification, or Payment Confirmation items with you.`;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/guest-records">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Guest Stays
          </Link>
        </Button>

        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Lead Booking</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">{bookingGroup.lead_guest_name}</h1>
            <p className="mt-2 text-sm text-slate-600">This person is responsible for the linked booking.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={overallStatus.tone}>{overallStatus.label}</Badge>
            <Badge tone="info">{stays.length} Linked Room Stays</Badge>
          </div>
        </header>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Lead Guest / Responsible Booker</CardTitle>
              <CardDescription>Lead booking context only. Each linked Guest Stay remains its own operational record.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={`/admin/guests/new?bookingGroupId=${bookingGroup.id}`}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Room to This Lead Booking
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={getWhatsAppGuestHref(bookingGroup.lead_guest_phone, leadMessage)} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Message Lead Guest
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow label="Lead guest/booker name" value={bookingGroup.lead_guest_name} />
              <InfoRow label="Lead phone/contact" value={bookingGroup.lead_guest_phone} />
              <InfoRow label="Lead email" value={bookingGroup.lead_guest_email} />
              <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, bookingGroup.booking_source)} />
              <InfoRow label="Lead document / ID status" value={leadStay ? <Badge tone={leadStay.cnic_verified ? "success" : "warning"}>ID Verification {leadStay.cnic_verified ? "Verified" : "Needs Review"}</Badge> : "No linked stay yet"} />
              <InfoRow label="Overall status" value={<Badge tone={overallStatus.tone}>{overallStatus.label}</Badge>} />
              <InfoRow label="Linked rooms/stays" value={stays.length} />
              <InfoRow label="Lead booking dates" value={formatStayRangeWithNights(bookingGroup.check_in_date, bookingGroup.check_out_date)} />
            </dl>
            {bookingGroup.notes ? (
              <div className="rounded-lg bg-brand-ivory p-3">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Overall booking notes</dt>
                <dd className="mt-1 text-sm leading-6 text-brand-deep">{bookingGroup.notes}</dd>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Booking Financial Summary</CardTitle>
            <CardDescription>
              Totals are derived from linked Guest Stays. Reports calculate revenue from individual Guest Stays to avoid double-counting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <InfoRow label="Total expected from linked room stays" value={formatPkr(linkedTotals.expected)} />
              <InfoRow label="Total amount paid across linked room stays" value={formatPkr(linkedTotals.paid)} />
              <InfoRow label="Total Balance Due across linked room stays" value={formatPkr(linkedTotals.balanceDue)} />
              <InfoRow label="Total linked nights" value={linkedTotals.nights} />
              <InfoRow label="Average rate/night" value={averageRatePerNight === null ? "Not available" : formatPkr(averageRatePerNight)} />
            </dl>
            <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4">
              <p className="font-semibold text-brand-deep">Lead Booking Reference Total</p>
              <p className="mt-1 text-sm text-slate-600">
                Reference only. These booking_group totals are not used as revenue truth.
              </p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <InfoRow label="Reference expected" value={formatPkr(bookingGroup.expected_total_amount)} />
                <InfoRow label="Reference paid" value={formatPkr(bookingGroup.paid_total_amount)} />
                <InfoRow
                  label="Reference Balance Due"
                  value={bookingGroup.expected_total_amount === null ? "Not set" : formatPkr(Math.max(bookingGroup.expected_total_amount - (bookingGroup.paid_total_amount ?? 0), 0))}
                />
              </dl>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linked Room Stays</CardTitle>
            <CardDescription>Each room remains individually trackable with its own dates, rate, Balance Due, status, and actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {staysWithNeedsAttention.length || linkedTotals.balanceDue > 0 || staysMissingId.length || staysMissingPaymentConfirmation.length || roomsNeedingReadiness.length ? (
              <div className="grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:grid-cols-2 lg:grid-cols-5">
                <span>Balance Due: {formatPkr(linkedTotals.balanceDue)}</span>
                <span>ID Verification needed: {staysMissingId.length}</span>
                <span>Payment Confirmation needed: {staysMissingPaymentConfirmation.length}</span>
                <span>Rooms not Ready for Arrival: {roomsNeedingReadiness.length}</span>
                <span>Needs Attention: {staysWithNeedsAttention.length}</span>
              </div>
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                All linked room stays are Ready for Arrival from the visible checks.
              </div>
            )}

            {staySummaries.length ? (
              <div className="overflow-x-auto rounded-lg border border-brand-sage">
                <table className="w-full min-w-[1120px] text-left text-sm">
                  <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                    <tr>
                      <th className="px-4 py-3">Room / Suite</th>
                      <th className="px-4 py-3">Occupant / Guest Stay</th>
                      <th className="px-4 py-3">Stay Period</th>
                      <th className="px-4 py-3">Rate / Night</th>
                      <th className="px-4 py-3">Expected</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-4 py-3">Balance Due</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3">Room Readiness</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sage/70">
                    {staySummaries.map(({ stay, summary, room }) => {
                      const readiness = getRoomReadiness(room);
                      return (
                        <tr key={stay.id} className="bg-white align-top">
                          <td className="px-4 py-3">{room ? formatUnitRoomLabel(room) : "Not assigned"}</td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/guest-records/${stay.id}`} className="font-semibold text-brand-deep underline-offset-2 hover:underline">
                              {stay.full_name}
                            </Link>
                            <div className="mt-2">
                              <Badge tone={checkinStatusTone[stay.status]}>{getCheckinStatusLabel(stay.status)}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">{formatStayRangeWithNights(stay.check_in_date, stay.check_out_date)}</td>
                          <td className="px-4 py-3">{getRatePerNightLabel(stay)}</td>
                          <td className="px-4 py-3">{formatPkr(summary.totalExpected)}</td>
                          <td className="px-4 py-3">{formatPkr(summary.totalPaid)}</td>
                          <td className="px-4 py-3">
                            <Badge tone={summary.outstanding > 0 ? "warning" : "success"}>{formatPkr(summary.outstanding)}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <Badge tone={stay.cnic_verified ? "success" : "warning"}>ID Verification {stay.cnic_verified ? "Verified" : "Needs Review"}</Badge>
                              <Badge tone={stay.payment_verified ? "success" : "warning"}>
                                Payment Confirmation {stay.payment_verified ? "Verified" : "Needs Review"}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge tone={readiness.tone}>{readiness.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/guest-records/${stay.id}`}>Open Guest Stay</Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/guest-records/${stay.id}/receipt`}>
                                  <FileText className="h-4 w-4" aria-hidden="true" />
                                  View Receipt
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/guest-records/${stay.id}/receipt?print=1`}>
                                  <Printer className="h-4 w-4" aria-hidden="true" />
                                  Print / Download Receipt
                                </Link>
                              </Button>
                              <Button asChild size="sm" variant="outline">
                                <a href={getWhatsAppGuestHref(stay.phone || bookingGroup.lead_guest_phone, leadMessage)} target="_blank" rel="noreferrer">
                                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                                  Message Lead Guest / Guest
                                </a>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-slate-600">
                No linked Guest Stays yet. Use Add Room to This Lead Booking to create the first room stay.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deferred Lead Booking Actions</CardTitle>
            <CardDescription>Kept intentionally separate to protect room/stay-level truth.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-brand-ivory p-3">Bulk checkout is not available here.</div>
            <div className="rounded-lg bg-brand-ivory p-3">Bulk payment allocation is not available here.</div>
            <div className="rounded-lg bg-brand-ivory p-3">Combined group receipt can be added later.</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
