"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles, superAdminRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  checkinStatusOptions,
  documentStatusOptions,
  exceptionReasonOptions,
  getApprovalMissingRequirements,
  getCheckinStatusLabel,
  getExceptionReasonLabel,
  getGuestChargeLabel,
  guestTagOptions,
  guestChargeOptions,
  issueTypeOptions,
  isReadyForCheckin,
  isReadyToApprove,
  mapExceptionReasonToIssueType,
  paymentMethodOptions,
  paymentStatusOptions,
} from "@/lib/check-in/options";
import { findUnitAssignmentConflict, formatUnitConflictMessage } from "@/lib/check-in/unit-availability";
import { isAllowedUploadMimeType, isAllowedUploadSize } from "@/lib/validation/uploads";
import type { Database, Json } from "@/types/database";

type DocumentType = Database["public"]["Enums"]["document_type"];
type DocumentStatus = Database["public"]["Tables"]["guest_documents"]["Row"]["document_status"];
type GuestCheckinUpdate = Database["public"]["Tables"]["guest_checkins"]["Update"];
type GuestCheckinRow = Database["public"]["Tables"]["guest_checkins"]["Row"];
type SupabaseClient = Awaited<ReturnType<typeof requireRole>>["supabase"];

const nullableNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const nullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
};

async function setLatestDocumentStatus(
  supabase: SupabaseClient,
  checkinId: string,
  documentType: DocumentType,
  documentStatus: DocumentStatus,
) {
  const { data: latestDocument, error } = await supabase
    .from("guest_documents")
    .select("id")
    .eq("checkin_id", checkinId)
    .eq("document_type", documentType)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!latestDocument) {
    return false;
  }

  const { error: updateError } = await supabase
    .from("guest_documents")
    .update({ document_status: documentStatus })
    .eq("id", latestDocument.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return true;
}

async function clearVerifiedDocuments(supabase: SupabaseClient, checkinId: string, documentType: DocumentType) {
  const { error } = await supabase
    .from("guest_documents")
    .update({ document_status: "pending" })
    .eq("checkin_id", checkinId)
    .eq("document_type", documentType)
    .eq("document_status", "verified");

  if (error) {
    throw new Error(error.message);
  }
}

async function hasVerifiedDocument(supabase: SupabaseClient, checkinId: string, documentType: DocumentType) {
  const { data, error } = await supabase
    .from("guest_documents")
    .select("id")
    .eq("checkin_id", checkinId)
    .eq("document_type", documentType)
    .eq("document_status", "verified")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

function appendInternalNote(existing: string | null, note: string) {
  return [existing?.trim(), note].filter(Boolean).join("\n");
}

function formatNoteAmount(value: number | null | undefined) {
  return value === null || value === undefined ? "0" : new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);
}

const updateGuestRecordSchema = z.object({
  id: z.uuid(),
  assigned_room_id: z.uuid().nullable(),
  booking_group_id: z.uuid().nullable(),
  agreed_room_rate_pkr: z.number().min(0).nullable(),
  advance_paid_amount_pkr: z.number().min(0).nullable(),
  total_expected_amount_pkr: z.number().min(0).nullable(),
  amount_paid_pkr: z.number().min(0).nullable(),
  payment_status: z.enum(paymentStatusOptions.map((option) => option.value)),
  guest_tag: z.enum(guestTagOptions.map((option) => option.value)),
  issue_type: z.enum(issueTypeOptions.map((option) => option.value)).nullable(),
  internal_notes: z.string().nullable(),
  cnic_verified: z.boolean(),
  payment_verified: z.boolean(),
});

const correctionReasonOptions = [
  "data_entry_mistake",
  "guest_extended_stay",
  "wrong_room_selected",
  "payment_amount_corrected",
  "booking_source_corrected",
  "duplicate_repeat_guest_correction",
  "document_status_correction",
  "other",
] as const;

