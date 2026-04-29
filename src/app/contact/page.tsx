import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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
    label: "Location",
    value: siteConfig.location,
    href: getWhatsAppHref("Hello GreenLux Residency, please share your location details."),
    icon: MapPin,
    external: true,
  },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="space-y-8">
            <SectionHeading
              eyebrow="Contact"
              title="Check availability before you arrive."
              description="WhatsApp is the quickest path. Share your dates, number of guests, room preference, and arrival time so management can confirm availability."
            />
            <CTAButton href={getWhatsAppHref()} external whatsapp>
              Book on WhatsApp
            </CTAButton>

            <div className="grid gap-3">
              {contactMethods.map((method) => (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.external ? "_blank" : undefined}
                  rel={method.external ? "noreferrer" : undefined}
                  className="flex items-center gap-4 rounded-lg border border-brand-sage bg-white p-4 shadow-sm transition-shadow hover:shadow-soft"
                >
                  <method.icon className="h-5 w-5 flex-none text-brand-fresh" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold text-brand-deep">{method.label}</span>
                    <span className="block text-sm text-slate-600">{method.value}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>

          <Card className="border-brand-sage shadow-soft">
            <CardHeader>
              <CardTitle>Send a quick inquiry</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactInquiryForm />
            </CardContent>
          </Card>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 rounded-lg border border-brand-sage bg-brand-ivory p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Area</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-deep">Rawalpindi / Islamabad access</h2>
                <p className="mt-4 leading-7 text-slate-700">
                  Exact directions are shared with confirmed guests. This protects guest privacy and keeps arrivals
                  simple for families, business visitors, and longer-stay guests.
                </p>
              </div>
              <div className="grid min-h-64 place-items-center rounded-lg bg-brand-sage/55 p-6 text-center">
                <MapPin className="h-10 w-10 text-brand-fresh" aria-hidden="true" />
                <p className="mt-4 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm text-slate-600">Message on WhatsApp for exact arrival guidance.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

