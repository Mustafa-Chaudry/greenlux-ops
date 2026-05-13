import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, LogIn, LogOut, MessageCircle, Printer, TriangleAlert } from "lucide-react";
import {
  createBookingGroupFromGuestRecord,
  createGuestCharge,
  extendGuestStay,
  markGuestChargePaid,
  updateCheckinStatus,
  updateGuestDocumentStatus,
  updateGuestRecord,
  uploadGuestRecordDocuments,
} from "@/app/admin/guest-records/actions";
import { ExceptionCheckinButton } from "@/components/admin/exception-checkin-button";
import { PrintButton } from "@/components/admin/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusTone,
  documentStatusOptions,
  formatEnumLabel,
  formatPkr,
  formatUnitRoomLabel,
  getApprovalMissingRequirements,
  getCheckinStatusLabel,
  getDocumentStatusLabel,
  getGuestChargeLabel,
  getGuestFinancialSummary,
  getIssueTypeLabel,
  getWhatsAppGuestHref,
  guestChargeOptions,
  guestTagOptions,
  guestTypeOptions,
  issueTypeOptions,
  isReadyForCheckin,
  isReadyToApprove,
  maskSensitiveId,
  paymentMethodOptions,
  paymentStatusOptions,
  purposeOptions,
  roomCleaningStatusLabels,
} from "@/lib/check-in/options";
import { formatStayRangeWithNights } from "@/lib/check-in/stay-dates";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Guest Record Detail",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
};

type GuestDocument = Database["public"]["Tables"]["guest_documents"]["Row"] & {
  signedUrl: string | null;
};
type GuestCharge = Database["public"]["Tables"]["guest_charges"]["Row"];
type BookingGroup = Database["public"]["Tables"]["booking_groups"]["Row"];
type LinkedStay = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "full_name"
  | "assigned_room_id"
  | "check_in_date"
  | "check_out_date"
  | "status"
  | "cnic_verified"
  | "payment_verified"
  | "total_expected_amount_pkr"
  | "agreed_room_rate_pkr"
  | "amount_paid_pkr"
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

function documentStatusTone(status: GuestDocument["document_status"]) {
  if (status === "verified") {
    return "success";
  }

  if (status === "rejected") {
    return "danger";
  }

  return "warning";
}

function groupOutstanding(expected: number | null | undefined, paid: number | null | undefined) {
  if (expected === null || expected === undefined) {
    return null;
  }

  return Math.max(expected - (paid ?? 0), 0);
}