const superAdminCorrectionSchema = z
  .object({
    id: z.uuid(),
    full_name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    email: z.string().trim().nullable(),
    cnic_passport_number: z.string().trim().nullable(),
    check_in_date: z.string().trim().min(1),
    check_out_date: z.string().trim().min(1),
    assigned_room_id: z.uuid().nullable(),
    booking_group_id: z.uuid().nullable(),
    booking_source: z.enum(bookingSourceOptions.map((option) => option.value)),
    number_of_guests: z.number().int().min(1),
    status: z.enum(checkinStatusOptions.map((option) => option.value)),
    payment_status: z.enum(paymentStatusOptions.map((option) => option.value)),
    payment_method: z.enum(paymentMethodOptions.map((option) => option.value)),
    agreed_room_rate_pkr: z.number().min(0).nullable(),
    total_expected_amount_pkr: z.number().min(0).nullable(),
    amount_paid_pkr: z.number().min(0).nullable(),
    internal_notes: z.string().trim().nullable(),
    cnic_verified: z.boolean(),
    payment_verified: z.boolean(),
    correction_reason: z.enum(correctionReasonOptions),
    correction_note: z.string().trim().nullable(),
  })
  .superRefine((values, context) => {
    if (values.check_out_date <= values.check_in_date) {
      context.addIssue({
        code: "custom",
        path: ["check_out_date"],
        message: "Check-out date must be after check-in date.",
      });
    }

    if (values.correction_reason === "other" && !values.correction_note) {
      context.addIssue({
        code: "custom",
        path: ["correction_note"],
        message: "Add an internal note when the correction reason is Other.",
      });
    }
  });

function serializeAuditValue(value: unknown): Json {
  if (value === undefined) {
    return null;
  }

  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return String(value);
}

function getChangedFields(
  currentRecord: GuestCheckinRow,
  nextValues: Pick<
    GuestCheckinUpdate,
    | "full_name"
    | "phone"
    | "email"
    | "cnic_passport_number"
    | "check_in_date"
    | "check_out_date"
    | "assigned_room_id"
    | "booking_group_id"
    | "booking_source"
    | "number_of_guests"
    | "status"
    | "payment_status"
    | "payment_method"
    | "agreed_room_rate_pkr"
    | "total_expected_amount_pkr"
    | "amount_paid_pkr"
    | "internal_notes"
    | "cnic_verified"
    | "payment_verified"
  >,
) {
  return Object.entries(nextValues)
    .filter(([field, newValue]) => currentRecord[field as keyof GuestCheckinRow] !== newValue)
    .map(([field, newValue]) => ({
      field_name: field,
      old_value: serializeAuditValue(currentRecord[field as keyof GuestCheckinRow]),
      new_value: serializeAuditValue(newValue),
    }));
}

