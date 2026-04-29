import type { Database } from "@/types/database";

export type PurposeOfVisit = Database["public"]["Enums"]["purpose_of_visit"];
export type BookingSource = Database["public"]["Enums"]["booking_source"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type CheckinStatus = Database["public"]["Enums"]["checkin_status"];
export type GuestType = Database["public"]["Enums"]["guest_type"];
export type GuestTag = Database["public"]["Enums"]["guest_tag"];
export type DocumentStatus = Database["public"]["Tables"]["guest_documents"]["Row"]["document_status"];
export type IssueType = NonNullable<Database["public"]["Tables"]["guest_checkins"]["Row"]["issue_type"]>;
export type RoomStatus = Database["public"]["Enums"]["room_status"];
export type ExpenseCategory = Database["public"]["Enums"]["expense_category"];
export type MaintenanceStatus = Database["public"]["Enums"]["maintenance_status"];

export const purposeOptions: Array<{ value: PurposeOfVisit; label: string }> = [
  { value: "family_visit", label: "Family visit" },
  { value: "business", label: "Business" },
  { value: "medical", label: "Medical" },
  { value: "tourism", label: "Tourism" },
  { value: "event_wedding", label: "Event / wedding" },
  { value: "other", label: "Other" },
];

export const bookingSourceOptions: Array<{ value: BookingSource; label: string }> = [
  { value: "booking_com", label: "Booking.com" },
  { value: "airbnb", label: "Airbnb" },
  { value: "direct_whatsapp_call", label: "Direct WhatsApp / call" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" },
];

export const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "online_payment", label: "Online payment" },
  { value: "other", label: "Other" },
];

export const paymentStatusOptions: Array<{ value: PaymentStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
];

export const checkinStatusOptions: Array<{ value: CheckinStatus; label: string }> = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "checked_in", label: "Checked-in" },
  { value: "checked_out", label: "Checked-out" },
  { value: "issue", label: "Issue" },
];

export const guestCheckinStatusLabels: Record<CheckinStatus, string> = {
  submitted: "Submitted - awaiting management review",
  under_review: "Being reviewed",
  approved: "Approved - ready for arrival",
  checked_in: "Checked in",
  checked_out: "Checked out",
  issue: "Action needed - please contact GreenLux management.",
};

export const checkinStatusTone: Record<CheckinStatus, "neutral" | "success" | "warning" | "danger" | "info" | "blue"> = {
  submitted: "neutral",
  under_review: "warning",
  approved: "success",
  checked_in: "blue",
  checked_out: "info",
  issue: "danger",
};

export const guestTagOptions: Array<{ value: GuestTag; label: string }> = [
  { value: "new", label: "New" },
  { value: "repeat", label: "Repeat" },
  { value: "vip", label: "VIP" },
  { value: "issue", label: "Issue" },
  { value: "do_not_host", label: "Do not host" },
];

export const guestTypeOptions: Array<{ value: GuestType; label: string }> = [
  { value: "self_registered", label: "Self-registered" },
  { value: "admin_created", label: "Staff-created" },
];

export const documentStatusOptions: Array<{ value: DocumentStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export const issueTypeOptions: Array<{ value: IssueType; label: string }> = [
  { value: "cnic_pending", label: "CNIC pending" },
  { value: "payment_pending", label: "Payment pending" },
  { value: "missing_documents", label: "Missing documents" },
  { value: "guest_exception", label: "Guest exception" },
  { value: "other", label: "Other" },
];

export const exceptionReasonOptions = [
  { value: "cnic_pending", label: "CNIC pending" },
  { value: "payment_pending", label: "Payment pending" },
  { value: "known_guest", label: "Known guest" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
] as const;

export type ExceptionReason = (typeof exceptionReasonOptions)[number]["value"];

export const roomStatusOptions: Array<{ value: RoomStatus; label: string }> = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "maintenance", label: "Maintenance" },
];

export const expenseCategoryOptions: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "maintenance", label: "Maintenance" },
  { value: "repairs", label: "Repairs" },
  { value: "cleaning", label: "Cleaning" },
  { value: "salaries", label: "Staff salaries" },
  { value: "electricity", label: "Electricity" },
  { value: "gas", label: "Gas" },
  { value: "internet", label: "Internet" },
  { value: "laundry", label: "Laundry" },
  { value: "supplies", label: "Supplies" },
  { value: "platform_commission", label: "Platform commissions" },
  { value: "other", label: "Other" },
];

