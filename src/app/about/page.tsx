import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GreenLux Residency's boutique serviced accommodation in Rawalpindi.",
};

const values = [
  {
    title: "Fresh, ready rooms",
    description: "Clean bedding, calm interiors, and a space prepared before you arrive.",
    icon: Sparkles,
  },
  {
    title: "Privacy for families",
    description: "A quieter place for families, overseas guests, and visitors who need peace.",
    icon: UsersRound,
  },
  {
    title: "Check in before arrival",
    description: "Send your details early and arrive with less waiting.",
    icon: ShieldCheck,
  },
  {
    title: "Fast WhatsApp help",
    description: "Ask questions, share arrival time, and get clear replies.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="relative overflow-hidden bg-[#05281f] text-white">
          <Image
            src="/greenlux/property/hero-terrace.jpg"
            alt="GreenLux Residency terrace seating and garden"
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-[#05281f]/80" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">About GreenLux</p>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl">
                Quiet, clean, fully-managed stays you can rely on.
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/75">
                GreenLux Residency gives guests a calmer alternative to a busy hotel or self-managed rental. Choose
                your stay, message on WhatsApp, and complete check-in before you reach.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                  Ask on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Complete online check-in
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-soft">
              <Image
                src="/greenlux/property/lounge-room.jpg"
                alt="GreenLux Residency room interior"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why it feels easier"
              title="A managed stay, not just a room key."
              description="GreenLux suits families, business visitors, short-stay guests, and repeat guests who want privacy, clear answers, and a practical base between Rawalpindi and Islamabad."
              align="center"
            />
            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="rounded-2xl border border-brand-deep/10 bg-white p-6 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-deep text-brand-gold">
                    <value.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 font-serif text-xl font-semibold text-brand-deep">{value.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-brand-deep shadow-soft">
            <Image
              src="/greenlux/property/exterior-entry.jpg"
              alt="GreenLux Residency private exterior entrance"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Arrive prepared"
              title="Arrive without stress. Check in before you reach."
              description="You can ask questions before booking, share your arrival time, and complete online check-in once your stay is confirmed."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Quick WhatsApp replies", "Named room choices", "Online check-in", "Clear arrival guidance"].map((item) => (
                <div key={item} className="rounded-2xl border border-brand-deep/10 bg-white p-4 text-sm font-semibold text-brand-deep">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