export async function saveSuperAdminGuestCorrection(formData: FormData) {
  const { supabase, profile } = await requireRole(superAdminRoles);
  const parsed = superAdminCorrectionSchema.safeParse({
    id: formData.get("id"),
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: nullableString(formData.get("email")),
    cnic_passport_number: nullableString(formData.get("cnic_passport_number")),
    check_in_date: formData.get("check_in_date"),
    check_out_date: formData.get("check_out_date"),
    assigned_room_id: nullableString(formData.get("assigned_room_id")),
    booking_group_id: nullableString(formData.get("booking_group_id")),
    booking_source: formData.get("booking_source"),
    number_of_guests: Number(formData.get("number_of_guests") || 1),
    status: formData.get("status"),
    payment_status: formData.get("payment_status"),
    payment_method: formData.get("payment_method"),
    agreed_room_rate_pkr: nullableNumber(formData.get("agreed_room_rate_pkr")),
    total_expected_amount_pkr: nullableNumber(formData.get("total_expected_amount_pkr")),
    amount_paid_pkr: nullableNumber(formData.get("amount_paid_pkr")),
    internal_notes: nullableString(formData.get("internal_notes")),
    cnic_verified: formData.get("cnic_verified") === "on",
    payment_verified: formData.get("payment_verified") === "on",
    correction_reason: formData.get("correction_reason"),
    correction_note: nullableString(formData.get("correction_note")),
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid super admin correction. Correction reason is required.")}`);
  }

  const { id, correction_reason, correction_note, ...nextValues } = parsed.data;
  const { data: currentRecord, error: currentRecordError } = await supabase
    .from("guest_checkins")
    .select("*")
    .eq("id", id)
    .single();

  if (currentRecordError || !currentRecord) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(currentRecordError?.message ?? "Guest record not found.")}`);
  }

  const changed_fields = getChangedFields(currentRecord as GuestCheckinRow, nextValues);

  if (changed_fields.length === 0) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("No correction changes were detected.")}`);
  }

  let roomAssignmentOverlapWarning: string | null = null;

  if (
    nextValues.assigned_room_id &&
    (nextValues.assigned_room_id !== currentRecord.assigned_room_id ||
      nextValues.check_in_date !== currentRecord.check_in_date ||
      nextValues.check_out_date !== currentRecord.check_out_date)
  ) {
    try {
      const conflict = await findUnitAssignmentConflict(supabase, {
        assignedRoomId: nextValues.assigned_room_id,
        checkInDate: nextValues.check_in_date,
        checkOutDate: nextValues.check_out_date,
        excludeCheckinId: id,
      });

      if (conflict) {
        roomAssignmentOverlapWarning = formatUnitConflictMessage(conflict);
      }
    } catch (error) {
      roomAssignmentOverlapWarning = error instanceof Error ? error.message : "Could not check unit overlap.";
    }
  }

  const financialFields = ["agreed_room_rate_pkr", "total_expected_amount_pkr", "amount_paid_pkr", "payment_status", "payment_method"];
  const old_values: Record<string, Json> = Object.fromEntries(changed_fields.map((change) => [change.field_name, change.old_value]));
  const new_values: Record<string, Json> = Object.fromEntries(changed_fields.map((change) => [change.field_name, change.new_value]));
  const correctionMetadata: Json = {
    correction_reason,
    correction_note,
    changed_fields,
    old_values,
    new_values,
    financial_correction: changed_fields.some((change) => financialFields.includes(change.field_name)),
    room_assignment_overlap_warning: roomAssignmentOverlapWarning,
    lead_booking_context_only: true,
    audit_recorded_before_update: true,
  };

  const { error: auditError } = await supabase.from("audit_logs").insert({
    actor_user_id: profile.id,
    action: "super_admin_guest_stay_correction",
    entity_type: "guest_checkins",
    entity_id: id,
    metadata: correctionMetadata,
  });

  if (auditError) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(`Correction was not saved because audit logging failed: ${auditError.message}`)}`);
  }

  const { error } = await supabase.from("guest_checkins").update(nextValues).eq("id", id);

  if (error) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${id}`);
  revalidatePath("/admin/reports");
  const message = roomAssignmentOverlapWarning
    ? `Correction saved. Room overlap warning: ${roomAssignmentOverlapWarning}`
    : "Super Admin correction saved and audit logged.";
  redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(message)}`);
}

export async function updateGuestRecord(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);

  const parsed = updateGuestRecordSchema.safeParse({
    id: formData.get("id"),
    assigned_room_id: nullableString(formData.get("assigned_room_id")),
    booking_group_id: nullableString(formData.get("booking_group_id")),
    agreed_room_rate_pkr: nullableNumber(formData.get("agreed_room_rate_pkr")),
    advance_paid_amount_pkr: nullableNumber(formData.get("advance_paid_amount_pkr")),
    total_expected_amount_pkr: nullableNumber(formData.get("total_expected_amount_pkr")),
    amount_paid_pkr: nullableNumber(formData.get("amount_paid_pkr")),
    payment_status: formData.get("payment_status"),
    guest_tag: formData.get("guest_tag"),
    issue_type: nullableString(formData.get("issue_type")),
    internal_notes: nullableString(formData.get("internal_notes")),
    cnic_verified: formData.get("cnic_verified") === "on",
    payment_verified: formData.get("payment_verified") === "on",
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid guest record update.")}`);
  }

  const { id, cnic_verified, payment_verified, payment_status, ...payload } = parsed.data;
  const { data: currentRecord, error: currentRecordError } = await supabase
    .from("guest_checkins")
    .select("status,assigned_room_id,booking_group_id,check_in_date,check_out_date")
    .eq("id", id)
    .single();

  if (currentRecordError || !currentRecord) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(currentRecordError?.message ?? "Guest record not found.")}`);
  }

  if (payload.assigned_room_id && payload.assigned_room_id !== currentRecord.assigned_room_id) {
    let conflict: Awaited<ReturnType<typeof findUnitAssignmentConflict>> = null;

    try {
      conflict = await findUnitAssignmentConflict(supabase, {
        assignedRoomId: payload.assigned_room_id,
        checkInDate: currentRecord.check_in_date,
        checkOutDate: currentRecord.check_out_date,
        excludeCheckinId: id,
      });
    } catch (error) {
      redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(error instanceof Error ? error.message : "Could not check unit availability.")}`);
    }

    if (conflict) {
      redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(formatUnitConflictMessage(conflict))}`);
    }
  }

  let cnicVerified = cnic_verified;
  const paymentVerified = payment_status === "paid" ? true : payment_verified;

  try {
    if (cnic_verified) {
      await setLatestDocumentStatus(supabase, id, "primary_cnic", "verified");
    } else {
      await clearVerifiedDocuments(supabase, id, "primary_cnic");
    }

    cnicVerified = await hasVerifiedDocument(supabase, id, "primary_cnic");

    if (payment_status === "paid" || payment_verified) {
      await setLatestDocumentStatus(supabase, id, "payment_proof", "verified");
    } else {
      await clearVerifiedDocuments(supabase, id, "payment_proof");
    }
  } catch (error) {
    redirect(
      `/admin/guest-records/${id}?message=${encodeURIComponent(
        error instanceof Error ? error.message : "Document status update failed.",
      )}`,
    );
  }

  const updatePayload: GuestCheckinUpdate = {
    ...payload,
    payment_status,
    cnic_verified: cnicVerified,
    payment_verified: paymentVerified,
    ...(currentRecord?.status === "submitted" ? { status: "under_review" as const } : {}),
  };
  const { error } = await supabase.from("guest_checkins").update(updatePayload).eq("id", id);

  if (error) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(error.message)}`);
  }

  if (payload.booking_group_id !== currentRecord.booking_group_id) {
    await supabase.from("audit_logs").insert({
      actor_user_id: profile.id,
      action: "guest_booking_group_updated",
      entity_type: "guest_checkins",
      entity_id: id,
      metadata: {
        old_booking_group_id: currentRecord.booking_group_id,
        new_booking_group_id: payload.booking_group_id,
      },
    });
  }

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${id}`);
  redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("Guest record updated.")}`);
}

