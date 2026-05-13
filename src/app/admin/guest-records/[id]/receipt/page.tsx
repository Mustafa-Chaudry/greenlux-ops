import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { PrintButton } from "@/components/admin/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusTone,
  formatEnumLabel,
  formatPkr,
  formatUnitRoomLabel,
  getCheckinStatusLabel,
  getGuestChargeLabel,
  getGuestFinancialSummary,
  getWhatsAppGuestHref,
  paymentMethodOptions,
  paymentStatusOptions,
} from "@/lib/check-in/options";
import { formatStayRangeWithNights, getStayNights } from "@/lib/check-in/stay-dates";
import { siteConfig } from "@/lib/site/config";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Accommodation Receipt",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
};

type GuestCharge = Database["public"]["Tables"]["guest_charges"]["Row"];
type Checkin = Database["public"]["Tables"]["guest_checkins"]["Row"];
type Room = Pick<Database["public"]["Tables"]["rooms"]["Row"], "id" | "unit_number" | "name" | "type">;
type BookingGroup = Pick<
  Database["public"]["Tables"]["booking_groups"]["Row"],
  "id" | "lead_guest_name" | "lead_guest_phone" | "lead_guest_email" | "booking_source" | "check_in_date" | "check_out_date"
>;
type LinkedStay = Pick<Checkin, "id" | "full_name" | "assigned_room_id" | "check_in_date" | "check_out_date" | "status">;

function findLabel<T extends string>(options: Array<{ value: T; label: string }>, value: T) {
  return options.find((option) => option.value === value)?.label ?? formatEnumLabel(value);
}

function receiptReference(record: Pick<Checkin, "id" | "check_in_date">) {
  return `GLR-${record.check_in_date.replaceAll("-", "")}-${record.id.slice(0, 8).toUpperCase()}`;
}

function ReceiptField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-950">{value || "Not provided"}</dd>
    </div>
  );
}

function receiptStayStatusLabel(status: Checkin["status"]) {
  const labels: Record<Checkin["status"], string> = {
    submitted: "Details Received",
    under_review: "Pending Team Review",
    approved: "Approved for Arrival",
    checked_in: "In Residence",
    checked_out: "Stay Completed",
    issue: "Needs Attention",
  };

  return labels[status] ?? getCheckinStatusLabel(status);
}

function paymentConfirmationLabel(verified: boolean) {
  return verified ? "Confirmed" : "Pending team confirmation";
}

function money(value: number | null | undefined) {
  return value === null || value === undefined ? "Not set" : formatPkr(value);
}

/** Build a clean room description like "Executive Room — Unit 10" without duplicating the unit number. */
function roomDescription(room: Room | null) {
  if (!room) return "Accommodation";
  const typeName = formatEnumLabel(room.type);
  if (room.unit_number) {
    return `${typeName} — Unit ${room.unit_number}`;
  }
  return `${typeName} — ${room.name}`;
}

/** Display-only rate per night. Returns null if it cannot be safely calculated. */
function ratePerNight(baseAmount: number | null | undefined, nights: number | null) {
  if (baseAmount === null || baseAmount === undefined || !nights || nights <= 0) return null;
  return Math.round(baseAmount / nights);
}

