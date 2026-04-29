"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

function redirectWithMessage(path: string, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`);
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithMessage("/auth/sign-in", "Please enter a valid email and password.");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    redirectWithMessage("/auth/sign-in", error.message);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    redirectWithMessage("/auth/sign-up", "Please complete all required fields with valid details.");
  }

  const supabase = await createClient();
  const { email, password, fullName, phone } = parsed.data;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    redirectWithMessage("/auth/sign-up", error.message);
  }

  redirectWithMessage(
    "/auth/sign-in",
    "Account created. Sign in now, or check your email first if confirmation is enabled.",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}

