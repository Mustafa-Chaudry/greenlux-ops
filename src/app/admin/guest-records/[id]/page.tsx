import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, CheckCircle2, ExternalLink, FileText, LogIn, LogOut, MessageCircle, Printer, TriangleAlert } from "lucide-react";
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
  getBalanceDue,
  getBusinessTodayDate,
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
import { formatStayRangeWithNights, getStayNights } from "@/lib/check-in/stay-dates";
import type { Database } from "@/types/database";

export const metadata: Metadata = {
  title: "Guest Stay Detail",
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
type PreviousStay = Pick<
  Database["public"]["Tables"]["guest_checkins"]["Row"],
  | "id"
  | "full_name"
  | "assigned_room_id"
  | "check_in_date"
  | "check_out_date"
  | "booking_source"
  | "agreed_room_rate_pkr"
  | "total_expected_amount_pkr"
  | "amount_paid_pkr"
  | "payment_status"
  | "cnic_verified"
  | "payment_verified"
  | "status"
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

function daysBetweenIso(startValue: string, endValue: string) {
  const [startYear, startMonth, startDay] = startValue.split("-").map(Number);
  const [endYear, endMonth, endDay] = endValue.split("-").map(Number);

  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) {
    return null;
  }

  const start = Date.UTC(startYear, startMonth - 1, startDay);
  const end = Date.UTC(endYear, endMonth - 1, endDay);
  return Math.floor((end - start) / 86_400_000);
}

function getPaymentCoverageAlert({
  checkInDate,
  checkOutDate,
  status,
  agreedRoomRate,
  totalExpected,
  amountPaid,
  balanceDue,
  paymentConfirmationLabel,
}: {
  checkInDate: string;
  checkOutDate: string | null;
  status: Database["public"]["Enums"]["checkin_status"];
  agreedRoomRate: number | null;
  totalExpected: number;
  amountPaid: number | null;
  balanceDue: number;
  paymentConfirmationLabel: string;
}) {
  if (status === "checked_out" && balanceDue > 0) {
    return {
      title: "Balance Due remains after checkout",
      detail: `Balance Due: ${formatPkr(balanceDue)}.`,
      tone: "warning" as const,
    };
  }

  const today = getBusinessTodayDate();
  const elapsedDays = daysBetweenIso(checkInDate, today);
  const bookedNights = getStayNights(checkInDate, checkOutDate);

  if (elapsedDays !== null && elapsedDays >= 0 && paymentConfirmationLabel !== "Verified") {
    return {
      title: "Payment Confirmation pending",
      detail: "Payment Confirmation pending. Review payment before the stay continues.",
      tone: "warning" as const,
    };
  }

  if (!bookedNights || balanceDue <= 0) {
    return null;
  }

  const derivedNightlyRate = totalExpected > 0 ? totalExpected / bookedNights : null;
  const nightlyRate = agreedRoomRate && agreedRoomRate > 0 ? agreedRoomRate : derivedNightlyRate;

  if (!nightlyRate || nightlyRate <= 0) {
    return null;
  }

  const currentStayNight = Math.min(Math.max((elapsedDays ?? -1) + 1, 1), bookedNights);
  const coveredNights = Math.floor((amountPaid ?? 0) / nightlyRate);

  if (elapsedDays !== null && elapsedDays >= 0 && currentStayNight >= coveredNights && balanceDue > 0) {
    return {
      title: "Payment follow-up required before the next night",
      detail: `Paid amount currently covers approximately ${coveredNights} of ${bookedNights} booked nights. Balance Due: ${formatPkr(balanceDue)}.`,
      tone: "warning" as const,
    };
  }

  return null;
}

function verificationState(verified: boolean, documents: GuestDocument[]) {
  const latestDocument = documents[0];

  if (verified) {
    return { label: "Verified", tone: "success" as const };
  }

  if (latestDocument?.document_status === "rejected") {
    return { label: "Rejected", tone: "danger" as const };
  }

  if (latestDocument) {
    return { label: "Pending Team Review", tone: "warning" as const };
  }

  return { label: "Missing", tone: "warning" as const };
}

