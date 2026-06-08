import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";

export const metadata: Metadata = {
  title: "Terms and House Rules",
  description: "Basic stay terms for GreenLux Residency guests.",
  alternates: {
    canonical: "/terms",
  },
};

const terms = [
  {
    title: "Booking confirmation",
    body: "Availability and rates are confirmed by management before check-in. Prices may vary by dates, number of guests, room type, booking source, and length of stay.",
  },
  {
    title: "Check-in and check-out",
    body: "Check-in and check-out times are confirmed at booking time. Guests arriving outside agreed hours should message GreenLux on WhatsApp in advance. Already-confirmed guests can complete online check-in before arrival.",
  },
  {
    title: "Verification",
    body: "Guests are required to complete verification before or on arrival, including CNIC or passport details and any supporting documents requested. GreenLux may refuse check-in if required verification is incomplete.",
  },
  {
    title: "Payment",
    body: "GreenLux accepts payment by bank transfer, cash, EasyPaisa, and JazzCash. The method and amount are agreed at booking time. Bank transfers require proof of payment before the booking is treated as confirmed.",
  },
  {
    title: "House rules",
    body: "GreenLux is a quiet, family-friendly residency. Guests must keep noise levels respectful at all times and avoid disturbances to other guests and neighbouring residents. Guests are responsible for any visitors they bring onto the property.",
  },
  {
    title: "Guest conduct",
    body: "Guests must respect the property, staff, and other guests at all times. Management may take action, including removal without refund, if a guest's conduct creates safety or disturbance concerns.",
  },
  {
    title: "Damage and missing items",
    body: "Guests are responsible for damage, misuse, or missing items during their stay. Any charges will be communicated before departure, with supporting details provided by management.",
  },
  {
    title: "Cancellation and changes",
    body: "Cancellation and date-change terms vary by booking source and agreed rate. For direct bookings, GreenLux confirms the applicable cancellation policy at booking time. Where a booking has been confirmed, a cancellation or date-change fee may apply.",
  },
  {
    title: "Privacy",
    body: "Guest details collected during booking, verification, and check-in are used solely to manage your stay. GreenLux does not share guest information with third parties except where required by law or by a booking platform's data-handling terms.",
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
            description="Please read these terms before confirming your stay. For questions about any item, message GreenLux on WhatsApp before booking."
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
