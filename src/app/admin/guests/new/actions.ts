"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { staffGuestCreationRoles } from "@/lib/auth/roles";
import {
  bookingSourceOptions,
  getBusinessTodayDate,
  guestTagOptions,
  paymentMethodOptions,
  purposeOptions,
} from "@/lib/check-in/options";
import { findUnitAssignmentConflict, formatUnitConflictMessage } from "@/lib/check-in/unit-availability";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isAllowedUploadMimeType, isAllowedUploadSize } from "@/lib/validation/uploads";
import type { Database } from "@/types/database";

type DocumentType = Database["public"]["Enums"]["document_type"];
type DocumentStatus = Database["public"]["Tables"]["guest_documents"]["Row"]["document_status"];

const manualPaymentStatuses = ["pending", "partial", "paid"] as const;
const manualInitialStatuses = ["submitted", "under_review"] as const;

const nullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
};

const nullableNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

function addDaysIso(dateValue: string, days: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDefaultDates() {
  const today = getBusinessTodayDate();
  return {
    checkInDate: today,
    checkOutDate: addDaysIso(today, 1),
  };
}

const manualGuestSchema = z
  .object({
    full_name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    email: z.string().trim().email().nullable(),
    cnic_passport_number: z.string().trim().nullable(),
    address: z.string().trim().nullable(),
    city_country_from: z.string().trim().nullable(),
    check_in_date: z.string().min(1),
    check_out_date: z.string().min(1),
    estimated_arrival_time: z.string().nullable(),
    number_of_guests: z.coerce.number().int().min(1),
    purpose_of_visit: z.enum(purposeOptions.map((option) => option.value)),
    booking_source: z.enum(bookingSourceOptions.map((option) => option.value)),
    payment_method: z.enum(paymentMethodOptions.map((option) => option.value)),
    payment_status: z.enum(manualPaymentStatuses),
    status: z.enum(manualInitialStatuses),
    assigned_room_id: z.uuid().nullable(),
    agreed_room_rate_pkr: z.number().min(0).nullable(),
    advance_paid_amount_pkr: z.number().min(0).nullable(),
    total_expected_amount_pkr: z.number().min(0).nullable(),
    amount_paid_pkr: z.number().min(0).nullable(),
    guest_tag: z.enum(guestTagOptions.map((option) => option.value)),
    special_requests: z.string().trim().nullable(),
    internal_notes: z.string().trim().nullable(),
    cnic_verified: z.boolean(),
    payment_verified: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.check_out_date <= values.check_in_date) {
      context.addIssue({
        code: "custom",
        path: ["check_out_date"],
        message: "Check-out date must be after check-in date.",
      });
    }
  });

function temporaryPassword() {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}-GreenLux`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "document";
}

function getFiles(formData: FormData, fieldName: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function validateUploadFile(file: File) {
  if (!isAllowedUploadMimeType(file.type) || !isAllowedUploadSize(file.size)) {
    throw new Error("Uploads must be JPG, PNG, or PDF files up to 10 MB each.");
  }
}

async function uploadGuestDocument({
  supabase,
  checkinId,
  documentType,
  file,
  uploadedBy,
  documentStatus = "pending",
}: {
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"];
  checkinId: string;
  documentType: DocumentType;
  file: File;
  uploadedBy: string;
  documentStatus?: DocumentStatus;
}) {
  validateUploadFile(file);

  const filePath = `${uploadedBy}/${checkinId}/${documentType}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
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
    document_status: documentStatus,
    file_path: filePath,
    file_url: null,
    mime_type: file.type,
  });

  if (documentError) {
    throw new Error(documentError.message);
  }
}

async function findOrCreateAuthUser({
  supabase,
  email,
  fullName,
  phone,
}: {
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"];
  email: string | null;
  fullName: string;
  phone: string;
}) {
  if (!email) {
    return { guestUserId: null, warning: null };
  }

  const { data: existingProfile } = await supabase
    .from("users_profile")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile?.id) {
    return { guestUserId: existingProfile.id, warning: null };
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    return {
      guestUserId: null,
      warning: "Auth user was not created because SUPABASE_SERVICE_ROLE_KEY is not configured.",
    };
  }

  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password: temporaryPassword(),
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      source: "admin_created",
    },
  });

  if (error) {
    return {
      guestUserId: null,
      warning: `Auth user was not created: ${error.message}`,
    };
  }

  if (!data.user?.id) {
    return { guestUserId: null, warning: "Auth user was not returned by Supabase." };
  }

  const { error: profileError } = await serviceClient.from("users_profile").upsert({
    id: data.user.id,
    full_name: fullName,
    phone,
    email,
    role: "guest",
  });

  if (profileError) {
    return {
      guestUserId: null,
      warning: `Auth user was created, but profile linking failed: ${profileError.message}`,
    };
  }

  return { guestUserId: data.user.id, warning: null };
}