const createBookingGroupFromGuestRecordSchema = z.object({
  id: z.uuid(),
});

export async function createBookingGroupFromGuestRecord(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const parsed = createBookingGroupFromGuestRecordSchema.safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid booking group request.")}`);
  }

  const { id } = parsed.data;
  const { data: record, error: recordError } = await supabase
    .from("guest_checkins")
    .select(
      "id,full_name,phone,email,booking_source,check_in_date,check_out_date,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr,booking_group_id,internal_notes",
    )
    .eq("id", id)
    .single();

  if (recordError || !record) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(recordError?.message ?? "Guest record not found.")}`);
  }

  if (record.booking_group_id) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("This stay is already linked to a multi-room booking.")}`);
  }

  const { data: bookingGroup, error: bookingGroupError } = await supabase
    .from("booking_groups")
    .insert({
      lead_guest_name: record.full_name,
      lead_guest_phone: record.phone,
      lead_guest_email: record.email,
      booking_source: record.booking_source,
      check_in_date: record.check_in_date,
      check_out_date: record.check_out_date,
      expected_total_amount: record.total_expected_amount_pkr ?? record.agreed_room_rate_pkr,
      paid_total_amount: record.amount_paid_pkr,
      notes: record.internal_notes,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (bookingGroupError || !bookingGroup) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(bookingGroupError?.message ?? "Could not create booking group.")}`);
  }

  const { error: updateError } = await supabase.from("guest_checkins").update({ booking_group_id: bookingGroup.id }).eq("id", id);

  if (updateError) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(updateError.message)}`);
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: profile.id,
    action: "booking_group_created",
    entity_type: "booking_groups",
    entity_id: bookingGroup.id,
    metadata: {
      source: "guest_record_detail",
      first_guest_checkin_id: id,
    },
  });

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${id}`);
  redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("Multi-room booking created and linked to this stay.")}`);
}

