import type { Metadata } from "next";
import Image from "next/image";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { ContactInquiryForm } from "@/components/site/contact-inquiry-form";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { VideoTourSection } from "@/components/site/video-tour-section";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { contactVideos } from "@/lib/site/videos";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact GreenLux Residency on WhatsApp for availability and arrival support.",
};

const contactMethods = [
  {
    label: "WhatsApp",
    value: "Fastest way to confirm dates and rates",
    href: getWhatsAppHref(),
    icon: MessageCircle,
    external: true,
  },
  {
    label: "Phone",
    value: siteConfig.phoneDisplay,
    href: siteConfig.phoneHref,
    icon: Phone,
    external: false,
  },
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
    external: false,
  },
  {
    label: "Online check-in",
    value: "Already booked? Complete details before arrival",
    href: siteConfig.onlineCheckInHref,
    icon: ShieldCheck,
    external: false,
  },
];

const bookingSteps = [
  "Send your dates and guest count.",
  "We confirm the best available room, studio, or apartment.",
  "After booking, complete online check-in before you arrive.",
];

const inquiryChecklist = [
  "Dates",
  "Number of guests",
  "Preferred room, studio, or apartment",
  "Purpose of visit if relevant",
  "Expected arrival time",
];

export default function ContactPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Contact GreenLux</p>
              <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                Message us your dates. We will help you choose the right stay.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                WhatsApp is the quickest way to check availability, compare options, and get arrival guidance for
                GreenLux Residency in Westridge, Rawalpindi.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/booking/booking-exterior-01.jpg"
                alt="GreenLux Residency exterior terrace walkway"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Location</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Exact arrival guidance is shared after confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => (
              <a
                key={method.label}
                href={method.href}
                target={method.external ? "_blank" : undefined}
                rel={method.external ? "noreferrer" : undefined}
                className="group rounded-[1.5rem] border border-brand-deep/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                <method.icon className="h-6 w-6 text-brand-fresh transition group-hover:text-brand-gold" aria-hidden="true" />
                <p className="mt-4 font-serif text-2xl font-semibold text-brand-deep">{method.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{method.value}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <SectionHeading
                eyebrow="How booking works"
                title="A simple direct conversation."
                description="Guests book by speaking directly with GreenLux, so dates, rates, and arrival questions are answered before you confirm."
              />
              <div className="mt-8 space-y-4">
                {bookingSteps.map((step, index) => (
                  <div key={step} className="flex gap-4 rounded-2xl bg-brand-ivory p-4">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-brand-deep text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm font-semibold leading-6 text-brand-deep">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[1.5rem] border border-brand-deep/10 bg-brand-ivory p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">What to send us</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {inquiryChecklist.map((item) => (
                    <p key={item} className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-brand-deep shadow-sm">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href="/rooms" variant="outline" showArrow>
                  View rooms
                </CTAButton>
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-deep/10 bg-brand-ivory p-5 shadow-soft sm:p-7">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Quick inquiry</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-deep">Send details on WhatsApp</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Add your dates, guest count, and room preference. The form opens WhatsApp with your message ready.
                </p>
                <div className="mt-6">
                  <ContactInquiryForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <VideoTourSection
          className="bg-brand-ivory"
          eyebrow="See the space first"
          title="Watch a quick property preview before you message."
          description="Use these short local clips to understand the entrance and terrace feel before asking for availability."
          videos={contactVideos}
        />

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-brand-deep/10 bg-white shadow-soft lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <MapPin className="h-8 w-8 text-brand-fresh" aria-hidden="true" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Area</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-brand-deep">
                A Westridge base for Rawalpindi and Islamabad visits.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-slate-700">
                GreenLux is suited to guests who want a quiet, managed stay with direct support before arrival. Message
                us for room fit, location guidance, and check-in details.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref("Hi GreenLux Residency, please share location guidance for my stay.")} external whatsapp>
                  Ask for location guidance
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-80 bg-brand-ivory">
              <Image
                src="/greenlux/booking/booking-terrace-01.jpg"
                alt="GreenLux Residency terrace seating"
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
