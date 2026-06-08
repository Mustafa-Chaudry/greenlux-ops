import type { Metadata } from "next";
import Image from "next/image";
import { ClipboardCheck, MapPin, MessageCircle, ShieldCheck, Timer, UploadCloud } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Arrival Guide - GreenLux Residency",
  description:
    "Already booked at GreenLux Residency? Prepare your arrival details, directions, and WhatsApp support before reaching Westridge 1, Rawalpindi.",
  alternates: {
    canonical: "/arrival",
  },
  openGraph: {
    title: "GreenLux Arrival Guide",
    description:
      "A calm arrival guide for confirmed GreenLux Residency guests: online check-in, directions, documents, timing, and WhatsApp support.",
    url: "/arrival",
    images: [
      {
        url: "/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg",
        width: 1200,
        height: 800,
        alt: "GreenLux Residency parking and guest arrival area",
      },
    ],
  },
};

const arrivalSteps = [
  {
    title: "Confirm your booking channel",
    description:
      "Whether you booked direct, on WhatsApp, Booking.com, Airbnb, or another platform, keep your booking name and dates ready.",
    icon: ClipboardCheck,
  },
  {
    title: "Complete arrival details",
    description:
      "After your stay is agreed, online check-in helps us prepare your arrival with fewer messages and clearer next steps.",
    icon: UploadCloud,
  },
  {
    title: "Message if timing changes",
    description:
      "Late arrival, airport delay, extra luggage, children, elders, or early departure? Send GreenLux Residency a quick WhatsApp update before travel.",
    icon: Timer,
  },
  {
    title: "Access details are shared directly",
    description:
      "Wi-Fi, room assignment, verification status, and access details are shared directly by the GreenLux Residency team after review.",
    icon: ShieldCheck,
  },
];

const prepareItems = [
  "Booking name and dates",
  "Guest count",
  "Estimated arrival time",
  "CNIC/passport images",
  "Payment confirmation if paid online",
  "Special arrival notes",
];

export default function ArrivalPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Already booked</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                Prepare for a smoother GreenLux Residency arrival.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                If your stay is confirmed or nearly confirmed, this guide helps you settle the essentials before you
                travel: arrival details, directions, timing changes, and the best way to reach the team.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={siteConfig.onlineCheckInHref} variant="default" showArrow>
                  Complete online check-in
                </CTAButton>
                <CTAButton
                  href={getWhatsAppHref("Hello GreenLux team, I have a confirmed booking and need help with my arrival. My booking name is __, dates are __, and arrival time is __.")}
                  external
                  whatsapp
                  variant="outline"
                >
                  WhatsApp arrival help
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg"
                alt="GreenLux Residency parking and guest arrival area"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Arrival address</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Open directions before leaving, then message GreenLux Residency if your arrival window changes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Before you arrive"
            title="Arrive with the important details already settled."
            description="Online check-in helps GreenLux Residency prepare your stay with the right guest details, timing, documents, and payment confirmation before you reach Westridge."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {arrivalSteps.map((step) => (
              <article key={step.title} className="h-full rounded-[1.5rem] border border-brand-deep/10 bg-white p-5 shadow-sm">
                <step.icon className="h-7 w-7 text-brand-fresh" aria-hidden="true" />
                <h2 className="mt-5 font-serif text-2xl font-semibold leading-tight text-brand-deep">{step.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
            <SectionHeading
              eyebrow="Before you start"
              title="Have these details ready."
              description="The arrival form is quickest when your booking name, dates, ID images, payment confirmation, and arrival timing are ready first."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {prepareItems.map((item) => (
                <div key={item} className="rounded-2xl bg-brand-ivory px-4 py-3 text-sm font-bold text-brand-deep">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-brand-deep/10 bg-[#05281f] text-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <MessageCircle className="h-9 w-9 text-brand-gold" aria-hidden="true" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Need help?</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight">
                Tell GreenLux Residency what changed before you travel.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-white/75">
                If your flight is delayed, your guest count changes, you are arriving late, or you are unsure what to
                upload, message the team before arrival. We will guide you on the next practical step.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  href={getWhatsAppHref("Hello GreenLux team, I need help with my confirmed booking arrival. My booking name is __, dates are __, and the issue is __.")}
                  external
                  whatsapp
                  variant="secondary"
                  className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
                >
                  Message arrival support
                </CTAButton>
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Open directions
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-80 bg-brand-ivory">
              <Image
                src="/greenlux/curation-review/contact/04_loungechanged.jpg"
                alt="GreenLux Residency lounge seating"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