const statusActionSchema = z.object({
  id: z.uuid(),
  status: z.enum(checkinStatusOptions.map((option) => option.value)),
  exception_reason: z.enum(exceptionReasonOptions.map((option) => option.value)).optional(),
});

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/admin/guest-records")) {
    return fallback;
  }

  return value;
}

function withMessage(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}message=${encodeURIComponent(message)}`;
}

export async function updateCheckinStatus(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const parsed = statusActionSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    exception_reason: nullableString(formData.get("exception_reason")) ?? undefined,
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid status update.")}`);
  }

  const { id, status, exception_reason } = parsed.data;
  const returnTo = safeReturnTo(formData.get("return_to"), `/admin/guest-records/${id}`);

  const { data: record, error: fetchError } = await supabase
    .from("guest_checkins")
    .select("status,assigned_room_id,cnic_verified,payment_status,payment_method,payment_verified,internal_notes")
    .eq("id", id)
    .single();

  if (fetchError || !record) {
    redirect(withMessage(returnTo, fetchError?.message ?? "Guest record not found."));
  }

  if (status === "approved") {
    const missing = getApprovalMissingRequirements(record);
    if (record.status !== "submitted" && record.status !== "under_review") {
      redirect(withMessage(returnTo, "Only submitted or under-review records can be approved."));
    }

    if (missing.length > 0 || !isReadyToApprove(record)) {
      redirect(withMessage(returnTo, `Cannot approve yet: ${missing.join(", ")}.`));
    }
  }

  if (status === "checked_in") {
    if (record.status === "checked_out") {
      redirect(withMessage(returnTo, "Checked-out records cannot be marked checked-in again."));
    }

    const readyForCheckin = isReadyForCheckin(record);
    if (!readyForCheckin && !exception_reason) {
      redirect(withMessage(returnTo, "Select an exception reason before checking in an unverified guest."));
    }
  }

  if (status === "checked_out" && record.status !== "checked_in") {
    redirect(withMessage(returnTo, "Only checked-in records can be marked checked-out."));
  }

  let updatePayload: GuestCheckinUpdate = status === "issue" ? { status, guest_tag: "issue" as const, issue_type: "other" } : { status };

  if (status === "checked_in" && exception_reason) {
    const reasonLabel = getExceptionReasonLabel(exception_reason);
    updatePayload = {
      status,
      guest_tag: "issue",
      issue_type: mapExceptionReasonToIssueType(exception_reason),
      internal_notes: appendInternalNote(record.internal_notes, `Checked-in with exception: ${reasonLabel}`),
    };
  }
  const { error } = await supabase.from("guest_checkins").update(updatePayload).eq("id", id);

  if (error) {
    redirect(withMessage(returnTo, error.message));
  }

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${id}`);
  redirect(withMessage(returnTo, `Status updated to ${getCheckinStatusLabel(status)}.`));
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "document";
}

function getUploadFiles(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function validateUpload(file: File) {
  if (!isAllowedUploadMimeType(file.type) || !isAllowedUploadSize(file.size)) {
    throw new Error("Uploads must be JPG, PNG, or PDF files up to 10 MB each.");
  }
}

async function uploadGuestDocument({
  supabase,
  checkinId,
  uploadedBy,
  documentType,
  file,
}: {
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"];
  checkinId: string;
  uploadedBy: string;
  documentType: DocumentType;
  file: File;
}) {
  validateUpload(file);

  const documentFolder = documentType === "supporting_document" ? "supporting-documents" : documentType;
  const filePath = `${uploadedBy}/${checkinId}/${documentFolder}/admin-${documentType}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage.from("guest-documents").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { error: documentError } = await supabase.from("guest_documents").insert({
    checkin_id: checkinId,
    uploaded_by: uploadedBy,
    document_type: documentType,
    document_status: "pending",
    file_path: filePath,
    file_url: null,
    mime_type: file.type,
  });

  if (documentError) {
    throw new Error(documentError.message);
  }
}

