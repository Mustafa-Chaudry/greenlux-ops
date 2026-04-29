"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { managementRoles } from "@/lib/auth/roles";
import { getBusinessTodayDate, maintenanceStatusOptions } from "@/lib/check-in/options";

type MaintenancePayload = {
  id?: string;
  room_id: string;
  issue_title: string;
  issue_description: string | null;
  status: (typeof maintenanceStatusOptions)[number]["value"];
  cost_pkr: number | null;
  reported_date: string;
  resolved_date: string | null;
  notes: string | null;
};

const nullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
};

const maintenanceSchema = z
  .object({
    id: z.string().optional(),
    room_id: z.string().min(1, "Room is required.").pipe(z.uuid("Select a valid room.")),
    issue_title: z.string().trim().min(1, "Issue title is required."),
    issue_description: z.string().nullable(),
    status: z.enum(maintenanceStatusOptions.map((option) => option.value)),
    cost_pkr: z.string().nullable(),
    reported_date: z.string().min(1, "Reported date is required."),
    resolved_date: z.string().nullable(),
    notes: z.string().nullable(),
  })
  .superRefine((values, context) => {
    if (values.cost_pkr !== null) {
      const cost = Number(values.cost_pkr);
      if (!Number.isFinite(cost) || cost < 0) {
        context.addIssue({
          code: "custom",
          path: ["cost_pkr"],
          message: "Cost must be a valid non-negative number.",
        });
      }
    }

    if (values.resolved_date && values.reported_date && values.resolved_date < values.reported_date) {
      context.addIssue({
        code: "custom",
        path: ["resolved_date"],
        message: "Resolved date cannot be before reported date.",
      });
    }
  });

function redirectWithErrors({
  basePath,
  formData,
  errors,
}: {
  basePath: string;
  formData: FormData;
  errors: Record<string, string[] | undefined>;
}): never {
  const params = new URLSearchParams({
    message: "Please fix the highlighted maintenance fields.",
  });
  const id = nullableString(formData.get("id"));

  if (id) {
    params.set("error_id", id);
  }

  Object.entries(errors).forEach(([field, messages]) => {
    if (messages?.[0]) {
      params.set(`${field}_error`, messages[0]);
    }
  });

  redirect(`${basePath}?${params.toString()}`);
}

function normalizeMaintenancePayload(formData: FormData): MaintenancePayload {
  const parsed = maintenanceSchema.safeParse({
    id: nullableString(formData.get("id")) ?? undefined,
    room_id: formData.get("room_id"),
    issue_title: formData.get("issue_title"),
    issue_description: nullableString(formData.get("issue_description")),
    status: formData.get("status") ?? "reported",
    cost_pkr: nullableString(formData.get("cost_pkr")),
    reported_date: formData.get("reported_date"),
    resolved_date: nullableString(formData.get("resolved_date")),
    notes: nullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    redirectWithErrors({
      basePath: "/admin/maintenance",
      formData,
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  return {
    ...parsed.data,
    cost_pkr: parsed.data.cost_pkr === null ? null : Number(parsed.data.cost_pkr),
    resolved_date:
      parsed.data.status === "resolved" && !parsed.data.resolved_date
        ? getBusinessTodayDate()
        : parsed.data.resolved_date,
  };
}

export async function createMaintenanceLog(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const payload = normalizeMaintenancePayload(formData);

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

  if (!payload.id) {
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
