import type { Metadata } from "next";
import Image from "next/image";
import { CarFront, Compass, MapPin, MessageCircle, Route, ShieldCheck } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Location",
  description: "GreenLux Residency location in Westridge, Rawalpindi with arrival guidance for guests.",
};

const locationStrengths = [
  {
    title: "Quiet",
    description: "A calmer Westridge 1 base for guests who want privacy and a cleaner break from busy rental stays.",
    icon: ShieldCheck,
  },
  {
    title: "Access",
    description: "Useful for Rawalpindi stays with onward access toward Islamabad, family visits, work trips, and appointments.",
    icon: Route,
  },
  {
    title: "Convenience",
    description: "Ask us about food, groceries, transport, and the stay type that fits your visit before you arrive.",
    icon: Compass,
  },
  {
    title: "Control",
    description: "Message directly on WhatsApp so pricing, room choice, and arrival steps are clear before confirmation.",
    icon: MessageCircle,
  },
];

const arrivalSupport = [
  {
    title: "WhatsApp guidance",
    description: "Send your dates, guest count, and visit purpose. We will suggest a suitable stay and share the next steps.",
    icon: MessageCircle,
  },
  {
    title: "Transport clarity",
    description: "Use the map link for the approximate location, then confirm practical arrival guidance with GreenLux.",
    icon: CarFront,
  },
  {
    title: "Arrival support",
    description: "Confirmed guests can complete online check-in before arrival so the first conversation is not rushed.",
    icon: ShieldCheck,
  },
];

export default function LocationPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Location</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                A quieter Westridge base with clear arrival support.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                GreenLux Residency is in Westridge 1, Rawalpindi. Guests use it as a calm base for family visits,
                appointments, work trips, and short stays with direct WhatsApp guidance before arrival.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" showArrow>
                  Open in Google Maps
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/booking/booking-exterior-01.jpg"
                alt="GreenLux Residency exterior and arrival area"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Address</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Approx coordinates: 33.6062 N, 73.0232 E</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <SectionHeading
              eyebrow="Why this location works"
              title="Why this location works for our guests"
              description="The value is simple: a quieter base, useful access, and a direct line to the people managing your stay."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {locationStrengths.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                  <item.icon className="h-7 w-7 text-brand-fresh" aria-hidden="true" />
                  <h2 className="mt-5 font-serif text-3xl font-semibold text-brand-deep">{item.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="rounded-[2rem] border border-brand-deep/10 bg-brand-ivory p-6 shadow-sm sm:p-8">
              <MapPin className="h-8 w-8 text-brand-fresh" aria-hidden="true" />
              <h2 className="mt-5 font-serif text-4xl font-semibold leading-tight text-brand-deep">Before you arrive</h2>
              <p className="mt-4 text-sm leading-7 text-slate-700">
                Use the public map link for orientation, then message GreenLux for room fit, arrival timing, and local
                guidance. Confirmed guests can complete online check-in before reaching the property.
              </p>
              <div className="mt-6 rounded-2xl bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">GreenLux Residency</p>
                <p className="mt-2 font-semibold leading-7 text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Approx coordinates: {siteConfig.coordinates.latitude} N, {siteConfig.coordinates.longitude} E
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" showArrow>
                  Open in Google Maps
                </CTAButton>
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, please share location and arrival guidance for my stay.")}
                  external
                  whatsapp
                >
                  Ask for arrival guidance
                </CTAButton>
              </div>
            </div>

            <div className="grid gap-4">
              {arrivalSupport.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                  <item.icon className="h-7 w-7 text-brand-gold" aria-hidden="true" />
                  <h3 className="mt-4 font-serif text-3xl font-semibold text-brand-deep">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
              <div className="rounded-[1.5rem] bg-[#05281f] p-6 text-white shadow-soft">
                <h3 className="font-serif text-3xl font-semibold">Already booked?</h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Complete online check-in before arrival so your documents and guest details are ready.
                </p>
                <div className="mt-5">
                  <CTAButton
                    href={siteConfig.onlineCheckInHref}
                    variant="secondary"
                    showArrow
                    className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
                  >
                    Already booked? Complete online check-in
                  </CTAButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
