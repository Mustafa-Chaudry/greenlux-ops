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
import { formatDisplayDate, formatStayRangeWithNights, getStayNights } from "@/lib/check-in/stay-dates";
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
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-950">{value || "Not provided"}</dd>
    </div>
  );
}

function money(value: number | null | undefined) {
  return value === null || value === undefined ? "Not set" : formatPkr(value);
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
  const receiptMessage = `Hello ${record.full_name}, your GreenLux Accommodation Receipt is ready. Our team can share the receipt PDF here.`;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <style>{`
        @media print {
          .receipt-actions { display: none !important; }
          .receipt-sheet { box-shadow: none !important; border: 0 !important; max-width: none !important; }
          body { background: #ffffff !important; }
        }
      `}</style>
      <div className="receipt-actions mx-auto mb-5 flex max-w-5xl flex-wrap gap-2">
        <Button asChild variant="ghost">
          <Link href={`/admin/guest-records/${record.id}`}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guest record
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

      <article className="receipt-sheet mx-auto max-w-5xl border border-slate-200 bg-white p-8 shadow-sm print:p-0">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">{siteConfig.name}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold text-slate-950">Accommodation Receipt</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Professional stay receipt for accommodation records and workplace reimbursement.
            </p>
          </div>
          <dl className="grid gap-2 text-right text-sm">
            <ReceiptField label="Receipt reference" value={receiptReference(record)} />
            <ReceiptField label="Issue date" value={new Date().toLocaleDateString("en-GB")} />
          </dl>
        </header>

        <section className="grid gap-5 border-b border-slate-200 py-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Business</h2>
            <p className="mt-3 text-lg font-semibold text-slate-950">{siteConfig.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">{siteConfig.addressLine}</p>
            <p className="text-sm leading-6 text-slate-600">{siteConfig.phoneDisplay}</p>
            <p className="text-sm leading-6 text-slate-600">{siteConfig.email}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Guest</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <ReceiptField label="Guest name" value={record.full_name} />
              <ReceiptField label="Phone" value={record.phone} />
              <ReceiptField label="Email" value={record.email} />
              <ReceiptField label="Guests" value={record.number_of_guests} />
            </dl>
          </div>
        </section>

        <section className="border-b border-slate-200 py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Stay details</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReceiptField label="Room / unit" value={assignedRoom ? formatUnitRoomLabel(assignedRoom) : "To be assigned"} />
            <ReceiptField label="Room type" value={assignedRoom ? formatEnumLabel(assignedRoom.type) : null} />
            <ReceiptField label="Booking source" value={findLabel(bookingSourceOptions, record.booking_source)} />
            <ReceiptField label="Stay status" value={getCheckinStatusLabel(record.status)} />
            <ReceiptField label="Check-in date" value={formatDisplayDate(record.check_in_date)} />
            <ReceiptField label="Check-out date" value={formatDisplayDate(record.check_out_date)} />
            <ReceiptField label="Stay dates" value={formatStayRangeWithNights(record.check_in_date, record.check_out_date)} />
            <ReceiptField label="Number of nights" value={stayNights === null ? "Not set" : `${stayNights} ${stayNights === 1 ? "night" : "nights"}`} />
          </dl>
        </section>

        {bookingGroup ? (
          <section className="border-b border-slate-200 py-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Multi-room booking reference</h2>
              <Badge tone="info">Part of multi-room booking</Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This receipt covers the room/stay listed above. Linked rooms may have separate receipts unless a combined receipt is issued.
            </p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ReceiptField label="Lead guest/contact" value={`${bookingGroup.lead_guest_name} - ${bookingGroup.lead_guest_phone}`} />
              <ReceiptField label="Lead email" value={bookingGroup.lead_guest_email} />
              <ReceiptField label="Lead booking dates" value={formatStayRangeWithNights(bookingGroup.check_in_date, bookingGroup.check_out_date)} />
              <ReceiptField label="Lead source" value={findLabel(bookingSourceOptions, bookingGroup.booking_source)} />
            </dl>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-950">Linked rooms/stays</p>
              {linkedStays.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                    <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="py-2 pr-3">Guest / stay</th>
                        <th className="py-2 pr-3">Room</th>
                        <th className="py-2 pr-3">Dates</th>
                        <th className="py-2 pr-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linkedStays.map((stay) => (
                        <tr key={stay.id}>
                          <td className="py-2 pr-3 font-medium text-slate-950">{stay.full_name}</td>
                          <td className="py-2 pr-3">{stay.assigned_room_id ? linkedRoomNames.get(stay.assigned_room_id) ?? "Assigned unit" : "To be assigned"}</td>
                          <td className="py-2 pr-3">{formatStayRangeWithNights(stay.check_in_date, stay.check_out_date)}</td>
                          <td className="py-2 pr-3">
                            <Badge tone={checkinStatusTone[stay.status]}>{getCheckinStatusLabel(stay.status)}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No linked stays found.</p>
              )}
            </div>
          </section>
        ) : null}

        <section className="py-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Financial summary</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Description</th>
                  <th className="py-2 pr-3">Quantity</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 pr-3 font-medium text-slate-950">Room/stay charge</td>
                  <td className="py-3 pr-3">{stayNights === null ? 1 : stayNights}</td>
                  <td className="py-3 pr-3">Stay amount</td>
                  <td className="py-3 text-right">{money(financialSummary.baseExpected)}</td>
                </tr>
                {guestCharges.map((charge) => (
                  <tr key={charge.id}>
                    <td className="py-3 pr-3 font-medium text-slate-950">
                      {getGuestChargeLabel(charge.charge_type)}
                      {charge.description ? <span className="block text-xs font-normal text-slate-500">{charge.description}</span> : null}
                    </td>
                    <td className="py-3 pr-3">{charge.quantity}</td>
                    <td className="py-3 pr-3">{charge.is_paid ? "Paid" : "Unpaid"}</td>
                    <td className="py-3 text-right">{formatPkr(charge.total_amount_pkr)}</td>
                  </tr>
                ))}
                {!guestCharges.length ? (
                  <tr>
                    <td className="py-3 pr-3 text-slate-600" colSpan={4}>Additional charges: none recorded.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <dl className="ml-auto mt-6 grid max-w-md gap-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Additional charges</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.chargesTotal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Total amount</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.totalExpected)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="font-medium text-slate-600">Amount paid</dt>
              <dd className="font-semibold text-slate-950">{formatPkr(financialSummary.totalPaid)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-lg">
              <dt className="font-semibold text-slate-950">Outstanding balance</dt>
              <dd className="font-bold text-slate-950">{formatPkr(financialSummary.outstanding)}</dd>
            </div>
          </dl>

          <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-3">
            <ReceiptField label="Payment method" value={findLabel(paymentMethodOptions, record.payment_method)} />
            <ReceiptField label="Payment status" value={findLabel(paymentStatusOptions, record.payment_status)} />
            <ReceiptField label="Payment proof" value={record.payment_verified ? "Verified" : "Pending / not verified"} />
          </dl>
        </section>

        <footer className="border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
          <p>
            Receipt generated from GreenLux Ops stay records. Room readiness, cleaning, documents, and operational status remain managed on the guest record.
          </p>
        </footer>
      </article>
    </main>
  );
}