export async function uploadGuestRecordDocuments(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const parsed = z.object({ id: z.uuid() }).safeParse({ id: formData.get("id") });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid document upload request.")}`);
  }

  const { id } = parsed.data;
  const { data: record, error: recordError } = await supabase.from("guest_checkins").select("id").eq("id", id).single();

  if (recordError || !record) {
    redirect(`/admin/guest-records?message=${encodeURIComponent(recordError?.message ?? "Guest record not found.")}`);
  }

  const uploads: Array<{ documentType: DocumentType; file: File }> = [
    ...getUploadFiles(formData, "primary_document").map((file) => ({ documentType: "primary_cnic" as const, file })),
    ...getUploadFiles(formData, "additional_documents").map((file) => ({ documentType: "additional_guest_cnic" as const, file })),
    ...getUploadFiles(formData, "payment_proof").map((file) => ({ documentType: "payment_proof" as const, file })),
    ...getUploadFiles(formData, "supporting_documents").map((file) => ({ documentType: "supporting_document" as const, file })),
  ];

  if (uploads.length === 0) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("Choose at least one document to upload.")}`);
  }

  try {
    for (const upload of uploads) {
      await uploadGuestDocument({
        supabase,
        checkinId: id,
        uploadedBy: profile.id,
        documentType: upload.documentType,
        file: upload.file,
      });
    }
  } catch (error) {
    redirect(
      `/admin/guest-records/${id}?message=${encodeURIComponent(
        error instanceof Error ? error.message : "Document upload failed.",
      )}`,
    );
  }

  revalidatePath(`/admin/guest-records/${id}`);
  redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("Document upload saved. Review verification flags before approval.")}`);
}

const documentStatusSchema = z.object({
  id: z.uuid(),
  checkin_id: z.uuid(),
  document_status: z.enum(documentStatusOptions.map((option) => option.value)),
});