export const maintenanceStatusOptions: Array<{ value: MaintenanceStatus; label: string }> = [
  { value: "reported", label: "Reported" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
];

export const bankTransferDetails = {
  accountName: "Aamir Zaffar Chaudhry",
  bank: "Bank of Punjab",
  accountNumber: "6050045476200018",
};

export function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPkr(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Not set";
  }

  return `Rs ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value)}`;
}

export function getExpectedAmount(checkin: {
  total_expected_amount_pkr: number | null;
  agreed_room_rate_pkr: number | null;
}) {
  return checkin.total_expected_amount_pkr ?? checkin.agreed_room_rate_pkr;
}

export function getBalanceDue(checkin: {
  total_expected_amount_pkr: number | null;
  agreed_room_rate_pkr: number | null;
  amount_paid_pkr: number | null;
}) {
  const expected = getExpectedAmount(checkin);

  if (expected === null || expected === undefined) {
    return null;
  }

  return Math.max(expected - (checkin.amount_paid_pkr ?? 0), 0);
}

export function maskSensitiveId(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || trimmed.length <= 4) {
    return trimmed;
  }

  return `${"*".repeat(Math.max(trimmed.length - 4, 4))}${trimmed.slice(-4)}`;
}

export function normalizePhoneForWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }

  if (digits.startsWith("0")) {
    return `92${digits.slice(1)}`;
  }

  return digits;
}

export function getWhatsAppGuestHref(phone: string, message: string) {
  return `https://wa.me/${normalizePhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}

export function getCheckinStatusLabel(status: CheckinStatus) {
  return checkinStatusOptions.find((option) => option.value === status)?.label ?? formatEnumLabel(status);
}

export function getDocumentStatusLabel(status: DocumentStatus) {
  return documentStatusOptions.find((option) => option.value === status)?.label ?? formatEnumLabel(status);
}

export function getIssueTypeLabel(issueType: IssueType | string | null | undefined) {
  if (!issueType) {
    return "No issue type";
  }

  return issueTypeOptions.find((option) => option.value === issueType)?.label ?? formatEnumLabel(issueType);
}

export function getExceptionReasonLabel(reason: ExceptionReason) {
  return exceptionReasonOptions.find((option) => option.value === reason)?.label ?? formatEnumLabel(reason);
}

export function mapExceptionReasonToIssueType(reason: ExceptionReason): IssueType {
  if (reason === "known_guest" || reason === "emergency") {
    return "guest_exception";
  }

  return reason;
}

export function getApprovalMissingRequirements(checkin: {
  assigned_room_id: string | null;
  cnic_verified: boolean;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_verified: boolean;
}) {
  const missing: string[] = [];

  if (!checkin.assigned_room_id) {
    missing.push("Room not assigned");
  }

  if (!checkin.cnic_verified) {
    missing.push("CNIC not verified");
  }

  if (!isPaymentConfirmed(checkin)) {
    missing.push("Payment not confirmed");
  }

  return missing;
}

export function isPaymentConfirmed(checkin: {
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_verified: boolean;
}) {
  return checkin.payment_method === "cash" || checkin.payment_status === "paid" || checkin.payment_status === "partial" || checkin.payment_verified;
}

export function isReadyToApprove(checkin: {
  status: CheckinStatus;
  assigned_room_id: string | null;
  cnic_verified: boolean;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_verified: boolean;
}) {
  return (
    (checkin.status === "submitted" || checkin.status === "under_review") &&
    getApprovalMissingRequirements(checkin).length === 0
  );
}

export function isReadyForCheckin(checkin: {
  assigned_room_id: string | null;
  cnic_verified: boolean;
  payment_verified: boolean;
  status: CheckinStatus;
}) {
  const awaitingArrival = checkin.status === "submitted" || checkin.status === "under_review" || checkin.status === "approved";
  return Boolean(checkin.assigned_room_id) && checkin.cnic_verified && checkin.payment_verified && awaitingArrival;
}

export function getActionRequiredLabel(checkin: {
  status: CheckinStatus;
  assigned_room_id: string | null;
  cnic_verified: boolean;
  payment_verified: boolean;
}) {
  if (checkin.status === "issue") {
    return "Issue flagged";
  }

  if (checkin.status === "checked_out") {
    return "Completed";
  }

  if (checkin.status === "checked_in") {
    return "Check out guest";
  }

  if (checkin.status === "approved") {
    return "Check in guest";
  }

  if (!checkin.assigned_room_id) {
    return "Assign room";
  }

  if (!checkin.cnic_verified) {
    return "Verify CNIC";
  }

  if (!checkin.payment_verified) {
    return "Verify payment";
  }

  return "Ready for check-in";
}

export function getBusinessTodayDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}
