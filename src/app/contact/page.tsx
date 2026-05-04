import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { ContactInquiryForm } from "@/components/site/contact-inquiry-form";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact GreenLux Residency on WhatsApp for room availability and booking support.",
};

const contactMethods = [
  {
    label: "WhatsApp",
    value: "Fastest response for availability",
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
    label: "Already booked?",
    value: "Complete online check-in",
    href: siteConfig.onlineCheckInHref,
    icon: ShieldCheck,
    external: false,
  },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-[#05281f] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-8">
              <SectionHeading
                eyebrow="Contact"
                title="Check availability before you arrive."
                description="WhatsApp is the quickest path. Share your dates, guest count, preferred stay, and arrival time. We will send availability and rates."
                className="[&_h2]:text-white [&_p]:text-white/75"
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                  WhatsApp Book Now
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Already booked? Check in
                </CTAButton>
              </div>

              <div className="grid gap-3">
                {contactMethods.map((method) => (
                  <a
                    key={method.label}
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noreferrer" : undefined}
                    className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 text-white shadow-sm transition-colors hover:bg-white/20"
                  >
                    <method.icon className="h-5 w-5 flex-none text-brand-gold" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold">{method.label}</span>
                      <span className="block text-sm text-white/70">{method.value}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Card className="rounded-[2rem] border-white/20 bg-white text-brand-deep shadow-soft">
              <CardHeader>
                <CardTitle className="font-serif text-3xl">Send a quick WhatsApp inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactInquiryForm />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-brand-deep/10 bg-white shadow-soft lg:grid-cols-[0.8fr_1.2fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Area</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-brand-deep">
                  {siteConfig.addressLine}
                </h2>
                <p className="mt-5 leading-7 text-slate-700">
                  GreenLux is positioned for Rawalpindi / Islamabad access. Exact directions are shared with confirmed
                  guests for privacy and a smoother arrival.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <CTAButton href={getWhatsAppHref("Hi GreenLux Residency, please share location guidance for my stay.")} external whatsapp>
                    Ask for location
                  </CTAButton>
                  <CTAButton href="/rooms" variant="outline" showArrow>
                    Browse rooms
                  </CTAButton>
                </div>
              </div>
              <div className="grid min-h-80 place-items-center bg-brand-sage/50 p-8 text-center">
                <MapPin className="h-12 w-12 text-brand-fresh" aria-hidden="true" />
                <p className="mt-5 font-serif text-3xl font-semibold text-brand-deep">{siteConfig.location}</p>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  Send dates and guest count on WhatsApp. We will share availability, location guidance, and arrival
                  steps.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
