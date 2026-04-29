"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { staffGuestCreationRoles } from "@/lib/auth/roles";
import { getBusinessTodayDate } from "@/lib/check-in/options";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const manualPaymentStatuses = ["pending", "partial", "paid"] as const;

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
    cnic: z.string().trim().nullable(),
    check_in_date: z.string().min(1),
    check_out_date: z.string().min(1),
    notes: z.string().trim().nullable(),
    payment_status: z.enum(manualPaymentStatuses),
    assigned_room_id: z.uuid().nullable(),
    agreed_room_rate_pkr: z.number().min(0).nullable(),
    total_expected_amount_pkr: z.number().min(0).nullable(),
    amount_paid_pkr: z.number().min(0).nullable(),
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
      warning: "Guest record created. Auth user was not created because SUPABASE_SERVICE_ROLE_KEY is not configured.",
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
      warning: `Guest record created. Auth user was not created: ${error.message}`,
    };
  }

  return { guestUserId: data.user?.id ?? null, warning: null };
}

export async function createManualGuest(formData: FormData) {
  const { supabase } = await requireRole(staffGuestCreationRoles);
  const defaults = getDefaultDates();
  const parsed = manualGuestSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: nullableString(formData.get("email")),
    cnic: nullableString(formData.get("cnic")),
    check_in_date: nullableString(formData.get("check_in_date")) ?? defaults.checkInDate,
    check_out_date: nullableString(formData.get("check_out_date")) ?? defaults.checkOutDate,
    notes: nullableString(formData.get("notes")),
    payment_status: formData.get("payment_status") || "pending",
    assigned_room_id: nullableString(formData.get("assigned_room_id")),
    agreed_room_rate_pkr: nullableNumber(formData.get("agreed_room_rate_pkr")),
    total_expected_amount_pkr: nullableNumber(formData.get("total_expected_amount_pkr")),
    amount_paid_pkr: nullableNumber(formData.get("amount_paid_pkr")),
  });

  if (!parsed.success) {
    redirect(`/admin/guests/new?message=${encodeURIComponent("Please check the guest details and try again.")}`);
  }

  const values = parsed.data;
  const guestId = crypto.randomUUID();
  const { guestUserId, warning } = await findOrCreateAuthUser({
    supabase,
    email: values.email,
    fullName: values.full_name,
    phone: values.phone,
  });
  const expectedAmount = values.total_expected_amount_pkr ?? values.agreed_room_rate_pkr;
  const amountPaid = values.amount_paid_pkr ?? (values.payment_status === "pending" ? null : 0);

  const { error } = await supabase.from("guest_checkins").insert({
    id: guestId,
    guest_user_id: guestUserId,
    guest_type: "admin_created",
    full_name: values.full_name,
    phone: values.phone,
    email: values.email,
    cnic_passport_number: values.cnic,
    address: "Not provided",
    city_country_from: "Not provided",
    check_in_date: values.check_in_date,
    check_out_date: values.check_out_date,
    number_of_guests: 1,
    purpose_of_visit: "other",
    booking_source: "direct_whatsapp_call",
    payment_method: "cash",
    payment_status: values.payment_status,
    assigned_room_id: values.assigned_room_id,
    agreed_room_rate_pkr: values.agreed_room_rate_pkr,
    total_expected_amount_pkr: expectedAmount,
    amount_paid_pkr: amountPaid,
    internal_notes: values.notes,
    payment_verified: values.payment_status !== "pending",
  });

  if (error) {
    redirect(`/admin/guests/new?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/guest-records");
  const successMessage = warning ?? "Guest record created.";
  redirect(`/admin/guest-records/${guestId}?message=${encodeURIComponent(successMessage)}`);
}
