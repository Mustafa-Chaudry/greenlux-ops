"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guards";
import { superAdminRoles, userRoles } from "@/lib/auth/roles";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const createUserSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().nullable(),
  role: z.enum(userRoles),
  temporary_password: z.string().min(8),
});

const updateRoleSchema = z.object({
  id: z.uuid(),
  role: z.enum(userRoles),
});

const nullableString = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return value.trim();
};

function redirectWithMessage(message: string): never {
  redirect(`/admin/users?message=${encodeURIComponent(message)}`);
}

export async function createStaffUser(formData: FormData) {
  const { supabase } = await requireRole(superAdminRoles);
  const parsed = createUserSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: nullableString(formData.get("phone")),
    role: formData.get("role") || "manager",
    temporary_password: formData.get("temporary_password"),
  });

  if (!parsed.success) {
    redirectWithMessage("Please provide a name, valid email, role, and temporary password of at least 8 characters.");
  }

  const values = parsed.data;
  const { data: existingProfile } = await supabase
    .from("users_profile")
    .select("id")
    .eq("email", values.email)
    .maybeSingle();

  if (existingProfile) {
    redirectWithMessage("A profile already exists for this email.");
  }

  const serviceClient = createServiceRoleClient();
  if (!serviceClient) {
    redirectWithMessage("SUPABASE_SERVICE_ROLE_KEY is required to create auth users from the admin panel.");
  }

  const { data, error } = await serviceClient.auth.admin.createUser({
    email: values.email,
    password: values.temporary_password,
    email_confirm: true,
    user_metadata: {
      full_name: values.full_name,
      phone: values.phone,
      source: "admin_user_management",
    },
  });

  if (error || !data.user) {
    redirectWithMessage(error?.message ?? "Supabase did not return the created user.");
  }

  const { error: profileError } = await serviceClient.from("users_profile").upsert({
    id: data.user.id,
    full_name: values.full_name,
    phone: values.phone,
    email: values.email,
    role: values.role,
  });

  if (profileError) {
    redirectWithMessage(`Auth user created, but profile setup failed: ${profileError.message}`);
  }

  revalidatePath("/admin/users");
  redirectWithMessage("User created. Share the temporary password privately and ask them to change it after signing in.");
}

export async function updateUserRole(formData: FormData) {
  const { supabase, profile } = await requireRole(superAdminRoles);
  const parsed = updateRoleSchema.safeParse({
    id: formData.get("id"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirectWithMessage("Invalid role update.");
  }

  const values = parsed.data;

  if (values.id === profile.id && values.role !== "super_admin") {
    redirectWithMessage("You cannot remove your own super admin access.");
  }

  const { data: targetProfile, error: targetError } = await supabase
    .from("users_profile")
    .select("id,role")
    .eq("id", values.id)
    .single();

  if (targetError || !targetProfile) {
    redirectWithMessage(targetError?.message ?? "User profile not found.");
  }

  if (targetProfile.role === "super_admin" && values.role !== "super_admin") {
    const { count, error: countError } = await supabase
      .from("users_profile")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (countError) {
      redirectWithMessage(countError.message);
    }

    if ((count ?? 0) <= 1) {
      redirectWithMessage("At least one super admin must remain.");
    }
  }

  const { error } = await supabase.from("users_profile").update({ role: values.role }).eq("id", values.id);

  if (error) {
    redirectWithMessage(error.message);
  }

  revalidatePath("/admin/users");
  redirectWithMessage("User role updated.");
}