export async function updateGuestDocumentStatus(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const parsed = documentStatusSchema.safeParse({
    id: formData.get("id"),
    checkin_id: formData.get("checkin_id"),
    document_status: formData.get("document_status"),
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid document status update.")}`);
  }

  const { id, checkin_id, document_status } = parsed.data;
  const { data: document, error: documentFetchError } = await supabase
    .from("guest_documents")
    .select("id,document_type")
    .eq("id", id)
    .eq("checkin_id", checkin_id)
    .single();

  if (documentFetchError || !document) {
    redirect(`/admin/guest-records/${checkin_id}?message=${encodeURIComponent(documentFetchError?.message ?? "Document not found.")}`);
  }

  const { error: updateError } = await supabase.from("guest_documents").update({ document_status }).eq("id", id);

  if (updateError) {
    redirect(`/admin/guest-records/${checkin_id}?message=${encodeURIComponent(updateError.message)}`);
  }

  const updatePayload: GuestCheckinUpdate = {};

  try {
    if (document.document_type === "primary_cnic") {
      updatePayload.cnic_verified = await hasVerifiedDocument(supabase, checkin_id, "primary_cnic");
    }

    if (document.document_type === "payment_proof") {
      const { data: checkin } = await supabase.from("guest_checkins").select("payment_status").eq("id", checkin_id).single();
      updatePayload.payment_verified =
        checkin?.payment_status === "paid" || (await hasVerifiedDocument(supabase, checkin_id, "payment_proof"));
    }
  } catch (error) {
    redirect(
      `/admin/guest-records/${checkin_id}?message=${encodeURIComponent(
        error instanceof Error ? error.message : "Could not sync verification status.",
      )}`,
    );
  }

  if (document_status === "rejected") {
    updatePayload.status = "issue";
    updatePayload.guest_tag = "issue";
    updatePayload.issue_type = document.document_type === "payment_proof" ? "payment_pending" : "missing_documents";
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error: checkinError } = await supabase.from("guest_checkins").update(updatePayload).eq("id", checkin_id);

    if (checkinError) {
      redirect(`/admin/guest-records/${checkin_id}?message=${encodeURIComponent(checkinError.message)}`);
    }
  }

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${checkin_id}`);
  redirect(`/admin/guest-records/${checkin_id}?message=${encodeURIComponent("Document status updated.")}`);
}

const guestChargeSchema = z
  .object({
    guest_checkin_id: z.uuid(),
    charge_type: z.enum(guestChargeOptions.map((option) => option.value)),
    description: z.string().nullable(),
    amount_pkr: z.number().min(0),
    quantity: z.number().int().min(1),
    is_paid: z.boolean(),
    payment_method: z.enum(paymentMethodOptions.map((option) => option.value)).nullable(),
    notes: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (values.is_paid && !values.payment_method) {
      context.addIssue({
        code: "custom",
        path: ["payment_method"],
        message: "Payment method is required for paid charges.",
      });
    }
  });

export async function createGuestCharge(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const parsed = guestChargeSchema.safeParse({
    guest_checkin_id: formData.get("guest_checkin_id"),
    charge_type: formData.get("charge_type"),
    description: nullableString(formData.get("description")),
    amount_pkr: nullableNumber(formData.get("amount_pkr")),
    quantity: Number(formData.get("quantity") || 1),
    is_paid: formData.get("is_paid") === "on",
    payment_method: nullableString(formData.get("payment_method")),
    notes: nullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid guest charge details.")}`);
  }

  const values = parsed.data;
  const { data: record, error: recordError } = await supabase
    .from("guest_checkins")
    .select("id,internal_notes")
    .eq("id", values.guest_checkin_id)
    .single();

  if (recordError || !record) {
    redirect(`/admin/guest-records?message=${encodeURIComponent(recordError?.message ?? "Guest record not found.")}`);
  }

  const { error } = await supabase.from("guest_charges").insert({
    guest_checkin_id: values.guest_checkin_id,
    charge_type: values.charge_type,
    description: values.description,
    amount_pkr: values.amount_pkr,
    quantity: values.quantity,
    is_paid: values.is_paid,
    payment_method: values.is_paid ? values.payment_method : null,
    notes: values.notes,
    created_by: profile.id,
  });

  if (error) {
    redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent(error.message)}`);
  }

  const note = `Added charge: ${getGuestChargeLabel(values.charge_type)} - ${values.quantity} x ${formatNoteAmount(values.amount_pkr)} PKR`;
  await supabase
    .from("guest_checkins")
    .update({ internal_notes: appendInternalNote(record.internal_notes, note) })
    .eq("id", values.guest_checkin_id);

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${values.guest_checkin_id}`);
  redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent("Guest charge added.")}`);
}

const markGuestChargePaidSchema = z.object({
  id: z.uuid(),
  guest_checkin_id: z.uuid(),
  payment_method: z.enum(paymentMethodOptions.map((option) => option.value)),
});

export async function markGuestChargePaid(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const parsed = markGuestChargePaidSchema.safeParse({
    id: formData.get("id"),
    guest_checkin_id: formData.get("guest_checkin_id"),
    payment_method: formData.get("payment_method"),
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid guest charge payment details.")}`);
  }

  const values = parsed.data;
  const { data: charge, error: chargeError } = await supabase
    .from("guest_charges")
    .select("id,guest_checkin_id,charge_type,total_amount_pkr,is_paid")
    .eq("id", values.id)
    .eq("guest_checkin_id", values.guest_checkin_id)
    .single();

  if (chargeError || !charge) {
    redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent(chargeError?.message ?? "Guest charge not found.")}`);
  }

  if (charge.is_paid) {
    redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent("This guest charge is already marked paid.")}`);
  }

  const { data: record, error: recordError } = await supabase
    .from("guest_checkins")
    .select("id,internal_notes")
    .eq("id", values.guest_checkin_id)
    .single();

  if (recordError || !record) {
    redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent(recordError?.message ?? "Guest record not found.")}`);
  }

  const { error } = await supabase
    .from("guest_charges")
    .update({
      is_paid: true,
      payment_method: values.payment_method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", values.id);

  if (error) {
    redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent(error.message)}`);
  }

  const paymentMethodLabel = paymentMethodOptions.find((option) => option.value === values.payment_method)?.label ?? values.payment_method;
  const note = `Charge marked paid: ${getGuestChargeLabel(charge.charge_type)} - Rs ${formatNoteAmount(charge.total_amount_pkr)} via ${paymentMethodLabel}.`;
  await supabase
    .from("guest_checkins")
    .update({ internal_notes: appendInternalNote(record.internal_notes, note) })
    .eq("id", values.guest_checkin_id);

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${values.guest_checkin_id}`);
  redirect(`/admin/guest-records/${values.guest_checkin_id}?message=${encodeURIComponent("Guest charge marked paid.")}`);
}

const extendStaySchema = z.object({
  id: z.uuid(),
  new_check_out_date: z.string().min(1),
  additional_expected_amount_pkr: z.number().min(0).nullable(),
  additional_payment_received_pkr: z.number().min(0).nullable(),
  payment_method: z.enum(paymentMethodOptions.map((option) => option.value)).nullable(),
  reason: z.string().nullable(),
});

export async function extendGuestStay(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const parsed = extendStaySchema.safeParse({
    id: formData.get("id"),
    new_check_out_date: formData.get("new_check_out_date"),
    additional_expected_amount_pkr: nullableNumber(formData.get("additional_expected_amount_pkr")),
    additional_payment_received_pkr: nullableNumber(formData.get("additional_payment_received_pkr")),
    payment_method: nullableString(formData.get("payment_method")),
    reason: nullableString(formData.get("reason")),
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid stay extension details.")}`);
  }

  const values = parsed.data;
  const { data: record, error: recordError } = await supabase
    .from("guest_checkins")
    .select("assigned_room_id,check_in_date,check_out_date,total_expected_amount_pkr,agreed_room_rate_pkr,amount_paid_pkr,internal_notes,payment_verified")
    .eq("id", values.id)
    .single();

  if (recordError || !record) {
    redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent(recordError?.message ?? "Guest record not found.")}`);
  }

  if (values.new_check_out_date <= record.check_out_date) {
    redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent("New check-out date must be after the current check-out date.")}`);
  }

  if (record.assigned_room_id) {
    let conflict: Awaited<ReturnType<typeof findUnitAssignmentConflict>> = null;

    try {
      conflict = await findUnitAssignmentConflict(supabase, {
        assignedRoomId: record.assigned_room_id,
        checkInDate: record.check_in_date,
        checkOutDate: values.new_check_out_date,
        excludeCheckinId: values.id,
      });
    } catch (error) {
      redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent(error instanceof Error ? error.message : "Could not check unit availability.")}`);
    }

    if (conflict) {
      redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent(formatUnitConflictMessage(conflict))}`);
    }
  }

  const currentExpected = record.total_expected_amount_pkr ?? record.agreed_room_rate_pkr ?? 0;
  const additionalExpected = values.additional_expected_amount_pkr ?? 0;
  const additionalPayment = values.additional_payment_received_pkr ?? 0;
  const nextExpected = currentExpected + additionalExpected;
  const nextPaid = (record.amount_paid_pkr ?? 0) + additionalPayment;
  const nextPaymentStatus = nextPaid >= nextExpected && nextExpected > 0 ? "paid" : nextPaid > 0 ? "partial" : "pending";
  const note = [
    `Stay extended from ${record.check_out_date} to ${values.new_check_out_date}.`,
    `Additional expected: ${formatNoteAmount(additionalExpected)} PKR.`,
    `Payment received: ${formatNoteAmount(additionalPayment)} PKR.`,
    values.reason ? `Reason: ${values.reason}.` : null,
  ].filter(Boolean).join(" ");

  const { error } = await supabase
    .from("guest_checkins")
    .update({
      check_out_date: values.new_check_out_date,
      total_expected_amount_pkr: nextExpected,
      amount_paid_pkr: nextPaid,
      payment_status: nextPaymentStatus,
      payment_verified: nextPaymentStatus === "paid" ? true : record.payment_verified,
      internal_notes: appendInternalNote(record.internal_notes, note),
    })
    .eq("id", values.id);

  if (error) {
    redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("audit_logs").insert({
    actor_user_id: profile.id,
    action: "extend_stay",
    entity_type: "guest_checkins",
    entity_id: values.id,
    metadata: {
      old_check_out_date: record.check_out_date,
      new_check_out_date: values.new_check_out_date,
      additional_expected_amount_pkr: additionalExpected,
      additional_payment_received_pkr: additionalPayment,
      payment_method: values.payment_method,
      reason: values.reason,
    },
  });

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${values.id}`);
  redirect(`/admin/guest-records/${values.id}?message=${encodeURIComponent("Stay extended.")}`);
}
