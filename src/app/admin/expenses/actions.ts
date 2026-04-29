"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { superAdminRoles } from "@/lib/auth/roles";
import { expenseCategoryOptions, paymentMethodOptions } from "@/lib/check-in/options";
import { isAllowedUploadMimeType, isAllowedUploadSize } from "@/lib/validation/uploads";

const nullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
};

const expenseSchema = z.object({
  id: z.uuid().optional(),
  category: z.enum(expenseCategoryOptions.map((option) => option.value)),
  amount_pkr: z.coerce.number().min(0),
  expense_date: z.string().min(1),
  paid_to: z.string().trim().min(1),
  payment_method: z.enum(paymentMethodOptions.map((option) => option.value)),
  related_room_id: z.uuid().nullable(),
  notes: z.string().nullable(),
});

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

async function uploadReceipt({
  expenseId,
  file,
  userId,
}: {
  expenseId: string;
  file: File;
  userId: string;
}) {
  const { supabase } = await requireRole(superAdminRoles);
  const filePath = `${userId}/${expenseId}/receipt-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from("expense-receipts").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export async function createExpense(formData: FormData) {
  const { supabase, profile } = await requireRole(superAdminRoles);
  const expenseId = crypto.randomUUID();
  const parsed = expenseSchema.safeParse({
    category: formData.get("category"),
    amount_pkr: formData.get("amount_pkr"),
    expense_date: formData.get("expense_date"),
    paid_to: formData.get("paid_to"),
    payment_method: formData.get("payment_method"),
    related_room_id: nullableString(formData.get("related_room_id")),
    notes: nullableString(formData.get("notes")),
  });

  if (!parsed.success) {
    redirect(`/admin/expenses?message=${encodeURIComponent("Invalid expense details.")}`);
  }

  try {
    const receipt = getReceiptFile(formData);
    const receiptPath = receipt ? await uploadReceipt({ expenseId, file: receipt, userId: profile.id }) : null;

    const { error } = await supabase.from("expenses").insert({
      id: expenseId,
      ...parsed.data,
      receipt_file_path: receiptPath,
      receipt_file_url: null,
      created_by: profile.id,
    });

    if (error) {
      redirect(`/admin/expenses?message=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    redirect(`/admin/expenses?message=${encodeURIComponent(error instanceof Error ? error.message : "Expense upload failed.")}`);
  }

  revalidatePath("/admin/expenses");
  redirect(`/admin/expenses?message=${encodeURIComponent("Expense added.")}`);
}

export async function updateExpense(formData: FormData) {
  const { supabase, profile } = await requireRole(superAdminRoles);
  const parsed = expenseSchema.safeParse({
    id: formData.get("id"),
    category: formData.get("category"),
    amount_pkr: formData.get("amount_pkr"),
    expense_date: formData.get("expense_date"),
    paid_to: formData.get("paid_to"),
    payment_method: formData.get("payment_method"),
    related_room_id: nullableString(formData.get("related_room_id")),
    notes: nullableString(formData.get("notes")),
  });

  if (!parsed.success || !parsed.data.id) {
    redirect(`/admin/expenses?message=${encodeURIComponent("Invalid expense update.")}`);
  }

  const { id, ...payload } = parsed.data;

  try {
    const receipt = getReceiptFile(formData);
    const receiptPath = receipt ? await uploadReceipt({ expenseId: id, file: receipt, userId: profile.id }) : undefined;
    const { error } = await supabase
      .from("expenses")
      .update({
        ...payload,
        ...(receiptPath ? { receipt_file_path: receiptPath, receipt_file_url: null } : {}),
      })
      .eq("id", id);

    if (error) {
      redirect(`/admin/expenses?message=${encodeURIComponent(error.message)}`);
    }
  } catch (error) {
    redirect(`/admin/expenses?message=${encodeURIComponent(error instanceof Error ? error.message : "Expense update failed.")}`);
  }

  revalidatePath("/admin/expenses");
  redirect(`/admin/expenses?message=${encodeURIComponent("Expense updated.")}`);
}

export async function deleteExpense(formData: FormData) {
  const { supabase } = await requireRole(superAdminRoles);
  const id = formData.get("id");

  if (typeof id !== "string") {
    redirect(`/admin/expenses?message=${encodeURIComponent("Invalid expense deletion.")}`);
  }

  const { data: expense } = await supabase.from("expenses").select("receipt_file_path").eq("id", id).single();
  if (expense?.receipt_file_path) {
    await supabase.storage.from("expense-receipts").remove([expense.receipt_file_path]);
  }

  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) {
    redirect(`/admin/expenses?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/expenses");
  redirect(`/admin/expenses?message=${encodeURIComponent("Expense deleted.")}`);
}

