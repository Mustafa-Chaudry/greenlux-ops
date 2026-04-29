import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasAllowedRole, type UserRole } from "@/lib/auth/roles";
import type { Database } from "@/types/database";

type UserProfile = Database["public"]["Tables"]["users_profile"]["Row"];

export async function requireUserProfile(): Promise<{
  supabase: Awaited<ReturnType<typeof createClient>>;
  profile: UserProfile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("users_profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/auth/sign-in?message=Your profile is still being prepared. Please sign in again.");
  }

  return { supabase, profile };
}

export async function requireRole(allowedRoles: readonly UserRole[]) {
  const context = await requireUserProfile();

  if (!hasAllowedRole(context.profile.role, allowedRoles)) {
    redirect("/dashboard");
  }

  return context;
}