export default async function AccommodationReceiptPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const { supabase } = await requireRole(managementRoles);

  const [{ data: record, error: recordError }, { data: charges }] = await Promise.all([
    supabase.from("guest_checkins").select("*").eq("id", id).single(),
    supabase.from("guest_charges").select("*").eq("guest_checkin_id", id).order("charged_at", { ascending: true }),
  ]);

  if (recordError || !record) {
    notFound();
  }

  const roomIds = [record.assigned_room_id].filter((roomId): roomId is string => Boolean(roomId));
  const [{ data: rooms }, bookingGroupResult, linkedStaysResult] = await Promise.all([
    roomIds.length ? supabase.from("rooms").select("id,unit_number,name,type").in("id", roomIds) : Promise.resolve({ data: [] }),
    record.booking_group_id
      ? supabase
          .from("booking_groups")
          .select("id,lead_guest_name,lead_guest_phone,lead_guest_email,booking_source,check_in_date,check_out_date")
          .eq("id", record.booking_group_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    record.booking_group_id
      ? supabase
          .from("guest_checkins")
          .select("id,full_name,assigned_room_id,check_in_date,check_out_date,status")
          .eq("booking_group_id", record.booking_group_id)
          .order("check_in_date", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const guestCharges = (charges ?? []) as GuestCharge[];
  const assignedRoom = ((rooms ?? []) as Room[]).find((room) => room.id === record.assigned_room_id) ?? null;
  const bookingGroup = (bookingGroupResult.data ?? null) as BookingGroup | null;
  const linkedStays = (linkedStaysResult.data ?? []) as LinkedStay[];
  const linkedRoomIds = Array.from(new Set(linkedStays.map((stay) => stay.assigned_room_id).filter((roomId): roomId is string => Boolean(roomId))));
  const { data: linkedRooms } = linkedRoomIds.length
    ? await supabase.from("rooms").select("id,unit_number,name,type").in("id", linkedRoomIds)
    : { data: [] };
  const linkedRoomNames = new Map(((linkedRooms ?? []) as Room[]).map((room) => [room.id, formatUnitRoomLabel(room)]));
  const financialSummary = getGuestFinancialSummary({ checkin: record, charges: guestCharges });
  const stayNights = getStayNights(record.check_in_date, record.check_out_date);
  const nightsLabel = stayNights === null ? "Not set" : `${stayNights} ${stayNights === 1 ? "night" : "nights"}`;
  const perNight = ratePerNight(financialSummary.baseExpected, stayNights);
  const receiptMessage = `Hello ${record.full_name}, your GreenLux Residency Accommodation Receipt is ready. Our team can share the PDF here for your records or workplace reimbursement. Thank you for choosing GreenLux Residency.`;

  return (
    <main className="receipt-page min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <style>{`
        @page {
          size: A4;
          margin: 10mm 12mm;
        }

        @media print {
          body {
            background: #ffffff !important;
            font-size: 13px !important;
          }

          body * {
            visibility: visible !important;
          }

          .receipt-actions {
            display: none !important;
          }

          .receipt-page {
            min-height: auto !important;
            background: #ffffff !important;
            padding: 0 !important;
          }

          .receipt-sheet {
            width: 100% !important;
            max-width: none !important;
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }

          .print-avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="receipt-actions mx-auto mb-5 flex max-w-4xl flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link href={`/admin/guest-records/${record.id}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guest stay
          </Link>
        </Button>
        <PrintButton label="Print / Download Receipt" autoPrint={queryParams.print === "1"} />
        <Button asChild variant="outline">
          <a href={getWhatsAppGuestHref(record.phone, receiptMessage)} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Send receipt via WhatsApp
          </a>
        </Button>
      </div>

      <article className="receipt-sheet mx-auto max-w-4xl border border-slate-200 bg-white p-8 shadow-sm">
        {/* ── Compact letterhead ── */}
        <header className="print-avoid-break border-b-2 border-slate-950 pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-slate-950 font-serif text-sm font-semibold tracking-[0.12em] text-slate-950">
                GLR
              </div>
              <div className="text-sm leading-5 text-slate-600">
                <p className="font-semibold text-slate-950">GreenLux Residency</p>
                <p>{siteConfig.addressLine}</p>
                <p>{siteConfig.phoneDisplay} · {siteConfig.email}</p>
              </div>
            </div>
            <dl className="shrink-0 text-right text-xs">
              <div>
                <dt className="inline text-slate-500">Ref: </dt>
                <dd className="inline font-medium text-slate-950">{receiptReference(record)}</dd>
              </div>
              <div className="mt-0.5">
                <dt className="inline text-slate-500">Date: </dt>
                <dd className="inline font-medium text-slate-950">{new Date().toLocaleDateString("en-GB")}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-3 text-center">
            <h1 className="font-serif text-3xl font-semibold text-slate-950">Receipt</h1>
            <p className="mt-1 text-xs text-slate-500">Accommodation receipt for stay records and workplace reimbursement.</p>
          </div>
        </header>

        {/* ── Prepared for + Stay details ── */}
        <section className="print-avoid-break grid gap-3 border-b border-slate-200 py-3 sm:grid-cols-2">
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Prepared for</h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              <ReceiptField label="Guest Name" value={record.full_name} />
              <ReceiptField label="Phone" value={record.phone} />
              <ReceiptField label="Email" value={record.email} />
              <ReceiptField label="Guests" value={record.number_of_guests} />
            </dl>
          </div>
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Stay Details</h2>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              <ReceiptField label="Room / Suite" value={assignedRoom ? formatUnitRoomLabel(assignedRoom) : "To be assigned"} />
              <ReceiptField label="Room Type" value={assignedRoom ? formatEnumLabel(assignedRoom.type) : null} />
              <ReceiptField label="Stay Period" value={formatStayRangeWithNights(record.check_in_date, record.check_out_date)} />
              <ReceiptField label="Stay Status" value={receiptStayStatusLabel(record.status)} />
            </dl>
          </div>
        </section>

        {/* ── Multi-room booking reference (conditional) ── */}
        {bookingGroup ? (
          <section className="print-avoid-break border-b border-slate-200 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Multi-Room Booking Reference</h2>
              <Badge tone="info">Part of a multi-room booking</Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              This receipt covers the room/stay listed above. Linked rooms may have separate receipts unless a combined receipt is issued.
            </p>
            <dl className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ReceiptField label="Lead Guest / Contact" value={`${bookingGroup.lead_guest_name} - ${bookingGroup.lead_guest_phone}`} />
              <ReceiptField label="Lead Email" value={bookingGroup.lead_guest_email} />
              <ReceiptField label="Lead Stay Period" value={formatStayRangeWithNights(bookingGroup.check_in_date, bookingGroup.check_out_date)} />
              <ReceiptField label="Lead Source" value={findLabel(bookingSourceOptions, bookingGroup.booking_source)} />
            </dl>
            <div className="mt-2">
              <p className="text-xs font-semibold text-slate-950">Linked rooms/stays</p>
              {linkedStays.length ? (
                <div className="mt-1 overflow-x-auto">
                  <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                    <thead className="border-y border-slate-300 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="py-1.5 pr-3">Guest Stay</th>
                        <th className="py-1.5 pr-3">Room / Suite</th>
                        <th className="py-1.5 pr-3">Stay Period</th>
                        <th className="py-1.5 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {linkedStays.map((stay) => (
                        <tr key={stay.id}>
                          <td className="py-1.5 pr-3 font-medium text-slate-950">{stay.full_name}</td>
                          <td className="py-1.5 pr-3">{stay.assigned_room_id ? linkedRoomNames.get(stay.assigned_room_id) ?? "Assigned unit" : "To be assigned"}</td>
                          <td className="py-1.5 pr-3">{formatStayRangeWithNights(stay.check_in_date, stay.check_out_date)}</td>
                          <td className="py-1.5 pr-3">
                            <Badge tone={checkinStatusTone[stay.status]}>{receiptStayStatusLabel(stay.status)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-1 text-xs text-slate-600">No linked stays found.</p>
              )}
            </div>
          </section>
        ) : null}

        {/* ── Financial Summary ── */}
        <section className="border-b border-slate-200 py-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Financial Summary</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="border-y border-slate-300 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="py-1.5 pr-3">Description</th>
                  <th className="py-1.5 pr-3">Qty / Nights</th>
                  <th className="py-1.5 pr-3">Rate / Night</th>
                  <th className="py-1.5 pr-3">Details</th>
                  <th className="py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 pr-3 font-medium text-slate-950">{roomDescription(assignedRoom)}</td>
                  <td className="py-2 pr-3">{nightsLabel}</td>
                  <td className="py-2 pr-3">{perNight !== null ? formatPkr(perNight) : "—"}</td>
                  <td className="py-2 pr-3">Accommodation</td>
                  <td className="py-2 text-right">{money(financialSummary.baseExpected)}</td>
                </tr>
                {guestCharges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="py-2 pr-3 font-medium text-slate-950">
                      {getGuestChargeLabel(charge.charge_type)}
                      {charge.description ? <span className="block text-xs font-normal text-slate-500">{charge.description}</span> : null}
                    </td>
                    <td className="py-2 pr-3">{charge.quantity}</td>
                    <td className="py-2 pr-3">—</td>
                    <td className="py-2 pr-3">{charge.is_paid ? "Paid" : "Unpaid"}</td>
                    <td className="py-2 text-right">{formatPkr(charge.total_amount_pkr)}</td>
                  </tr>
                ))}
                {!guestCharges.length ? (
                  <tr>
                    <td className="py-2 pr-3 text-slate-500 italic" colSpan={5}>No additional charges recorded.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <dl className="print-avoid-break ml-auto mt-3 grid max-w-sm gap-1.5 border border-slate-300 p-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Accommodation Charges</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.baseExpected)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Additional Charges</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.chargesTotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2">
              <dt className="font-medium text-slate-600">Total Amount</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.totalExpected)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Amount Paid</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.totalPaid)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t-2 border-slate-950 pt-2 text-base">
              <dt className="font-semibold text-slate-950">Balance Due</dt>
              <dd className="font-bold text-slate-950">{formatPkr(financialSummary.outstanding)}</dd>
            </div>
          </dl>
        </section>

        {/* ── Payment Details ── */}
        <section className="print-avoid-break border-b border-slate-200 py-3">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Payment Details</h2>
          <dl className="mt-2 grid gap-3 sm:grid-cols-3">
            <ReceiptField label="Payment Method" value={findLabel(paymentMethodOptions, record.payment_method)} />
            <ReceiptField label="Payment Status" value={findLabel(paymentStatusOptions, record.payment_status)} />
            <ReceiptField label="Payment Confirmation" value={paymentConfirmationLabel(record.payment_verified)} />
          </dl>
        </section>

        {/* ── Footer ── */}
        <footer className="pt-3 text-xs leading-5 text-slate-500">
          <p>This receipt is prepared from GreenLux Residency stay records for accommodation and reimbursement purposes.</p>
          <p className="mt-1 text-slate-600">Thank you for choosing GreenLux Residency.</p>
        </footer>
      </article>
    </main>
  );
}
