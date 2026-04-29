import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GreenLux Residency's clean, secure, family-friendly serviced stays.",
};

const values = [
  {
    title: "Cleanliness first",
    description: "Rooms are prepared around the details that matter most: fresh bedding, maintained spaces, and calm presentation.",
    icon: Sparkles,
  },
  {
    title: "Family-friendly privacy",
    description: "The environment is designed for respectful family stays, overseas guests, and visitors who need peace.",
    icon: UsersRound,
  },
  {
    title: "Secure check-in",
    description: "ID verification and managed records support a safer stay for every guest.",
    icon: ShieldCheck,
  },
  {
    title: "Responsive host support",
    description: "Management stays reachable through WhatsApp before arrival and throughout the stay.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">About GreenLux</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-brand-deep sm:text-6xl">
              Boutique serviced stays with calm, trust, and consistency.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-700">
              GreenLux Residency serves guests who want a cleaner, calmer, more private alternative to a typical
              short-stay rental. The focus is simple: secure surroundings, well-maintained rooms, family-friendly
              hospitality, and responsive management.
            </p>
            <div className="mt-8">
              <CTAButton href={getWhatsAppHref()} external whatsapp>
                Speak with management
              </CTAButton>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-brand-sage shadow-soft">
            <Image
              src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=82"
              alt="Comfortable serviced apartment living space with warm natural light"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our approach"
              title="Built around what real guests need."
              description="Families, business visitors, medical visitors, tourists, wedding guests, and longer-stay guests often need the same essentials: cleanliness, privacy, security, and responsive help."
              align="center"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-lg border border-brand-sage bg-white p-5 shadow-sm">
                  <value.icon className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
                  <h2 className="mt-4 font-semibold text-brand-deep">{value.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-semibold text-brand-deep sm:text-4xl">
            A managed stay, not just a room key.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            GreenLux is the foundation for a more direct, transparent booking experience: WhatsApp-first
            reservations today, and a secure guest portal and management platform as the next product phases mature.
          </p>
        </section>
      </main>
    </SiteShell>
  );
}

