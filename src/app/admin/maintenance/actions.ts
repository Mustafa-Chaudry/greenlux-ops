"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { hasAllowedRole, managementRoles, superAdminRoles } from "@/lib/auth/roles";
import { getBusinessTodayDate, maintenanceStatusOptions, paymentMethodOptions } from "@/lib/check-in/options";
import { isAllowedUploadMimeType, isAllowedUploadSize } from "@/lib/validation/uploads";

type MaintenancePayload = {
  id?: string;
  room_id: string;
  issue_title: string;
  issue_description: string | null;
  status: (typeof maintenanceStatusOptions)[number]["value"];
  cost_pkr: number | null;
  actual_cost_pkr: number | null;
  vendor_paid_to: string | null;
  payment_method: (typeof paymentMethodOptions)[number]["value"] | null;
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
    room_id: z.string().min(1, "Unit is required.").pipe(z.uuid("Select a valid unit.")),
    issue_title: z.string().trim().min(1, "Issue title is required."),
    issue_description: z.string().nullable(),
    status: z.enum(maintenanceStatusOptions.map((option) => option.value)),
    cost_pkr: z.string().nullable(),
    actual_cost_pkr: z.string().nullable(),
    vendor_paid_to: z.string().nullable(),
    payment_method: z.enum(paymentMethodOptions.map((option) => option.value)).nullable(),
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

    if (values.actual_cost_pkr !== null) {
      const actualCost = Number(values.actual_cost_pkr);
      if (!Number.isFinite(actualCost) || actualCost < 0) {
        context.addIssue({
          code: "custom",
          path: ["actual_cost_pkr"],
          message: "Actual cost must be a valid non-negative number.",
        });
      }

      if (actualCost > 0 && !values.vendor_paid_to?.trim()) {
        context.addIssue({
          code: "custom",
          path: ["vendor_paid_to"],
          message: "Paid to is required when recording an actual expense.",
        });
      }

      if (actualCost > 0 && !values.payment_method) {
        context.addIssue({
          code: "custom",
          path: ["payment_method"],
          message: "Payment method is required when recording an actual expense.",
        });
      }
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
    actual_cost_pkr: nullableString(formData.get("actual_cost_pkr")),
    vendor_paid_to: nullableString(formData.get("vendor_paid_to")),
    payment_method: nullableString(formData.get("payment_method")),
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
    actual_cost_pkr: parsed.data.actual_cost_pkr === null ? null : Number(parsed.data.actual_cost_pkr),
    resolved_date:
      parsed.data.status === "resolved" && !parsed.data.resolved_date
        ? getBusinessTodayDate()
        : parsed.data.resolved_date,
  };
}

function getReceiptFile(formData: FormData) {
  const receipt = formData.get("receipt");

  if (!(receipt instanceof File) || receipt.size === 0) {
    return null;
  }

  if (!isAllowedUploadMimeType(receipt.type) || !isAllowedUploadSize(receipt.size)) {
    throw new Error("Receipt must be a JPG, PNG, or PDF up to 10 MB.");
  }

  return receipt;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "receipt";
}

