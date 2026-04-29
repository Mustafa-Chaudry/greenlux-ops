import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Terms",
  description: "Basic stay terms for GreenLux Residency guests.",
};

const terms = [
  {
    title: "Booking confirmation",
    body: "Availability and rates are confirmed by management before check-in. Prices may vary by dates, number of guests, room type, booking source, and length of stay.",
  },
  {
    title: "Check-in and verification",
    body: "Guests may be required to complete verification before arrival, including CNIC/passport details and supporting documents. GreenLux may refuse check-in if required verification is incomplete.",
  },
  {
    title: "Payment",
    body: "Payment method and amount are agreed before or during check-in. Bank transfer or online payment may require proof of payment before the booking is treated as confirmed.",
  },
  {
    title: "Guest conduct",
    body: "Guests must maintain a peaceful, family-friendly environment and respect the property, neighbours, staff, and other guests. Management may take action if conduct creates safety or disturbance concerns.",
  },
  {
    title: "Damage and missing items",
    body: "Guests may be responsible for damage, misuse, or missing items during their stay. Any charges should be communicated by management with reasonable supporting details.",
  },
  {
    title: "Cancellation and changes",
    body: "Cancellation and date-change rules may vary by booking source and agreed rate. For direct bookings, management will confirm the applicable policy at booking time.",
  },
];

export default function TermsPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-8 inline-flex rounded-lg bg-brand-sage/70 p-3">
            <ClipboardCheck className="h-7 w-7 text-brand-fresh" aria-hidden="true" />
          </div>
          <SectionHeading
            eyebrow="Terms"
            title="Basic stay terms."
            description="These are starter terms for the public website. Final terms can be expanded with management-approved cancellation and house-rule details."
          />

          <div className="mt-10 space-y-4">
            {terms.map((term) => (
              <section key={term.title} className="rounded-lg border border-brand-sage bg-white p-6 shadow-sm">
                <h2 className="font-semibold text-brand-deep">{term.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{term.body}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
