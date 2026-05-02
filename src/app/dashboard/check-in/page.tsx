import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CheckInForm } from "@/components/check-in/check-in-form";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Guest Check-In",
  description: "Submit GreenLux Residency guest check-in details and verification documents.",
};

export default async function CheckInPage() {
  const { profile } = await requireUserProfile();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </Button>

        <header className="rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Guest Check-In</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-brand-deep sm:text-4xl">
            Complete your arrival details.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your information is securely stored and used only for booking and verification purposes.
          </p>
        </header>

        <CheckInForm profile={profile} />
      </div>
    </main>
  );
}

