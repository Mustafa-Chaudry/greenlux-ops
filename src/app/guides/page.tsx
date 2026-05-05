import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref } from "@/lib/site/config";
import { guides } from "@/lib/site/guides";

export const metadata: Metadata = {
  title: "Local Guides",
  description: "GreenLux Residency guides for Westridge, nearby hospitals, food, parks, and Rawalpindi / Islamabad access.",
};

export default function GuidesPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">GreenLux guides</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                Plan your stay around Westridge, Rawalpindi.
              </h1>
            </div>
            <div>
              <p className="text-lg leading-8 text-slate-700">
                A direct booking is easier when you know what is nearby. These guides help guests choose the right room,
                studio, or apartment for family visits, medical travel, work trips, and short stays.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href="/location" variant="outline" showArrow>
                  View location
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {guides.map((guide, index) => (
              <article
                key={guide.slug}
                id={guide.slug}
                className="grid overflow-hidden rounded-[1.75rem] border border-brand-deep/10 bg-white shadow-sm lg:grid-cols-[0.74fr_1.26fr]"
              >
                <div className="relative min-h-72 bg-brand-ivory">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 34vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 lg:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">{guide.shortTitle}</p>
                  <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-brand-deep">{guide.title}</h2>
                  <p className="mt-4 leading-7 text-slate-700">{guide.description}</p>
                  <p className="mt-4 rounded-2xl bg-brand-ivory p-4 text-sm font-semibold leading-6 text-brand-deep">
                    {guide.guestNeed}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {guide.stayTypes.map((stayType) => (
                      <span key={stayType} className="rounded-full bg-brand-sage/45 px-3 py-1.5 text-xs font-bold text-brand-deep">
                        {stayType}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <CTAButton href={getWhatsAppHref(`Hi GreenLux Residency, I am planning a stay related to ${guide.shortTitle}. Please suggest the best available option.`)} external whatsapp>
                      Ask which stay fits
                    </CTAButton>
                    <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-brand-deep hover:text-brand-fresh">
                      View rooms
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <SectionHeading
              eyebrow="Need help choosing?"
              title="Tell us why you are visiting."
              description="Share your dates, guest count, and visit purpose. We will suggest the room, studio, or apartment that best fits."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-7 flex justify-center">
              <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                Check availability on WhatsApp
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
