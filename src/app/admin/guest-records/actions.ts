"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import {
  checkinStatusOptions,
  getApprovalMissingRequirements,
  getCheckinStatusLabel,
  guestTagOptions,
  isReadyToApprove,
  paymentStatusOptions,
} from "@/lib/check-in/options";
import { isAllowedUploadMimeType, isAllowedUploadSize } from "@/lib/validation/uploads";
import type { Database } from "@/types/database";

type DocumentType = Database["public"]["Enums"]["document_type"];

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

const updateGuestRecordSchema = z.object({
  id: z.uuid(),
  assigned_room_id: z.uuid().nullable(),
  agreed_room_rate_pkr: z.number().min(0).nullable(),
  advance_paid_amount_pkr: z.number().min(0).nullable(),
  total_expected_amount_pkr: z.number().min(0).nullable(),
  amount_paid_pkr: z.number().min(0).nullable(),
  payment_status: z.enum(paymentStatusOptions.map((option) => option.value)),
  guest_tag: z.enum(guestTagOptions.map((option) => option.value)),
  internal_notes: z.string().nullable(),
  cnic_verified: z.boolean(),
  payment_verified: z.boolean(),
});

export async function updateGuestRecord(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);

  const parsed = updateGuestRecordSchema.safeParse({
    id: formData.get("id"),
    assigned_room_id: nullableString(formData.get("assigned_room_id")),
    agreed_room_rate_pkr: nullableNumber(formData.get("agreed_room_rate_pkr")),
    advance_paid_amount_pkr: nullableNumber(formData.get("advance_paid_amount_pkr")),
    total_expected_amount_pkr: nullableNumber(formData.get("total_expected_amount_pkr")),
    amount_paid_pkr: nullableNumber(formData.get("amount_paid_pkr")),
    payment_status: formData.get("payment_status"),
    guest_tag: formData.get("guest_tag"),
    internal_notes: nullableString(formData.get("internal_notes")),
    cnic_verified: formData.get("cnic_verified") === "on",
    payment_verified: formData.get("payment_verified") === "on",
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid guest record update.")}`);
  }

  const { id, ...payload } = parsed.data;
  const { data: currentRecord } = await supabase.from("guest_checkins").select("status").eq("id", id).single();
  const updatePayload = {
    ...payload,
    ...(currentRecord?.status === "submitted" ? { status: "under_review" as const } : {}),
  };
  const { error } = await supabase.from("guest_checkins").update(updatePayload).eq("id", id);

  if (error) {
    redirect(`/admin/guest-records/${id}?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/guest-records");
  revalidatePath(`/admin/guest-records/${id}`);
  redirect(`/admin/guest-records/${id}?message=${encodeURIComponent("Guest record updated.")}`);
}

const statusActionSchema = z.object({
  id: z.uuid(),
  status: z.enum(checkinStatusOptions.map((option) => option.value)),
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
  });

  if (!parsed.success) {
    redirect(`/admin/guest-records?message=${encodeURIComponent("Invalid status update.")}`);
  }

  const { id, status } = parsed.data;
  const returnTo = safeReturnTo(formData.get("return_to"), `/admin/guest-records/${id}`);

  const { data: record, error: fetchError } = await supabase
    .from("guest_checkins")
    .select("status,assigned_room_id,cnic_verified,payment_status,payment_method,payment_verified")
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

  if (status === "checked_in" && record.status !== "approved") {
    redirect(withMessage(returnTo, "Only approved records can be marked checked-in."));
  }

  if (status === "checked_out" && record.status !== "checked_in") {
    redirect(withMessage(returnTo, "Only checked-in records can be marked checked-out."));
  }

  const updatePayload = status === "issue" ? { status, guest_tag: "issue" as const } : { status };
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

  const filePath = `${uploadedBy}/${checkinId}/admin-${documentType}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
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
