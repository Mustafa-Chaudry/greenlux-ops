"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import { getBusinessTodayDate, maintenanceStatusOptions } from "@/lib/check-in/options";

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

const maintenanceSchema = z.object({
  id: z.uuid().optional(),
  room_id: z.uuid(),
  issue_title: z.string().trim().min(1),
  issue_description: z.string().nullable(),
  status: z.enum(maintenanceStatusOptions.map((option) => option.value)),
  cost_pkr: z.number().min(0).nullable(),
  reported_date: z.string().min(1),
  resolved_date: z.string().nullable(),
  notes: z.string().nullable(),
});

function normalizeMaintenancePayload(formData: FormData) {
  const parsed = maintenanceSchema.safeParse({
    id: formData.get("id"),
    room_id: formData.get("room_id"),
    issue_title: formData.get("issue_title"),
    issue_description: nullableString(formData.get("issue_description")),
    status: formData.get("status") ?? "reported",
    cost_pkr: nullableNumber(formData.get("cost_pkr")),
    reported_date: formData.get("reported_date"),
    resolved_date: nullableString(formData.get("resolved_date")),
    notes: nullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    resolved_date:
      parsed.data.status === "resolved" && !parsed.data.resolved_date
        ? getBusinessTodayDate()
        : parsed.data.resolved_date,
  };
}

export async function createMaintenanceLog(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const payload = normalizeMaintenancePayload(formData);

  if (!payload) {
    redirect(`/admin/maintenance?message=${encodeURIComponent("Invalid maintenance issue details.")}`);
  }

  const { error } = await supabase.from("room_maintenance_logs").insert({
    room_id: payload.room_id,
    issue_title: payload.issue_title,
    issue_description: payload.issue_description,
    status: payload.status,
    cost_pkr: payload.cost_pkr,
    reported_date: payload.reported_date,
    resolved_date: payload.resolved_date,
    notes: payload.notes,
    created_by: profile.id,
  });

  if (error) {
    redirect(`/admin/maintenance?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/maintenance");
  redirect(`/admin/maintenance?message=${encodeURIComponent("Maintenance issue added.")}`);
}

export async function updateMaintenanceLog(formData: FormData) {
  const { supabase } = await requireRole(managementRoles);
  const payload = normalizeMaintenancePayload(formData);

  if (!payload?.id) {
    redirect(`/admin/maintenance?message=${encodeURIComponent("Invalid maintenance update.")}`);
  }

  const { id, ...updatePayload } = payload;
  const { error } = await supabase.from("room_maintenance_logs").update(updatePayload).eq("id", id);

  if (error) {
    redirect(`/admin/maintenance?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/maintenance");
  redirect(`/admin/maintenance?message=${encodeURIComponent("Maintenance issue updated.")}`);
}