function parseManualGuest(formData: FormData) {
  const defaults = getDefaultDates();

  return manualGuestSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: nullableString(formData.get("email")),
    cnic_passport_number: nullableString(formData.get("cnic_passport_number")),
    address: nullableString(formData.get("address")),
    city_country_from: nullableString(formData.get("city_country_from")),
    check_in_date: nullableString(formData.get("check_in_date")) ?? defaults.checkInDate,
    check_out_date: nullableString(formData.get("check_out_date")) ?? defaults.checkOutDate,
    estimated_arrival_time: nullableString(formData.get("estimated_arrival_time")),
    number_of_guests: formData.get("number_of_guests") || "1",
    purpose_of_visit: formData.get("purpose_of_visit") || "other",
    booking_source: formData.get("booking_source") || "direct_whatsapp_call",
    payment_method: formData.get("payment_method") || "cash",
    payment_status: formData.get("payment_status") || "pending",
    status: formData.get("status") || "under_review",
    assigned_room_id: nullableString(formData.get("assigned_room_id")),
    agreed_room_rate_pkr: nullableNumber(formData.get("agreed_room_rate_pkr")),
    advance_paid_amount_pkr: nullableNumber(formData.get("advance_paid_amount_pkr")),
    total_expected_amount_pkr: nullableNumber(formData.get("total_expected_amount_pkr")),
    amount_paid_pkr: nullableNumber(formData.get("amount_paid_pkr")),
    guest_tag: formData.get("guest_tag") || "new",
    special_requests: nullableString(formData.get("special_requests")),
    internal_notes: nullableString(formData.get("internal_notes")),
    cnic_verified: formData.get("cnic_verified") === "on",
    payment_verified: formData.get("payment_verified") === "on",
  });
}

export async function createManualGuest(formData: FormData) {
  const { supabase, profile } = await requireRole(staffGuestCreationRoles);
  const parsed = parseManualGuest(formData);

  if (!parsed.success) {
    redirect(`/admin/guests/new?message=${encodeURIComponent("Please check the guest details and try again.")}`);
  }

  const values = parsed.data;
  const guestId = crypto.randomUUID();
  const primaryDocuments = getFiles(formData, "primary_document");
  const additionalDocuments = getFiles(formData, "additional_documents");
  const paymentProofs = getFiles(formData, "payment_proof");
  const cnicVerified = values.cnic_verified && primaryDocuments.length > 0;
  const paymentVerified = values.payment_status === "paid" || values.payment_verified;
  const { guestUserId, warning } = await findOrCreateAuthUser({
    supabase,
    email: values.email,
    fullName: values.full_name,
    phone: values.phone,
  });
  const expectedAmount = values.total_expected_amount_pkr ?? values.agreed_room_rate_pkr;

  if (values.assigned_room_id) {
    let conflict: Awaited<ReturnType<typeof findUnitAssignmentConflict>> = null;

    try {
      conflict = await findUnitAssignmentConflict(supabase, {
        assignedRoomId: values.assigned_room_id,
        checkInDate: values.check_in_date,
        checkOutDate: values.check_out_date,
      });
    } catch (error) {
      redirect(`/admin/guests/new?message=${encodeURIComponent(error instanceof Error ? error.message : "Could not check unit availability.")}`);
    }

    if (conflict) {
      redirect(`/admin/guests/new?message=${encodeURIComponent(formatUnitConflictMessage(conflict))}`);
    }
  }

  const { error } = await supabase.from("guest_checkins").insert({
    id: guestId,
    guest_user_id: guestUserId,
    guest_type: "admin_created",
    full_name: values.full_name,
    phone: values.phone,
    email: values.email,
    cnic_passport_number: values.cnic_passport_number,
    address: values.address ?? "Not provided",
    city_country_from: values.city_country_from ?? "Not provided",
    check_in_date: values.check_in_date,
    check_out_date: values.check_out_date,
    estimated_arrival_time: values.estimated_arrival_time,
    number_of_guests: values.number_of_guests,
    purpose_of_visit: values.purpose_of_visit,
    booking_source: values.booking_source,
    has_stayed_before: values.guest_tag === "repeat" || values.guest_tag === "vip",
    payment_method: values.payment_method,
    payment_status: values.payment_status,
    status: values.status,
    assigned_room_id: values.assigned_room_id,
    agreed_room_rate_pkr: values.agreed_room_rate_pkr,
    advance_paid_amount_pkr: values.advance_paid_amount_pkr,
    total_expected_amount_pkr: expectedAmount,
    amount_paid_pkr: values.amount_paid_pkr,
    special_requests: values.special_requests,
    internal_notes: values.internal_notes,
    guest_tag: values.guest_tag,
    cnic_verified: cnicVerified,
    payment_verified: paymentVerified,
  });

  if (error) {
    redirect(`/admin/guests/new?message=${encodeURIComponent(error.message)}`);
  }

  try {
    for (const file of primaryDocuments) {
      await uploadGuestDocument({
        supabase,
        checkinId: guestId,
        documentType: "primary_cnic",
        file,
        uploadedBy: profile.id,
        documentStatus: cnicVerified ? "verified" : "pending",
      });
    }

    for (const file of additionalDocuments) {
      await uploadGuestDocument({
        supabase,
        checkinId: guestId,
        documentType: "additional_guest_cnic",
        file,
        uploadedBy: profile.id,
      });
    }

    for (const file of paymentProofs) {
      await uploadGuestDocument({
        supabase,
        checkinId: guestId,
        documentType: "payment_proof",
        file,
        uploadedBy: profile.id,
        documentStatus: paymentVerified ? "verified" : "pending",
      });
    }
  } catch (uploadError) {
    revalidatePath("/admin");
    revalidatePath("/admin/guest-records");
    const message = uploadError instanceof Error ? uploadError.message : "Document upload failed.";
    redirect(`/admin/guest-records/${guestId}?message=${encodeURIComponent(`Guest record created, but upload failed: ${message}`)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/guest-records");
  const successMessage = warning ? `Guest record created. ${warning}` : "Guest record created.";
  redirect(`/admin/guest-records/${guestId}?message=${encodeURIComponent(successMessage)}`);
}