async function createLinkedExpense({
  supabase,
  profileId,
  maintenanceId,
  payload,
  receipt,
}: {
  supabase: Awaited<ReturnType<typeof requireRole>>["supabase"];
  profileId: string;
  maintenanceId: string;
  payload: MaintenancePayload;
  receipt: File | null;
}) {
  if (!payload.actual_cost_pkr || payload.actual_cost_pkr <= 0) {
    return null;
  }

  const expenseId = crypto.randomUUID();
  let receiptPath: string | null = null;

  if (receipt) {
    receiptPath = `${profileId}/${expenseId}/receipt-${crypto.randomUUID()}-${sanitizeFileName(receipt.name)}`;
    const { error: uploadError } = await supabase.storage.from("expense-receipts").upload(receiptPath, receipt, {
      cacheControl: "3600",
      upsert: false,
      contentType: receipt.type,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }
  }

  const { error } = await supabase.from("expenses").insert({
    id: expenseId,
    category: "maintenance",
    amount_pkr: payload.actual_cost_pkr,
    expense_date: payload.resolved_date ?? payload.reported_date,
    paid_to: payload.vendor_paid_to ?? "Maintenance vendor",
    payment_method: payload.payment_method ?? "cash",
    related_room_id: payload.room_id,
    receipt_file_path: receiptPath,
    receipt_file_url: null,
    notes: `Linked maintenance issue ${maintenanceId}: ${payload.issue_title}`,
    created_by: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return expenseId;
}

export async function createMaintenanceLog(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const payload = normalizeMaintenancePayload(formData);
  const wantsFinancialExpense = Boolean(payload.actual_cost_pkr && payload.actual_cost_pkr > 0);

  if (wantsFinancialExpense && !hasAllowedRole(profile.role, superAdminRoles)) {
    redirect(`/admin/maintenance?message=${encodeURIComponent("Only a super admin can create a linked maintenance expense.")}`);
  }

  const maintenanceId = crypto.randomUUID();
  const { error } = await supabase.from("room_maintenance_logs").insert({
    id: maintenanceId,
    room_id: payload.room_id,
    issue_title: payload.issue_title,
    issue_description: payload.issue_description,
    status: payload.status,
    cost_pkr: payload.cost_pkr,
    actual_cost_pkr: payload.actual_cost_pkr,
    vendor_paid_to: payload.vendor_paid_to,
    payment_method: payload.payment_method,
    linked_expense_id: null,
    reported_date: payload.reported_date,
    resolved_date: payload.resolved_date,
    notes: payload.notes,
    created_by: profile.id,
  });

  if (error) {
    redirect(`/admin/maintenance?message=${encodeURIComponent(error.message)}`);
  }

  if (wantsFinancialExpense) {
    try {
      const receipt = getReceiptFile(formData);
      const linkedExpenseId = await createLinkedExpense({ supabase, profileId: profile.id, maintenanceId, payload, receipt });
      const { error: linkError } = await supabase
        .from("room_maintenance_logs")
        .update({ linked_expense_id: linkedExpenseId })
        .eq("id", maintenanceId);

      if (linkError) {
        if (linkedExpenseId) {
          await supabase.from("expenses").delete().eq("id", linkedExpenseId);
        }

        throw new Error(linkError.message);
      }
    } catch (error) {
      revalidatePath("/admin/maintenance");
      redirect(
        `/admin/maintenance?message=${encodeURIComponent(
          `Maintenance issue added, but linked expense failed: ${error instanceof Error ? error.message : "Unknown error."}`,
        )}`,
      );
    }
  }

  revalidatePath("/admin/maintenance");
  redirect(`/admin/maintenance?message=${encodeURIComponent("Maintenance issue added.")}`);
}

export async function updateMaintenanceLog(formData: FormData) {
  const { supabase, profile } = await requireRole(managementRoles);
  const payload = normalizeMaintenancePayload(formData);

  if (!payload.id) {
    redirect(`/admin/maintenance?message=${encodeURIComponent("Invalid maintenance update.")}`);
  }

  const { data: existingLog } = await supabase.from("room_maintenance_logs").select("linked_expense_id").eq("id", payload.id).single();
  const wantsFinancialExpense = Boolean(payload.actual_cost_pkr && payload.actual_cost_pkr > 0 && !existingLog?.linked_expense_id);

  if (wantsFinancialExpense && !hasAllowedRole(profile.role, superAdminRoles)) {
    redirect(`/admin/maintenance?message=${encodeURIComponent("Only a super admin can create a linked maintenance expense.")}`);
  }

  let linkedExpenseId = existingLog?.linked_expense_id ?? null;
  let createdLinkedExpenseId: string | null = null;

  if (wantsFinancialExpense) {
    try {
      const receipt = getReceiptFile(formData);
      linkedExpenseId = await createLinkedExpense({ supabase, profileId: profile.id, maintenanceId: payload.id, payload, receipt });
      createdLinkedExpenseId = linkedExpenseId;
    } catch (error) {
      redirect(`/admin/maintenance?message=${encodeURIComponent(error instanceof Error ? error.message : "Linked expense creation failed.")}`);
    }
  }

  const { id, ...updatePayload } = payload;
  const { error } = await supabase.from("room_maintenance_logs").update({ ...updatePayload, linked_expense_id: linkedExpenseId }).eq("id", id);

  if (error) {
    if (createdLinkedExpenseId) {
      await supabase.from("expenses").delete().eq("id", createdLinkedExpenseId);
    }

    redirect(`/admin/maintenance?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/maintenance");
  redirect(`/admin/maintenance?message=${encodeURIComponent("Maintenance issue updated.")}`);
}
