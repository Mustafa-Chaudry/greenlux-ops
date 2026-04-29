import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "GreenLux Residency privacy information for guest records, ID verification, and payment proof.",
};

const privacySections = [
  {
    title: "Information we collect",
    body: "GreenLux may collect guest name, phone/WhatsApp, email, CNIC or passport number, address, travel origin, stay dates, arrival time, number of guests, purpose of visit, booking source, payment method, payment proof, and special requests.",
  },
  {
    title: "Why documents are requested",
    body: "CNIC/passport images and payment proof are collected for booking verification, security, payment confirmation, and stay-related records. This helps maintain a safer, family-friendly environment.",
  },
  {
    title: "Who can access records",
    body: "Guest records and uploaded documents are intended for authorised GreenLux management only. Guests should only access their own submitted records once the secure portal is enabled.",
  },
  {
    title: "Document storage",
    body: "The platform foundation uses private storage for CNIC/passport images and payment proof. Document viewing should use signed links rather than public file URLs.",
  },
  {
    title: "Communication",
    body: "GreenLux may contact guests through WhatsApp, phone, or email for booking confirmation, check-in, payment verification, stay support, and urgent stay-related matters.",
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8 inline-flex rounded-lg bg-brand-sage/70 p-3">
            <ShieldCheck className="h-7 w-7 text-brand-fresh" aria-hidden="true" />
          </div>
          <SectionHeading
            eyebrow="Privacy"
            title="How GreenLux uses guest information."
            description="This privacy statement explains how guest details, ID documents, and payment proof are handled for booking verification and stay records."
          />

          <div className="mt-10 space-y-4">
            {privacySections.map((section) => (
              <section key={section.title} className="rounded-lg border border-brand-sage bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-brand-deep">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{section.body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