function DocumentGroup({ title, documents }: { title: string; documents: GuestDocument[] }) {
  const latestDocument = documents[0];
  const status = !latestDocument ? "No document uploaded" : getDocumentStatusLabel(latestDocument.document_status);

  return (
    <div className="rounded-lg border border-brand-sage bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-brand-deep">{title}</h3>
        <Badge tone={!latestDocument ? "neutral" : documentStatusTone(latestDocument.document_status)}>{status}</Badge>
      </div>
      {!documents.length ? (
        <p className="mt-3 text-sm text-slate-500">No document uploaded.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {documents.map((document, index) => (
            <div key={document.id} className="flex flex-col gap-2 rounded-lg bg-brand-ivory p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-brand-deep">
                  {document.file_path.split("/").pop()}
                  {index === 0 ? <Badge tone="info">Latest</Badge> : null}
                  <Badge tone={documentStatusTone(document.document_status)}>{getDocumentStatusLabel(document.document_status)}</Badge>
                </p>
                <p className="text-xs text-slate-500">{document.mime_type}</p>
                <p className="text-xs text-slate-500">Uploaded {new Date(document.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {document.signedUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={document.signedUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      View
                    </a>
                  </Button>
                ) : (
                  <Badge tone="warning">Signed URL unavailable</Badge>
                )}
                <form action={updateGuestDocumentStatus} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={document.id} />
                  <input type="hidden" name="checkin_id" value={document.checkin_id} />
                  <Select name="document_status" defaultValue={document.document_status} aria-label="Document status" className="h-9 w-32">
                    {documentStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <Button type="submit" size="sm" variant="secondary">
                    Save
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function GuestRecordDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const queryParams = await searchParams;
  const { supabase } = await requireRole(managementRoles);

  const [{ data: record, error: recordError }, { data: rooms }, { data: documents }, { data: charges }] = await Promise.all([
    supabase.from("guest_checkins").select("*").eq("id", id).single(),
    supabase.from("rooms").select("id,unit_number,name,status,cleaning_status,base_price_pkr").order("unit_number", { nullsFirst: false }),
    supabase.from("guest_documents").select("*").eq("checkin_id", id).order("created_at", { ascending: false }),
    supabase.from("guest_charges").select("*").eq("guest_checkin_id", id).order("charged_at", { ascending: false }),
  ]);

  if (recordError || !record) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Guest record not found</CardTitle>
              <CardDescription>{recordError?.message ?? "The record may have been removed."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/guest-records">Back to guest records</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const [{ data: bookingGroups }, bookingGroupResult, linkedStaysResult] = await Promise.all([
    supabase
      .from("booking_groups")
      .select("id,lead_guest_name,lead_guest_phone,booking_source,check_in_date,check_out_date,expected_total_amount,paid_total_amount")
      .order("created_at", { ascending: false })
      .limit(50),
    record.booking_group_id
      ? supabase.from("booking_groups").select("*").eq("id", record.booking_group_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    record.booking_group_id
      ? supabase
          .from("guest_checkins")
          .select(
            "id,full_name,assigned_room_id,check_in_date,check_out_date,status,cnic_verified,payment_verified,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr",
          )
          .eq("booking_group_id", record.booking_group_id)
          .order("check_in_date", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);
  const bookingGroup = (bookingGroupResult.data ?? null) as BookingGroup | null;
  const linkedStays = (linkedStaysResult.data ?? []) as LinkedStay[];
  const linkedStayIds = linkedStays.map((stay) => stay.id);
  const { data: linkedCharges } = linkedStayIds.length
    ? await supabase.from("guest_charges").select("guest_checkin_id,total_amount_pkr,is_paid").in("guest_checkin_id", linkedStayIds)
    : { data: [] };
  const linkedChargesByStay = new Map<string, Array<{ total_amount_pkr: number; is_paid: boolean }>>();
  (linkedCharges ?? []).forEach((charge) => {
    const stayCharges = linkedChargesByStay.get(charge.guest_checkin_id) ?? [];
    stayCharges.push(charge);
    linkedChargesByStay.set(charge.guest_checkin_id, stayCharges);
  });

  const documentsWithUrls: GuestDocument[] = await Promise.all(
    (documents ?? []).map(async (document) => {
      const { data } = await supabase.storage.from("guest-documents").createSignedUrl(document.file_path, 60 * 10);
      return { ...document, signedUrl: data?.signedUrl ?? null };
    }),
  );

  const primaryDocuments = documentsWithUrls.filter((document) => document.document_type === "primary_cnic");
  const additionalDocuments = documentsWithUrls.filter((document) => document.document_type === "additional_guest_cnic");
  const paymentDocuments = documentsWithUrls.filter((document) => document.document_type === "payment_proof");
  const guestCharges: GuestCharge[] = charges ?? [];
  const guestTypeLabel = guestTypeOptions.find((option) => option.value === record.guest_type)?.label ?? formatEnumLabel(record.guest_type);
  const missingApprovalRequirements = getApprovalMissingRequirements(record);
  const canApprove = isReadyToApprove(record);
  const showApproveAction = record.status === "submitted" || record.status === "under_review";
  const readyForCheckin = isReadyForCheckin(record);
  const fullyVerified = Boolean(record.assigned_room_id) && record.cnic_verified && record.payment_verified;
  const showCheckInAction = record.status !== "checked_in" && record.status !== "checked_out";
  const showCheckOutAction = record.status === "checked_in";
  const isCompleted = record.status === "checked_out";
  const showIssueAction = record.status !== "issue" && record.status !== "checked_out";
  const assignedRoom = record.assigned_room_id ? rooms?.find((room) => room.id === record.assigned_room_id) : null;
  const assignedRoomNotReady = Boolean(assignedRoom && assignedRoom.cleaning_status !== "ready");
  const roomName = assignedRoom ? formatUnitRoomLabel(assignedRoom) : "To be assigned";
  const financialSummary = getGuestFinancialSummary({ checkin: record, charges: guestCharges });
  const linkedFinancialSummary = linkedStays.reduce(
    (summary, stay) => {
      const staySummary = getGuestFinancialSummary({
        checkin: stay,
        charges: linkedChargesByStay.get(stay.id) ?? [],
      });

      return {
        totalExpected: summary.totalExpected + staySummary.totalExpected,
        totalPaid: summary.totalPaid + staySummary.totalPaid,
        outstanding: summary.outstanding + staySummary.outstanding,
      };
    },
    { totalExpected: 0, totalPaid: 0, outstanding: 0 },
  );
  const combinedExpected = bookingGroup?.expected_total_amount ?? linkedFinancialSummary.totalExpected;
  const combinedPaid = bookingGroup?.paid_total_amount ?? linkedFinancialSummary.totalPaid;
  const combinedOutstanding = groupOutstanding(combinedExpected, combinedPaid) ?? linkedFinancialSummary.outstanding;
  const requirements = [
    { label: "Unit assigned", complete: Boolean(record.assigned_room_id), missing: "Unit not assigned" },
    { label: "CNIC verified", complete: record.cnic_verified, missing: "CNIC not verified" },
    { label: "Payment verified", complete: record.payment_verified, missing: "Payment not confirmed" },
  ];
  const missingCheckinRequirements = [
    !record.assigned_room_id ? "Unit may not be assigned" : null,
    !record.cnic_verified ? "ID may be missing or unverified" : null,
    !record.payment_verified ? "Payment may be pending" : null,
    record.status === "issue" ? "Record is marked as an issue" : null,
  ].filter((requirement): requirement is string => Boolean(requirement));
  const whatsappActions = [
    {
      label: "Confirm check-in",
      message: `Hello ${record.full_name}, your GreenLux Residency check-in is approved. Unit: ${roomName}. Dates: ${record.check_in_date} to ${record.check_out_date}. Thank you.`,
    },
    {
      label: "Request corrected CNIC",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. We need a corrected CNIC/passport image for your check-in record. Please send a clear photo on WhatsApp so we can complete verification.",
    },
    {
      label: "Request payment proof",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. Please send your payment proof on WhatsApp so we can complete payment verification for your booking.",
    },
    {
      label: "Request additional guest CNICs",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. Please send clear CNIC/passport images for the additional guests staying with you so we can complete the check-in record.",
    },
    {
      label: "Send checkout thanks",
      message: `Hello ${record.full_name}, thank you for staying with GreenLux Residency. We hope you had a comfortable stay and wish you safe travels.`,
    },
  ];
  const receiptMessage = `Hello ${record.full_name}, your GreenLux Accommodation Receipt is ready. Our team can share the receipt PDF here.`;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/guest-records">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guest records
          </Link>
        </Button>

        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Guest record</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">{record.full_name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {formatStayRangeWithNights(record.check_in_date, record.check_out_date)} - {record.number_of_guests} guest(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>
            <Badge tone={record.guest_type === "admin_created" ? "info" : "neutral"}>{guestTypeLabel}</Badge>
            <Badge tone={record.cnic_verified ? "success" : "warning"}>CNIC {record.cnic_verified ? "verified" : "pending"}</Badge>
            <Badge tone={record.payment_verified ? "success" : "warning"}>
              Payment proof {record.payment_verified ? "verified" : "pending"}
            </Badge>
            <Badge tone="info">{formatEnumLabel(record.payment_status)}</Badge>
            {record.issue_type ? <Badge tone="danger">{getIssueTypeLabel(record.issue_type)}</Badge> : null}
          </div>
        </header>

        {queryParams.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{queryParams.message}</div>
        ) : null}

        {!fullyVerified ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
              Guest is not fully verified
            </p>
            <ul className="mt-2 list-inside list-disc">
              {missingCheckinRequirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Accommodation Receipt</CardTitle>
            <CardDescription>
              Open a clean receipt for workplace reimbursement or management records. Use browser print to save as PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button asChild>
              <Link href={`/admin/guest-records/${record.id}/receipt`}>
                <FileText className="h-4 w-4" aria-hidden="true" />
                View Accommodation Receipt
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/guest-records/${record.id}/receipt?print=1`}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print / Download Receipt
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={getWhatsAppGuestHref(record.phone, receiptMessage)} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Send receipt via WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{bookingGroup ? "Part of multi-room booking" : "Multi-room booking"}</CardTitle>
              <CardDescription>
                {bookingGroup
                  ? "Lead booking context for this stay. Room readiness, check-in, folio, documents, and cleaning remain per room."
                  : "This stay is currently a normal single-room stay. Create a lead booking only when this guest is booking multiple units."}
              </CardDescription>
            </div>
            {!bookingGroup ? (
              <form action={createBookingGroupFromGuestRecord}>
                <input type="hidden" name="id" value={record.id} />
                <Button type="submit" variant="outline">Create multi-room booking from this stay</Button>
              </form>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingGroup ? (
              <>
                <div className="rounded-lg border border-brand-sage bg-white p-4">
                  <p className="font-semibold text-brand-deep">This room/stay amount</p>
                  <p className="mt-1 text-sm text-slate-600">
                    This stay remains the reportable room-level record for revenue, folio, documents, readiness, and cleaning.
                  </p>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    <InfoRow label="This stay expected" value={formatPkr(financialSummary.totalExpected)} />
                    <InfoRow label="This stay paid" value={formatPkr(financialSummary.totalPaid)} />
                    <InfoRow label="This stay outstanding" value={formatPkr(financialSummary.outstanding)} />
                  </dl>
                </div>

                <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4">
                  <p className="font-semibold text-brand-deep">Lead booking reference total</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Reference only. Reports currently calculate revenue from individual room stays to avoid double-counting.
                  </p>
                  <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoRow label="Lead guest/contact" value={`${bookingGroup.lead_guest_name} - ${bookingGroup.lead_guest_phone}`} />
                    <InfoRow label="Lead email" value={bookingGroup.lead_guest_email} />
                    <InfoRow label="Stay dates" value={formatStayRangeWithNights(bookingGroup.check_in_date, bookingGroup.check_out_date)} />
                    <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, bookingGroup.booking_source)} />
                    <InfoRow label="Lead expected reference" value={formatPkr(combinedExpected)} />
                    <InfoRow label="Lead paid reference" value={formatPkr(combinedPaid)} />
                    <InfoRow label="Lead outstanding reference" value={formatPkr(combinedOutstanding)} />
                    <InfoRow label="Linked stays" value={linkedStays.length} />
                  </dl>
                </div>

                <div className="rounded-lg border border-brand-sage bg-white p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-brand-deep">Linked rooms/stays</p>
                      <p className="text-sm text-slate-600">Each row remains its own operational room record.</p>
                    </div>
                    <Badge tone="info">{linkedStays.length} stay(s)</Badge>
                  </div>

                  {linkedStays.length ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                          <tr>
                            <th className="px-4 py-3">Guest / stay</th>
                            <th className="px-4 py-3">Room</th>
                            <th className="px-4 py-3">Per-room allocation</th>
                            <th className="px-4 py-3">Documents/payment</th>
                            <th className="px-4 py-3">Readiness</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-sage/70">
                          {linkedStays.map((stay) => {
                            const room = stay.assigned_room_id ? rooms?.find((candidate) => candidate.id === stay.assigned_room_id) : null;
                            const staySummary = getGuestFinancialSummary({
                              checkin: stay,
                              charges: linkedChargesByStay.get(stay.id) ?? [],
                            });

                            return (
                              <tr key={stay.id} className={stay.id === record.id ? "bg-brand-ivory" : "bg-white"}>
                                <td className="px-4 py-3">
                                  <Link href={`/admin/guest-records/${stay.id}`} className="font-semibold text-brand-deep underline-offset-2 hover:underline">
                                    {stay.full_name}
                                  </Link>
                                  <p className="text-xs text-slate-500">{formatStayRangeWithNights(stay.check_in_date, stay.check_out_date)}</p>
                                  <Badge tone={checkinStatusTone[stay.status]} className="mt-2">{getCheckinStatusLabel(stay.status)}</Badge>
                                </td>
                                <td className="px-4 py-3">{room ? formatUnitRoomLabel(room) : "Not assigned"}</td>
                                <td className="px-4 py-3">
                                  <p>{formatPkr(staySummary.totalExpected)} expected</p>
                                  <p className="text-xs text-slate-500">{formatPkr(staySummary.totalPaid)} paid</p>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-wrap gap-2">
                                    <Badge tone={stay.cnic_verified ? "success" : "warning"}>CNIC {stay.cnic_verified ? "verified" : "pending"}</Badge>
                                    <Badge tone={stay.payment_verified ? "success" : "warning"}>
                                      Payment proof {stay.payment_verified ? "verified" : "pending"}
                                    </Badge>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  {room ? (
                                    <div className="flex flex-wrap gap-2">
                                      <Badge tone={room.status === "active" ? "success" : "warning"}>{formatEnumLabel(room.status)}</Badge>
                                      <Badge tone={room.cleaning_status === "ready" ? "success" : "warning"}>
                                        {roomCleaningStatusLabels[room.cleaning_status]}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <Badge tone="warning">Unit not assigned</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-3 rounded-lg bg-brand-ivory p-3 text-sm text-slate-600">No linked stays found.</p>
                  )}
                </div>

                {bookingGroup.notes ? (
                  <div className="rounded-lg bg-brand-ivory p-3">
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lead booking notes</dt>
                    <dd className="mt-1 text-sm leading-6 text-brand-deep">{bookingGroup.notes}</dd>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-slate-700">
                Single-room stays continue exactly as before. For a multi-room booking, create the lead booking here,
                then attach the other room stays to that lead booking from their admin record.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="print-summary">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Printable guest receipt</CardTitle>
                  <CardDescription>GreenLux Residency stay receipt for front desk or guest records.</CardDescription>
                </div>
                <div className="no-print">
                  <PrintButton label="Print receipt" />
                </div>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Guest" value={record.full_name} />
                  <InfoRow label="Phone" value={record.phone} />
                  <InfoRow label="CNIC / passport" value={maskSensitiveId(record.cnic_passport_number)} />
                  <InfoRow label="Stay dates" value={formatStayRangeWithNights(record.check_in_date, record.check_out_date)} />
                  <InfoRow label="Unit" value={roomName} />
                  <InfoRow label="Base stay expected" value={formatPkr(financialSummary.baseExpected)} />
                  <InfoRow label="Base stay paid" value={formatPkr(financialSummary.basePaid)} />
                  <InfoRow label="Guest charges total" value={formatPkr(financialSummary.chargesTotal)} />
                  <InfoRow label="Paid guest charges" value={formatPkr(financialSummary.paidCharges)} />
                  <InfoRow label="Total expected" value={formatPkr(financialSummary.totalExpected)} />
                  <InfoRow label="Total paid" value={formatPkr(financialSummary.totalPaid)} />
                  <InfoRow label="Outstanding balance" value={formatPkr(financialSummary.outstanding)} />
                  <InfoRow label="Generated date" value={new Date().toLocaleDateString()} />
                  <InfoRow label="CNIC verified" value={record.cnic_verified ? "Yes" : "No"} />
                  <InfoRow label="Payment verified" value={record.payment_verified ? "Yes" : "No"} />
                </dl>
                <div className="mt-4 rounded-lg border border-brand-sage bg-white p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Additional charges</dt>
                  {guestCharges.length ? (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="border-b border-brand-sage text-xs uppercase tracking-[0.12em] text-brand-deep">
                          <tr>
                            <th className="py-2 pr-3">Type</th>
                            <th className="py-2 pr-3">Description</th>
                            <th className="py-2 pr-3">Qty</th>
                            <th className="py-2 pr-3">Total</th>
                            <th className="py-2 pr-3">Paid</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-sage/70">
                          {guestCharges.map((charge) => (
                            <tr key={charge.id}>
                              <td className="py-2 pr-3 font-medium text-brand-deep">{getGuestChargeLabel(charge.charge_type)}</td>
                              <td className="py-2 pr-3">{charge.description || "Not provided"}</td>
                              <td className="py-2 pr-3">{charge.quantity}</td>
                              <td className="py-2 pr-3">{formatPkr(charge.total_amount_pkr)}</td>
                              <td className="py-2 pr-3">{charge.is_paid ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <dd className="mt-1 text-sm text-slate-600">No additional charges.</dd>
                  )}
                </div>
                <div className="mt-3 rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Internal notes</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.internal_notes || "None"}</dd>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoRow label="Full name" value={record.full_name} />
                  <InfoRow label="Phone" value={record.phone} />
                  <InfoRow label="Email" value={record.email} />
                  <InfoRow label="Guest type" value={guestTypeLabel} />
                  <InfoRow label="CNIC / passport" value={record.cnic_passport_number} />
                  <InfoRow label="Address" value={record.address} />
                  <InfoRow label="Travelling from" value={record.city_country_from} />
                  <InfoRow label="Arrival time" value={record.estimated_arrival_time} />
                  <InfoRow label="Purpose" value={findLabel(purposeOptions, record.purpose_of_visit)} />
                  <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, record.booking_source)} />
                  <InfoRow label="Stayed before" value={record.has_stayed_before ? "Yes" : "No"} />
                  <InfoRow label="Payment method" value={findLabel(paymentMethodOptions, record.payment_method)} />
                  <InfoRow label="Advance claimed" value={formatPkr(record.advance_paid_amount_pkr)} />
                </dl>
                <div className="mt-3 rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Special requests</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.special_requests || "None"}</dd>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp quick actions</CardTitle>
                <CardDescription>Open WhatsApp with a prefilled message to the guest.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                {whatsappActions.map((action) => (
                  <Button key={action.label} asChild variant="outline">
                    <a href={getWhatsAppGuestHref(record.phone, action.message)} target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      {action.label}
                    </a>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Folio / Additional Charges</CardTitle>
                <CardDescription>
                  Operational charges for services like breakfast, tea, laundry, late checkout, extra bedding, or damages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <InfoRow label="Guest charges total" value={formatPkr(financialSummary.chargesTotal)} />
                  <InfoRow label="Paid guest charges" value={formatPkr(financialSummary.paidCharges)} />
                  <InfoRow label="Total expected" value={formatPkr(financialSummary.totalExpected)} />
                  <InfoRow label="Outstanding balance" value={formatPkr(financialSummary.outstanding)} />
                </div>

                {guestCharges.length ? (
                  <div className="overflow-x-auto rounded-lg border border-brand-sage">
                    <table className="w-full min-w-[860px] text-left text-sm">
                      <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Description</th>
                          <th className="px-4 py-3">Qty</th>
                          <th className="px-4 py-3">Unit amount</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Charged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-sage/70">
                        {guestCharges.map((charge) => (
                          <tr key={charge.id} className="bg-white">
                            <td className="px-4 py-3 font-medium text-brand-deep">{getGuestChargeLabel(charge.charge_type)}</td>
                            <td className="px-4 py-3">{charge.description || "Not provided"}</td>
                            <td className="px-4 py-3">{charge.quantity}</td>
                            <td className="px-4 py-3">{formatPkr(charge.amount_pkr)}</td>
                            <td className="px-4 py-3">{formatPkr(charge.total_amount_pkr)}</td>
                            <td className="px-4 py-3">
                              {charge.is_paid ? (
                                <Badge tone="success">Paid</Badge>
                              ) : (
                                <div className="space-y-2">
                                  <Badge tone="warning">Unpaid</Badge>
                                  <form action={markGuestChargePaid} className="flex flex-wrap gap-2">
                                    <input type="hidden" name="id" value={charge.id} />
                                    <input type="hidden" name="guest_checkin_id" value={record.id} />
                                    <Select name="payment_method" defaultValue="cash" aria-label="Folio charge payment method" className="h-9 w-36">
                                      {paymentMethodOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </Select>
                                    <Button type="submit" size="sm" variant="secondary">
                                      Mark paid
                                    </Button>
                                  </form>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">{new Date(charge.charged_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-slate-600">
                    No additional charges have been added for this stay.
                  </p>
                )}

                <form action={createGuestCharge} className="grid gap-4 rounded-lg border border-brand-sage bg-brand-ivory p-4 md:grid-cols-2">
                  <input type="hidden" name="guest_checkin_id" value={record.id} />
                  <div className="space-y-2">
                    <Label htmlFor="charge_type">Charge type</Label>
                    <Select id="charge_type" name="charge_type" required>
                      {guestChargeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charge_description">Description optional</Label>
                    <Input id="charge_description" name="description" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charge_quantity">Quantity</Label>
                    <Input id="charge_quantity" name="quantity" type="number" min={1} defaultValue={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charge_amount_pkr">Unit amount PKR</Label>
                    <Input id="charge_amount_pkr" name="amount_pkr" type="number" min={0} required />
                  </div>
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="is_paid" className="h-4 w-4 accent-brand-fresh" />
                    Paid now
                  </label>
                  <div className="space-y-2">
                    <Label htmlFor="charge_payment_method">Payment method if paid</Label>
                    <Select id="charge_payment_method" name="payment_method" defaultValue="">
                      <option value="">Not paid yet</option>
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="charge_notes">Notes optional</Label>
                    <Textarea id="charge_notes" name="notes" rows={3} />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit">+ Add Charge</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  Links are short-lived signed URLs from the private storage bucket. Newest uploads are shown first.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <DocumentGroup title="Primary CNIC / passport" documents={primaryDocuments} />
                <DocumentGroup title="Additional guest CNIC/passports" documents={additionalDocuments} />
                <DocumentGroup title="Payment proof" documents={paymentDocuments} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Replace / Upload Documents</CardTitle>
                <CardDescription>
                  Upload corrected files received by WhatsApp or in person. Existing files are kept for audit trail;
                  the newest upload appears as latest.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={uploadGuestRecordDocuments} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="id" value={record.id} />
                  <div className="space-y-2">
                    <Label htmlFor="primary_document">Primary guest CNIC/passport</Label>
                    <Input id="primary_document" name="primary_document" type="file" accept=".jpg,.jpeg,.png,.pdf" />
                    <p className="text-xs text-slate-500">Optional. JPG, PNG, or PDF up to 10 MB.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional_documents">Additional guest CNIC/passports</Label>
                    <Input id="additional_documents" name="additional_documents" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple />
                    <p className="text-xs text-slate-500">Optional. Multiple files allowed.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_proof">Payment proof</Label>
                    <Input id="payment_proof" name="payment_proof" type="file" accept=".jpg,.jpeg,.png,.pdf" />
                    <p className="text-xs text-slate-500">Optional. Upload later even if proof was missing originally.</p>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit">Upload documents</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Admin actions</CardTitle>
              <CardDescription>Assign unit, confirm payment, verify documents, and add internal notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid gap-3 rounded-lg border border-brand-sage bg-white p-4 sm:grid-cols-2">
                <InfoRow label="Base stay expected" value={formatPkr(financialSummary.baseExpected)} />
                <InfoRow label="Base stay paid" value={formatPkr(financialSummary.basePaid)} />
                <InfoRow label="Guest charges total" value={formatPkr(financialSummary.chargesTotal)} />
                <InfoRow label="Paid guest charges" value={formatPkr(financialSummary.paidCharges)} />
                <InfoRow label="Total expected" value={formatPkr(financialSummary.totalExpected)} />
                <InfoRow label="Total paid" value={formatPkr(financialSummary.totalPaid)} />
                <InfoRow label="Outstanding balance" value={formatPkr(financialSummary.outstanding)} />
              </div>

              <div className="mb-5 space-y-4 rounded-lg border border-brand-sage bg-brand-ivory p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">Check-in status</p>
                    <div className="mt-2">
                      <Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>
                    </div>
                  </div>
                  {showApproveAction ? (
                    <form action={updateCheckinStatus}>
                      <input type="hidden" name="id" value={record.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button type="submit" disabled={!canApprove}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Approve Check-in
                      </Button>
                    </form>
                  ) : null}
                </div>

                {isCompleted ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
                    This guest has been checked out. The stay is complete.
                  </div>
                ) : null}

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  If CNIC number or document is incorrect, mark as Issue, add a note, message the guest, then upload
                  the corrected document here once received.
                </div>

                <div className="rounded-lg border border-brand-sage bg-white p-3">
                  <p className="text-sm font-semibold text-brand-deep">Requirements Checklist</p>
                  <div className="mt-3 grid gap-2">
                    {requirements.map((requirement) => (
                      <div key={requirement.label} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-slate-700">{requirement.label}</span>
                        <Badge tone={requirement.complete ? "success" : "warning"}>
                          {requirement.complete ? "Complete" : requirement.missing}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {missingApprovalRequirements.length > 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                      <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                      Missing before approval
                    </p>
                    <ul className="mt-2 list-inside list-disc text-sm text-amber-900">
                      {missingApprovalRequirements.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-green-700">All approval requirements are complete.</p>
                )}

                {!isCompleted && (showCheckInAction || showCheckOutAction) ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {showCheckInAction && readyForCheckin ? (
                      <form action={updateCheckinStatus}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="status" value="checked_in" />
                        <Button type="submit" variant="outline" className="w-full">
                          <LogIn className="h-4 w-4" aria-hidden="true" />
                          Check-in
                        </Button>
                      </form>
                    ) : null}
                    {showCheckInAction && !readyForCheckin ? (
                      <>
                        <Button type="button" variant="outline" className="w-full" disabled>
                          <LogIn className="h-4 w-4" aria-hidden="true" />
                          Check-in (Ready)
                        </Button>
                        <ExceptionCheckinButton id={record.id} action={updateCheckinStatus} />
                      </>
                    ) : null}
                    {showCheckOutAction ? (
                      <form action={updateCheckinStatus}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="status" value="checked_out" />
                        <Button type="submit" variant="outline" className="w-full">
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          Mark as Checked-out
                        </Button>
                      </form>
                    ) : null}
                  </div>
                ) : null}

                {showIssueAction ? (
                  <form action={updateCheckinStatus}>
                    <input type="hidden" name="id" value={record.id} />
                    <input type="hidden" name="status" value="issue" />
                    <Button type="submit" variant="outline" className="w-full">
                      <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                      Mark as Issue / Needs Correction
                    </Button>
                  </form>
                ) : null}
              </div>

              <form action={extendGuestStay} className="mb-5 grid gap-4 rounded-lg border border-brand-sage bg-white p-4 md:grid-cols-2">
                <input type="hidden" name="id" value={record.id} />
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-brand-deep">Extend Stay</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Extend the current record without creating a new booking. Payment can be added later if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_check_out_date">New check-out date</Label>
                  <Input id="new_check_out_date" name="new_check_out_date" type="date" min={record.check_out_date} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extend_reason">Reason optional</Label>
                  <Input id="extend_reason" name="reason" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional_expected_amount_pkr">Additional expected PKR optional</Label>
                  <Input id="additional_expected_amount_pkr" name="additional_expected_amount_pkr" type="number" min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="additional_payment_received_pkr">Additional payment received PKR optional</Label>
                  <Input id="additional_payment_received_pkr" name="additional_payment_received_pkr" type="number" min={0} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extend_payment_method">Payment method optional</Label>
                  <Select id="extend_payment_method" name="payment_method" defaultValue="">
                    <option value="">No payment received</option>
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="secondary">Extend Stay</Button>
                </div>
              </form>

              <form action={updateGuestRecord} className="space-y-4">
                <input type="hidden" name="id" value={record.id} />

                <div className="space-y-2">
                  <Label htmlFor="booking_group_id">Lead booking group</Label>
                  <Select id="booking_group_id" name="booking_group_id" defaultValue={record.booking_group_id ?? ""}>
                    <option value="">No multi-room booking</option>
                    {(bookingGroups ?? []).map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.lead_guest_name} - {group.lead_guest_phone} - {formatStayRangeWithNights(group.check_in_date, group.check_out_date)}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-slate-500">
                    Attach this stay to a lead booking only when it is one room within a multi-room booking.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigned_room_id">Assigned unit</Label>
                  <Select id="assigned_room_id" name="assigned_room_id" defaultValue={record.assigned_room_id ?? ""}>
                    <option value="">Not assigned</option>
                    {(rooms ?? []).map((room) => (
                      <option key={room.id} value={room.id}>
                        {formatUnitRoomLabel(room)} ({formatEnumLabel(room.status)}
                        {room.cleaning_status !== "ready" ? ` - ${roomCleaningStatusLabels[room.cleaning_status]}` : ""})
                      </option>
                    ))}
                  </Select>
                  {assignedRoomNotReady ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      Warning: this room is not marked ready. You may continue if management has approved this.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Rooms not marked ready are labelled in the list. This is a soft warning only; assignment remains available for management-approved exceptions.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="agreed_room_rate_pkr">Agreed room rate</Label>
                    <Input id="agreed_room_rate_pkr" name="agreed_room_rate_pkr" type="number" min={0} defaultValue={record.agreed_room_rate_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="advance_paid_amount_pkr">Advance paid</Label>
                    <Input id="advance_paid_amount_pkr" name="advance_paid_amount_pkr" type="number" min={0} defaultValue={record.advance_paid_amount_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_expected_amount_pkr">Total expected</Label>
                    <Input id="total_expected_amount_pkr" name="total_expected_amount_pkr" type="number" min={0} defaultValue={record.total_expected_amount_pkr ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount_paid_pkr">Amount paid</Label>
                    <Input id="amount_paid_pkr" name="amount_paid_pkr" type="number" min={0} defaultValue={record.amount_paid_pkr ?? ""} />
                  </div>
                  {bookingGroup ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 sm:col-span-2">
                      For multi-room bookings, enter the amount for this room/stay only. Do not enter the full group total on every room.
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="payment_status">Payment status</Label>
                    <Select id="payment_status" name="payment_status" defaultValue={record.payment_status}>
                      {paymentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest_tag">Guest tag</Label>
                    <Select id="guest_tag" name="guest_tag" defaultValue={record.guest_tag}>
                      {guestTagOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issue_type">Issue type</Label>
                    <Select id="issue_type" name="issue_type" defaultValue={record.issue_type ?? ""}>
                      <option value="">No issue type</option>
                      {issueTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-lg border border-brand-sage bg-brand-ivory p-4">
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="cnic_verified" defaultChecked={record.cnic_verified} className="h-4 w-4 accent-brand-fresh" />
                    CNIC/passport received and verified
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="payment_verified" defaultChecked={record.payment_verified} className="h-4 w-4 accent-brand-fresh" />
                    Payment proof verified
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal notes</Label>
                  <Textarea id="internal_notes" name="internal_notes" defaultValue={record.internal_notes ?? ""} rows={6} />
                </div>

                <Button type="submit" className="w-full">Save admin changes</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
