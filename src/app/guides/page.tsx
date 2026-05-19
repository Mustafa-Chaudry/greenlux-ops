import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Hospital, MapPin, MessageCircle, Plane, Route, Trees, Utensils } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { MobileCarousel } from "@/components/site/mobile-carousel";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref } from "@/lib/site/config";
import { guides, type GuideIcon, type SiteGuide } from "@/lib/site/guides";

export const metadata: Metadata = {
  title: "Local Guides",
  description:
    "GreenLux Residency local guides for Westridge 1, nearby hospitals, Race Course Park, food, essentials, and Rawalpindi / Islamabad access.",
};

const guideIcons: Record<GuideIcon, typeof MapPin> = {
  map: MapPin,
  hospital: Hospital,
  food: Utensils,
  park: Trees,
  route: Route,
  passport: Plane,
};

function GuideCard({ guide }: { guide: SiteGuide }) {
  const Icon = guideIcons[guide.icon] ?? Building2;

  return (
    <article
      id={guide.slug}
      className="grid h-full overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white shadow-sm lg:grid-cols-[0.56fr_1.44fr]"
    >
      <div className="relative min-h-64 bg-brand-deep/5 lg:min-h-full">
        <Image src={guide.imageSrc} alt={guide.imageAlt} fill sizes="(min-width: 1024px) 34vw, 90vw" className="object-cover" />
        <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-white/92 text-brand-fresh shadow-sm">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
      <div className="p-5 sm:p-7 lg:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">{guide.shortTitle}</p>
        <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-4xl">{guide.title}</h2>
        <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">{guide.description}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {guide.highlights.map((highlight) => (
            <div key={highlight} className="rounded-2xl bg-brand-ivory p-4">
              <p className="text-sm font-semibold leading-6 text-brand-deep">{highlight}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-deep/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Who it helps</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">{guide.whoItHelps}</p>
          </div>
          <div className="rounded-2xl border border-brand-deep/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Why it matters</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">{guide.whyItMatters}</p>
          </div>
          <div className="rounded-2xl border border-brand-deep/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Suggested stay</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">{guide.suggestedRoomType}</p>
          </div>
        </div>

        {guide.supportImageSrc ? (
          <div className="mt-5 grid gap-4 rounded-2xl bg-brand-ivory p-4 sm:grid-cols-[0.72fr_1.28fr] sm:items-center">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-brand-deep/5">
              <Image
                src={guide.supportImageSrc}
                alt={guide.supportImageAlt ?? ""}
                fill
                sizes="(min-width: 1024px) 26vw, 80vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{guide.supportLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Included as a quick planning visual only. Confirm timing and directions with GreenLux before arrival.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {guide.stayTypes.map((stayType) => (
            <span key={stayType} className="rounded-full bg-brand-sage/45 px-3 py-1.5 text-xs font-bold text-brand-deep">
              {stayType}
            </span>
          ))}
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{guide.sourceNote}</p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CTAButton
            href={getWhatsAppHref(`Hi GreenLux Residency, I am planning a stay related to ${guide.shortTitle}. Please suggest the best available option.`)}
            external
            whatsapp
          >
            Ask which stay fits
          </CTAButton>
          <Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-brand-deep hover:text-brand-fresh">
            View rooms
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function GuidesPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">GreenLux guides</p>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight text-brand-deep sm:text-6xl">
                Local notes for easier Rawalpindi stays.
              </h1>
            </div>
            <div>
              <p className="text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                These are not generic travel articles. They are practical GreenLux stay-planning notes for guests choosing
                Westridge for family visits, medical appointments, food access, parks, work trips, and Islamabad movement.
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

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <SectionHeading
            eyebrow="Stay planning"
            title="Choose the guide that matches why you are visiting."
            description="Each guide translates local GreenLux blog context into a shorter booking decision: who it helps, why it matters, and which stay type may fit."
          />
          <div className="mt-10">
            <MobileCarousel ariaLabel="GreenLux local guides" intervalMs={7200}>
              {guides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </MobileCarousel>
            <div className="hidden gap-6 md:grid">
              {guides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <SectionHeading
              eyebrow="Need help choosing?"
              title="Tell us the purpose of your visit."
              description="Share your dates, guest count, arrival time, and whether this is for family, medical, work, or a short stay. GreenLux will suggest the best fit directly."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-7 flex justify-center">
              <CTAButton
                href={getWhatsAppHref("Hi GreenLux Residency, I need help choosing a stay based on my visit purpose, dates, guest count, and arrival time.")}
                external
                whatsapp
                variant="secondary"
                className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
              >
                Ask GreenLux on WhatsApp
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
