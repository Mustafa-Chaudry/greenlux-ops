import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Hospital, MapPin, MessageCircle, Plane, Route, Trees, Utensils } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { MobileCarousel } from "@/components/site/mobile-carousel";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref } from "@/lib/site/config";
import { guides, type GuideIcon, type GuideImageCredit, type SiteGuide } from "@/lib/site/guides";
import { guideItemListJsonLd } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "Local Stay Guides - Rawalpindi & Islamabad",
  description:
    "Plan a calmer GreenLux stay around Westridge 1, medical visits, airport arrivals, food, parks, Islamabad access, Murree, Galiyat, and northern travel.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "GreenLux Local Stay Guides",
    description:
      "Plan your GreenLux stay around the reason you are visiting Rawalpindi, from medical appointments and airport arrivals to family plans, Islamabad access, and onward travel.",
    url: "/guides",
    images: [
      {
        url: "/greenlux/curation-review/guides/03__guide-card__Westridge-1-location-guide__army-museum-park.jpg",
        width: 1200,
        height: 800,
        alt: "Westridge 1 local attraction near GreenLux Residency",
      },
    ],
  },
};

const guideIcons: Record<GuideIcon, typeof MapPin> = {
  map: MapPin,
  hospital: Hospital,
  food: Utensils,
  park: Trees,
  route: Route,
  passport: Plane,
};

function ImageCredit({ credit }: { credit?: GuideImageCredit }) {
  if (!credit) {
    return null;
  }

  return (
    <p className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold leading-5 text-white backdrop-blur">
      Photo:{" "}
      <a href={credit.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {credit.label}
      </a>{" "}
      /{" "}
      <a href={credit.licenseHref} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {credit.license}
      </a>
    </p>
  );
}

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
        <ImageCredit credit={guide.imageCredit} />
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

        <div className="mt-5 space-y-3 rounded-2xl border border-brand-deep/10 bg-white p-5">
          <p className="text-sm leading-7 text-slate-700">
            <span className="font-bold text-brand-deep">Good when: </span>
            {guide.whoItHelps}
          </p>
          <p className="text-sm leading-7 text-slate-700">
            <span className="font-bold text-brand-deep">Room fit to ask about: </span>
            {guide.suggestedRoomType}
          </p>
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
              <ImageCredit credit={guide.supportImageCredit} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{guide.supportLabel}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Use this as a local cue. Routes, timings, and opening hours can change, so message GreenLux before you travel.
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

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CTAButton
            href={getWhatsAppHref(`Hi GreenLux Residency, I am planning a stay related to ${guide.shortTitle}. Please suggest the right available stay for my dates.`)}
            external
            whatsapp
          >
            Ask for the right stay
          </CTAButton>
          <Link href={guide.href} className="inline-flex items-center gap-2 text-sm font-bold text-brand-deep hover:text-brand-fresh">
            Read guide
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(guideItemListJsonLd) }} />
      <main>
        <section className="bg-brand-ivory px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">GreenLux local guides</p>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight text-brand-deep sm:text-6xl">
                Know the area before you choose the room.
              </h1>
            </div>
            <div>
              <p className="text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                GreenLux is in Westridge 1, Rawalpindi. Use these guides to plan the stay around the real reason you
                are coming: hospital visits, family plans, food nearby, airport arrivals, Islamabad movement, Murree,
                Galiyat, or northern travel.
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
            title="Pick the guide that matches your visit."
            description="Each guide is written for a real booking moment: what you need nearby, what to confirm before travel, and which stay type to ask GreenLux about."
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
              eyebrow="Need a recommendation?"
              title="Tell us what brings you to Rawalpindi."
              description="Share your dates, guest count, arrival time, and visit purpose. GreenLux will suggest the stay type that makes the trip feel easier."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-7 flex justify-center">
              <CTAButton
                href={getWhatsAppHref("Hi GreenLux Residency, I need help choosing a stay. My visit purpose is __, dates are __, guest count is __, and arrival time is __.")}
                external
                whatsapp
                variant="secondary"
                className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
              >
                Ask for a stay recommendation
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
