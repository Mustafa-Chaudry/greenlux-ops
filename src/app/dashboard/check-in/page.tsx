import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { CheckInForm } from "@/components/check-in/check-in-form";
import { Button } from "@/components/ui/button";
import { requireUserProfile } from "@/lib/auth/guards";
import { getWhatsAppHref } from "@/lib/site/config";

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

        <header className="overflow-hidden rounded-xl border border-brand-sage bg-white/90 shadow-sm">
          <div className="bg-brand-deep px-5 py-6 text-white sm:px-6">
            <p className="text-sm font-semibold uppercase text-brand-gold">Guest arrival concierge</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold sm:text-4xl">
              Complete your GreenLux arrival details.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              A simple check-in journey for your details, ID/payment upload, arrival timing, and next
              steps. Staff review happens after you submit.
            </p>
          </div>
          <div className="grid gap-3 p-5 text-sm sm:grid-cols-3 sm:p-6">
            <div className="flex items-start gap-3 rounded-lg bg-brand-ivory p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-brand-fresh" aria-hidden="true" />
              <span>Designed to make arrival smooth and clear before you reach.</span>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-brand-ivory p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-brand-fresh" aria-hidden="true" />
              <span>Your information is used for booking and verification only.</span>
            </div>
            <a
              href={getWhatsAppHref("Hello GreenLux team, I need help with my online check-in.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-lg bg-brand-ivory p-3 font-semibold text-brand-deep transition hover:bg-brand-sage"
            >
              <MessageCircle className="mt-0.5 h-4 w-4 text-brand-fresh" aria-hidden="true" />
              Need help? WhatsApp staff
            </a>
          </div>
        </header>

        <CheckInForm profile={profile} />
      </div>
    </main>
  );
}