function roomReadinessState(
  room: { status: Database["public"]["Enums"]["room_status"]; cleaning_status: Database["public"]["Enums"]["room_cleaning_status"] } | null,
) {
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

function alertToneClass(tone: "danger" | "warning" | "info") {
  if (tone === "danger") {
    return "border-red-200 bg-red-50 text-red-900";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-sky-200 bg-sky-50 text-sky-900";
}

function DocumentGroup({ title, documents }: { title: string; documents: GuestDocument[] }) {
  const latestDocument = documents[0];
  const status = !latestDocument ? "No document uploaded" : getDocumentStatusLabel(latestDocument.document_status);

  return (
    <div className="rounded-lg border border-brand-sage bg-white p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold text-brand-deep">{title}</h3>
        <Badge tone={!latestDocument ? "neutral" : documentStatusTone(latestDocument.document_status)}>{status}</Badge>
      </div>
      {!documents.length ? (
        <p className="mt-3 text-sm text-slate-500">No document uploaded.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {documents.map((document, index) => (
            <div key={document.id} className="flex flex-col gap-2 rounded-lg bg-brand-ivory p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-brand-deep">
                  {document.file_path.split("/").pop()}
                  {index === 0 ? <Badge tone="info">Latest</Badge> : null}
                  {!document.file_path.includes(`/${document.checkin_id}/`) ? <Badge tone="info">Document on file</Badge> : null}
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
              <CardTitle>Guest stay not found</CardTitle>
              <CardDescription>{recordError?.message ?? "The record may have been removed."}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/guest-records">Back to guest stays</Link>
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

  const previousStaySelect =
    "id,full_name,assigned_room_id,check_in_date,check_out_date,booking_source,agreed_room_rate_pkr,total_expected_amount_pkr,amount_paid_pkr,payment_status,cnic_verified,payment_verified,status";
  const previousStayQueries = [
    record.phone
      ? supabase.from("guest_checkins").select(previousStaySelect).eq("phone", record.phone).neq("id", id).order("check_in_date", { ascending: false }).limit(20)
      : null,
    record.email
      ? supabase.from("guest_checkins").select(previousStaySelect).eq("email", record.email).neq("id", id).order("check_in_date", { ascending: false }).limit(20)
      : null,
    record.cnic_passport_number
      ? supabase
          .from("guest_checkins")
          .select(previousStaySelect)
          .eq("cnic_passport_number", record.cnic_passport_number)
          .neq("id", id)
          .order("check_in_date", { ascending: false })
          .limit(20)
      : null,
  ].filter((query): query is NonNullable<typeof query> => Boolean(query));
  const previousStayResults = previousStayQueries.length ? await Promise.all(previousStayQueries) : [];
  const previousStaysById = new Map<string, PreviousStay>();
  previousStayResults.forEach((result) => {
    (result.data ?? []).forEach((stay) => {
      previousStaysById.set(stay.id, stay as PreviousStay);
    });
  });
  const previousStays = Array.from(previousStaysById.values()).sort((left, right) => right.check_in_date.localeCompare(left.check_in_date));
  const previousStayRows = previousStays.slice(0, 6);
  const previousStayIds = previousStays.map((stay) => stay.id);
  const { data: previousStayDocuments } = previousStayIds.length
    ? await supabase
        .from("guest_documents")
        .select("checkin_id,document_type,document_status")
        .in("checkin_id", previousStayIds)
        .in("document_type", ["primary_cnic", "additional_guest_cnic", "supporting_document"])
    : { data: [] };
  const previousDocumentsByStay = new Map<string, Array<{ document_type: string; document_status: string }>>();
  (previousStayDocuments ?? []).forEach((document) => {
    const documentsForStay = previousDocumentsByStay.get(document.checkin_id) ?? [];
    documentsForStay.push({ document_type: document.document_type, document_status: document.document_status });
    previousDocumentsByStay.set(document.checkin_id, documentsForStay);
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
  const supportingDocuments = documentsWithUrls.filter((document) => document.document_type === "supporting_document");
  const previousDocumentsAddedForReview = documentsWithUrls.filter(
    (document) =>
      (document.document_type === "primary_cnic" ||
        document.document_type === "additional_guest_cnic" ||
        document.document_type === "supporting_document") &&
      !document.file_path.includes(`/${record.id}/`),
  );
  const guestCharges: GuestCharge[] = charges ?? [];
  const guestTypeLabel = guestTypeOptions.find((option) => option.value === record.guest_type)?.label ?? formatEnumLabel(record.guest_type);
  const missingApprovalRequirements = getApprovalMissingRequirements(record);
  const canApprove = isReadyToApprove(record);
  const showApproveAction = record.status === "submitted" || record.status === "under_review";
  const readyForCheckin = isReadyForCheckin(record);
  const showCheckInAction = record.status !== "checked_in" && record.status !== "checked_out";
  const showCheckOutAction = record.status === "checked_in";
  const isCompleted = record.status === "checked_out";
  const showIssueAction = record.status !== "issue" && record.status !== "checked_out";
  const assignedRoom = record.assigned_room_id ? rooms?.find((room) => room.id === record.assigned_room_id) ?? null : null;
  const assignedRoomNotReady = Boolean(assignedRoom && assignedRoom.cleaning_status !== "ready");
  const roomName = assignedRoom ? formatUnitRoomLabel(assignedRoom) : "To be assigned";
  const financialSummary = getGuestFinancialSummary({ checkin: record, charges: guestCharges });
  const previousStayWithBalanceDue = previousStays.find((stay) => (getBalanceDue(stay) ?? 0) > 0);
  const previousStayNeedingFollowUp = previousStays.find((stay) => stay.payment_status !== "paid" || !stay.cnic_verified || !stay.payment_verified);
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
    { label: "ID Verification", complete: record.cnic_verified, missing: "ID not verified" },
    { label: "Payment Confirmation", complete: record.payment_verified, missing: "Payment Confirmation not verified" },
  ];
  const whatsappActions = [
    {
      label: "Confirm arrival details",
      message: `Hello ${record.full_name}, your GreenLux Residency Arrival Details are approved. Unit: ${roomName}. Dates: ${record.check_in_date} to ${record.check_out_date}. We look forward to welcoming you.`,
    },
    {
      label: "Request corrected ID",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. We need a corrected ID/passport image for your stay details. Please send a clear photo on WhatsApp so we can complete verification.",
    },
    {
      label: "Request Payment Confirmation",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. Please send your Payment Confirmation on WhatsApp so we can complete your booking.",
    },
    {
      label: "Request additional guest IDs",
      message:
        "Assalam o Alaikum, this is GreenLux Residency. Please send clear ID/passport images for the additional guests staying with you so we can complete the check-in record.",
    },
    {
      label: "Send checkout thanks",
      message: `Hello ${record.full_name}, thank you for staying with GreenLux Residency. We hope you had a comfortable stay and wish you safe travels.`,
    },
  ];
  const receiptMessage = `Hello ${record.full_name}, your GreenLux Residency Accommodation Receipt is ready. Our team can share the PDF here for your records or workplace reimbursement. Thank you for choosing GreenLux Residency.`;
  const idVerification = verificationState(record.cnic_verified, primaryDocuments);
  const paymentConfirmation = verificationState(record.payment_verified, paymentDocuments);
  const roomReadiness = roomReadinessState(assignedRoom);
  const paymentCoverageAlert = getPaymentCoverageAlert({
    checkInDate: record.check_in_date,
    checkOutDate: record.check_out_date,
    status: record.status,
    agreedRoomRate: record.agreed_room_rate_pkr,
    totalExpected: financialSummary.baseExpected,
    amountPaid: record.amount_paid_pkr,
    balanceDue: financialSummary.outstanding,
    paymentConfirmationLabel: paymentConfirmation.label,
  });
  const priorityAlerts = [
    paymentCoverageAlert,
    idVerification.label !== "Verified"
      ? {
          title: "ID Verification Needs Attention",
          detail: idVerification.label === "Missing" ? "No ID document has been received yet." : `ID status: ${idVerification.label}.`,
          tone: idVerification.tone === "danger" ? "danger" as const : "warning" as const,
        }
      : null,
    paymentConfirmation.label !== "Verified"
      ? {
          title: "Payment Confirmation Needs Attention",
          detail: paymentConfirmation.label === "Missing" ? "No Payment Confirmation document has been received yet." : `Payment Confirmation status: ${paymentConfirmation.label}.`,
          tone: paymentConfirmation.tone === "danger" ? "danger" as const : "warning" as const,
        }
      : null,
    financialSummary.outstanding > 0
      ? {
          title: "Balance Due",
          detail: `${formatPkr(financialSummary.outstanding)} remains due for this Guest Stay.`,
          tone: "warning" as const,
        }
      : null,
    assignedRoomNotReady
      ? {
          title: "Room is not Ready for Arrival",
          detail: `${roomName} is currently marked ${roomReadiness.label}. This is visible for staff review, not a hard blocker.`,
          tone: roomReadiness.tone === "danger" ? "danger" as const : "warning" as const,
        }
      : null,
    bookingGroup
      ? {
          title: "Multi-room booking finance check",
          detail: "Keep this room/stay amount separate from lead booking reference totals to avoid double-counting.",
          tone: "info" as const,
        }
      : null,
    previousStayWithBalanceDue
      ? {
          title: "Previous stay had Balance Due",
          detail: `Review previous stay before confirming new stay. Prior Balance Due: ${formatPkr(getBalanceDue(previousStayWithBalanceDue))}.`,
          tone: "warning" as const,
        }
      : null,
    previousStayNeedingFollowUp
      ? {
          title: "Previous stay needed payment follow-up or document review",
          detail: "Soft reminder only. Current stay details, payment, and documents still need their own review.",
          tone: "info" as const,
        }
      : null,
    record.status === "issue" || record.guest_tag === "issue" || record.issue_type
      ? {
          title: "Existing Needs Attention state",
          detail: getIssueTypeLabel(record.issue_type),
          tone: "danger" as const,
        }
      : null,
  ].filter((alert): alert is { title: string; detail: string; tone: "danger" | "warning" | "info" } => Boolean(alert));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin/guest-records">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to guest stays
          </Link>
        </Button>

        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Guest Stay Details</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">{record.full_name}</h1>
            <p className="mt-2 text-sm text-slate-600">
              {formatStayRangeWithNights(record.check_in_date, record.check_out_date)} - {record.number_of_guests} guest(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>
            <Badge tone={record.guest_type === "admin_created" ? "info" : "neutral"}>{guestTypeLabel}</Badge>
            <Badge tone={idVerification.tone}>ID Verification {idVerification.label}</Badge>
            <Badge tone={paymentConfirmation.tone}>Payment Confirmation {paymentConfirmation.label}</Badge>
            <Badge tone={roomReadiness.tone}>{roomReadiness.label}</Badge>
            {bookingGroup ? <Badge tone="info">Part of a multi-room booking</Badge> : null}
            {record.issue_type ? <Badge tone="danger">{getIssueTypeLabel(record.issue_type)}</Badge> : null}
          </div>
        </header>

        {queryParams.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{queryParams.message}</div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Top Operational Summary</CardTitle>
            <CardDescription>Who this is, where they are staying, and what needs staff attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow label="Guest name" value={record.full_name} />
              <InfoRow label="Stay status" value={<Badge tone={checkinStatusTone[record.status]}>{getCheckinStatusLabel(record.status)}</Badge>} />
              <InfoRow label="Room / Suite" value={roomName} />
              <InfoRow label="Stay period" value={formatStayRangeWithNights(record.check_in_date, record.check_out_date)} />
              <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, record.booking_source)} />
              <InfoRow label="Balance Due" value={formatPkr(financialSummary.outstanding)} />
              <InfoRow label="ID Verification" value={<Badge tone={idVerification.tone}>{idVerification.label}</Badge>} />
              <InfoRow label="Payment Confirmation" value={<Badge tone={paymentConfirmation.tone}>{paymentConfirmation.label}</Badge>} />
              <InfoRow label="Room Readiness" value={<Badge tone={roomReadiness.tone}>{roomReadiness.label}</Badge>} />
              <InfoRow label="Guests" value={record.number_of_guests} />
              <InfoRow label="Payment Status" value={findLabel(paymentStatusOptions, record.payment_status)} />
              <InfoRow label="Multi-room booking" value={bookingGroup ? "Part of a multi-room booking" : "Single-room stay"} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Alerts / Needs Attention</CardTitle>
            <CardDescription>These are not hard blockers; they make operational risk visible so staff can recover quickly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityAlerts.length ? (
              priorityAlerts.map((alert) => (
                <div key={alert.title} className={`rounded-lg border p-4 text-sm ${alertToneClass(alert.tone)}`}>
                  <p className="flex items-center gap-2 font-semibold">
                    <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                    {alert.title}
                  </p>
                  <p className="mt-1">{alert.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                No priority alerts. This Guest Stay is ready for the next normal staff step.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Panel</CardTitle>
            <CardDescription>Main staff actions for this Guest Stay. Links open existing workflows only.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Button asChild variant="outline">
              <a href="#documents-verification">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Verify ID / Documents
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#documents-verification">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Verify Payment Confirmation
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#payment-charges">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Add Additional Charge
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#admin-actions">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Extend Stay
              </a>
            </Button>
            <Button asChild>
              <Link href={`/admin/guest-records/${record.id}/receipt`} aria-label="View Accommodation Receipt">
                <FileText className="h-4 w-4" aria-hidden="true" />
                View Receipt
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/guest-records/${record.id}/receipt?print=1`}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print / Download Receipt
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={getWhatsAppGuestHref(record.phone, receiptMessage)} target="_blank" rel="noreferrer" aria-label="Send receipt via WhatsApp">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Send Receipt via WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#guest-messages">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Message Guest on WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#admin-actions">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Check in / Check out
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
                    <InfoRow label="Lead outstanding reference / Balance Due" value={formatPkr(combinedOutstanding)} />
                    <InfoRow label="Linked stays" value={linkedStays.length} />
                  </dl>
                </div>

                <div className="rounded-lg border border-brand-sage bg-white p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-brand-deep">Linked rooms/stays</p>
                      <p className="text-sm text-slate-600">Linked stays/rooms remain separate operational records.</p>
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
                                    <Badge tone={stay.cnic_verified ? "success" : "warning"}>ID {stay.cnic_verified ? "verified" : "pending"}</Badge>
                                    <Badge tone={stay.payment_verified ? "success" : "warning"}>
                                      Payment Confirmation {stay.payment_verified ? "verified" : "pending"}
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

        <Card id="repeat-guest-history">
          <CardHeader>
            <CardTitle>Repeat Guest / Stay History</CardTitle>
            <CardDescription>
              Guest profile foundation from previous room-level stays. Previous rates and documents are guidance only; current stay payment and verification remain separate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <InfoRow label="Repeat guest" value={previousStays.length || record.has_stayed_before ? "Appears to be a repeat guest" : "No previous stays found"} />
              <InfoRow label="Previous stay count" value={previousStays.length} />
              <InfoRow
                label="Previous documents"
                value={
                  previousStayDocuments?.length
                    ? "Previous ID/supporting documents on file"
                    : previousDocumentsAddedForReview.length
                      ? "Previous documents added for review"
                      : "None found"
                }
              />
            </div>

            {previousDocumentsAddedForReview.length ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
                <p className="font-semibold">Previous documents added for review</p>
                <p className="mt-1">
                  Reused from previous stay. These documents now appear in this Guest Stay document list. Verified ID documents may remain verified; pending or rejected documents still need staff review.
                </p>
              </div>
            ) : null}

            {previousStayRows.length ? (
              <div className="overflow-x-auto rounded-lg border border-brand-sage">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                    <tr>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Room / Suite</th>
                      <th className="px-4 py-3">Booking Source</th>
                      <th className="px-4 py-3">Rate / Night</th>
                      <th className="px-4 py-3">Expected</th>
                      <th className="px-4 py-3">Paid</th>
                      <th className="px-4 py-3">Balance Due</th>
                      <th className="px-4 py-3">Documents</th>
                      <th className="px-4 py-3">Stay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sage/70">
                    {previousStayRows.map((stay) => {
                      const previousRoom = stay.assigned_room_id ? rooms?.find((room) => room.id === stay.assigned_room_id) ?? null : null;
                      const previousDocuments = previousDocumentsByStay.get(stay.id) ?? [];
                      const previousBalance = getBalanceDue(stay) ?? 0;

                      return (
                        <tr key={stay.id} className="bg-white">
                          <td className="px-4 py-3">{formatStayRangeWithNights(stay.check_in_date, stay.check_out_date)}</td>
                          <td className="px-4 py-3">{previousRoom ? formatUnitRoomLabel(previousRoom) : "Not assigned"}</td>
                          <td className="px-4 py-3">{findLabel(bookingSourceOptions, stay.booking_source)}</td>
                          <td className="px-4 py-3">{getRatePerNightLabel(stay)}</td>
                          <td className="px-4 py-3">{formatPkr(stay.total_expected_amount_pkr ?? stay.agreed_room_rate_pkr)}</td>
                          <td className="px-4 py-3">{formatPkr(stay.amount_paid_pkr)}</td>
                          <td className="px-4 py-3">
                            {previousBalance > 0 ? <Badge tone="warning">{formatPkr(previousBalance)}</Badge> : <Badge tone="success">Clear</Badge>}
                          </td>
                          <td className="px-4 py-3">
                            {previousDocuments.length ? (
                              <Badge tone="info">ID/supporting on file</Badge>
                            ) : (
                              <Badge tone="neutral">None found</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/guest-records/${stay.id}`}>Open</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-slate-600">
                No earlier matching Guest Stays found by phone, email, or ID/passport.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.95fr)]">
          <div className="space-y-6">
            <Card id="stay-details">
              <CardHeader>
                <CardTitle>Guest Stay Details</CardTitle>
                <CardDescription>One operational view of the guest, stay context, and staff notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Full name" value={record.full_name} />
                  <InfoRow label="Phone" value={record.phone} />
                  <InfoRow label="Email" value={record.email} />
                  <InfoRow label="Guest count" value={record.number_of_guests} />
                  <InfoRow label="ID / passport" value={maskSensitiveId(record.cnic_passport_number)} />
                  <InfoRow label="Stay period" value={formatStayRangeWithNights(record.check_in_date, record.check_out_date)} />
                  <InfoRow label="Room / Suite" value={roomName} />
                  <InfoRow label="Guest type" value={guestTypeLabel} />
                  <InfoRow label="Booking source" value={findLabel(bookingSourceOptions, record.booking_source)} />
                  <InfoRow label="Stayed before" value={record.has_stayed_before ? "Yes" : "No"} />
                  <InfoRow label="Travelling from" value={record.city_country_from} />
                  <InfoRow label="Arrival time" value={record.estimated_arrival_time} />
                  <InfoRow label="Purpose" value={findLabel(purposeOptions, record.purpose_of_visit)} />
                  <InfoRow label="Payment method" value={findLabel(paymentMethodOptions, record.payment_method)} />
                  <InfoRow label="Address" value={record.address} />
                </dl>
                <div className="mt-3 rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Special requests</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.special_requests || "None"}</dd>
                </div>
                <div className="rounded-lg bg-brand-ivory p-3">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Internal notes</dt>
                  <dd className="mt-1 text-sm leading-6 text-brand-deep">{record.internal_notes || "None"}</dd>
                </div>
              </CardContent>
            </Card>

            <Card id="guest-messages">
              <CardHeader>
                <CardTitle>Guest Messages / WhatsApp</CardTitle>
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

            <Card id="documents-verification">
              <CardHeader>
                <CardTitle>Documents / ID Verification</CardTitle>
                <CardDescription>
                  Links are short-lived signed URLs from the private storage bucket. Newest uploads are shown first.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <DocumentGroup title="Primary ID / passport" documents={primaryDocuments} />
                <DocumentGroup title="Additional guest IDs/passports" documents={additionalDocuments} />
                <DocumentGroup title="Payment Confirmation" documents={paymentDocuments} />
                <DocumentGroup title="Supporting Documents" documents={supportingDocuments} />
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
                <form action={uploadGuestRecordDocuments} encType="multipart/form-data" className="grid gap-4 sm:grid-cols-2">
                  <input type="hidden" name="id" value={record.id} />
                  <div className="space-y-2">
                    <Label htmlFor="primary_document">Primary guest ID/passport</Label>
                    <Input id="primary_document" name="primary_document" type="file" accept="image/*,.pdf" capture="environment" multiple />
                    <p className="text-xs text-slate-500">
                      Upload one or more images/files for the primary guest ID or passport. You can upload files or take a photo from a supported device.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="additional_documents">Additional guest IDs/passports</Label>
                    <Input id="additional_documents" name="additional_documents" type="file" accept="image/*,.pdf" capture="environment" multiple />
                    <p className="text-xs text-slate-500">
                      Upload ID/passport files for additional guests. You can upload files or take a photo from a supported device.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_proof">Payment Confirmation</Label>
                    <Input id="payment_proof" name="payment_proof" type="file" accept="image/*,.pdf" capture="environment" />
                    <p className="text-xs text-slate-500">
                      Optional. Upload later even if confirmation was missing originally. You can upload files or take a photo from a supported device.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supporting_documents">Supporting Documents</Label>
                    <Input id="supporting_documents" name="supporting_documents" type="file" accept="image/*,.pdf" capture="environment" multiple />
                    <p className="text-xs text-slate-500">
                      Marriage certificate, authorization letter, company letter, or other supporting document. You can upload files or take a photo from a supported device.
                    </p>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit">Upload documents</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card id="payment-charges">
              <CardHeader>
                <CardTitle>Payment & Charges</CardTitle>
                <CardDescription>
                  Operational charges for services like breakfast, tea, laundry, late checkout, extra bedding, or damages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <InfoRow label="Accommodation Charges" value={formatPkr(financialSummary.baseExpected)} />
                  <InfoRow label="Additional Charges" value={formatPkr(financialSummary.chargesTotal)} />
                  <InfoRow label="Total Amount" value={formatPkr(financialSummary.totalExpected)} />
                  <InfoRow label="Amount Paid" value={formatPkr(financialSummary.totalPaid)} />
                  <InfoRow label="Balance Due" value={formatPkr(financialSummary.outstanding)} />
                  <InfoRow label="Payment Method" value={findLabel(paymentMethodOptions, record.payment_method)} />
                  <InfoRow label="Payment Status" value={findLabel(paymentStatusOptions, record.payment_status)} />
                  <InfoRow label="Payment Confirmation status" value={paymentConfirmation.label} />
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
                                    <Select name="payment_method" defaultValue="cash" aria-label="Additional charge payment method" className="h-9 w-36">
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

            <Card id="admin-actions">
              <CardHeader>
                <CardTitle>Admin Controls</CardTitle>
                <CardDescription>Update status, room assignment, payment state, verification, and notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 rounded-lg border border-brand-sage bg-brand-ivory p-4">
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
                  If ID number or document is incorrect, mark as Needs Attention, add a note, message the guest, then upload
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
                      Mark as Needs Attention / Needs Correction
                    </Button>
                  </form>
                ) : null}
              </div>

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
                <input type="hidden" name="advance_paid_amount_pkr" value={record.advance_paid_amount_pkr ?? ""} />

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
                    <Label htmlFor="issue_type">Needs Attention type</Label>
                    <Select id="issue_type" name="issue_type" defaultValue={record.issue_type ?? ""}>
                      <option value="">No Needs Attention type</option>
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
                    ID/passport received and verified
                  </label>
                  <label className="flex items-center gap-3 text-sm font-medium text-brand-deep">
                    <input type="checkbox" name="payment_verified" defaultChecked={record.payment_verified} className="h-4 w-4 accent-brand-fresh" />
                    Payment Confirmation verified
                  </label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internal_notes">Internal notes</Label>
                  <Textarea id="internal_notes" name="internal_notes" defaultValue={record.internal_notes ?? ""} rows={6} />
                </div>

                <Button type="submit" className="w-full">Save admin changes</Button>
              </form>

              <form action={extendGuestStay} className="grid gap-4 rounded-lg border border-brand-sage bg-white p-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={record.id} />
                <div className="sm:col-span-2">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
