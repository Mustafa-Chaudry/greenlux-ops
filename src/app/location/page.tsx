import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { VideoTourSection } from "@/components/site/video-tour-section";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { guides, nearbyCategories } from "@/lib/site/guides";
import { locationVideos } from "@/lib/site/videos";

export const metadata: Metadata = {
  title: "Location",
  description: "GreenLux Residency location in Westridge, Rawalpindi with access toward Islamabad.",
};

export default function LocationPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Location</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                A quiet Westridge base for Rawalpindi and Islamabad visits.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                GreenLux works well for guests who want a calmer managed stay with direct WhatsApp support before
                arrival. Exact arrival guidance is shared after booking confirmation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href="/rooms" variant="outline" showArrow>
                  View rooms
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/booking/booking-exterior-01.jpg"
                alt="GreenLux Residency exterior walkway"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-white/95 p-4 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">Area</p>
                <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.addressLine}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Rawalpindi base with Islamabad access.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="Nearby context"
                title="Choose the stay around your reason for visiting."
                description="Tell us what brings you to Rawalpindi or Islamabad, and we can suggest the right room type for your dates."
              />
              <div className="mt-8 rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                <MapPin className="h-8 w-8 text-brand-fresh" aria-hidden="true" />
                <h2 className="mt-4 font-serif text-3xl font-semibold text-brand-deep">Map guidance</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  We have not added an exact map embed in this prototype because coordinates were not provided. Confirmed
                  guests receive exact directions before arrival.
                </p>
                <div className="mt-5">
                  <CTAButton href={getWhatsAppHref("Hi GreenLux Residency, please share location guidance for my stay.")} external whatsapp>
                    Ask for location guidance
                  </CTAButton>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {nearbyCategories.map((category) => (
                <div key={category.title} className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-5 shadow-sm">
                  <h3 className="font-serif text-2xl font-semibold text-brand-deep">{category.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <VideoTourSection
          className="bg-white"
          eyebrow="Location videos"
          title="See the approach and shared spaces."
          description="These local clips give a quick feel for the entrance, terrace, and building context before you arrive."
          videos={locationVideos}
        />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Guides"
              title="Useful local planning notes."
              description="Start with the guide that matches your visit, then message GreenLux for the right available stay."
            />
            <CTAButton href="/guides" variant="outline" showArrow>
              View all guides
            </CTAButton>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.slice(0, 3).map((guide) => (
              <Link key={guide.slug} href={guide.href} className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{guide.shortTitle}</p>
                <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight text-brand-deep">{guide.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-4xl font-semibold">Ask us which room fits your visit.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Share your dates, number of guests, and reason for staying near Westridge. We will suggest a suitable option.
            </p>
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
