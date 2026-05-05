import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { FAQSection } from "@/components/site/faq-section";
import { Hero } from "@/components/site/hero";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { VideoTourSection } from "@/components/site/video-tour-section";
import { directBookingBenefits, guestReviews, propertyMoments } from "@/lib/site/content";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { guides } from "@/lib/site/guides";
import { featuredRooms } from "@/lib/site/rooms";
import { homepageVideos } from "@/lib/site/videos";

export default function HomePage() {
  const [primaryStay, ...secondaryStays] = featuredRooms;

  return (
    <SiteShell>
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Featured stays"
              title="Start with the stays guests ask for most."
              description="A private studio, a family apartment, and a polished room. Each one gives a different level of space, privacy, and value."
              className="max-w-3xl"
            />
            <CTAButton href="/rooms" variant="outline" showArrow>
              View rooms
            </CTAButton>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {primaryStay ? (
              <div className="lg:row-span-2">
                <RoomCard room={primaryStay} featured />
              </div>
            ) : null}
            {secondaryStays.slice(0, 2).map((room) => (
              <RoomCard key={room.slug} room={room} featured />
            ))}
          </div>
        </section>

        <VideoTourSection
          className="bg-white"
          title="Take a quick look around GreenLux."
          description="Short local videos help you understand the entrance, shared spaces, and overall feel before you message for availability."
          videos={homepageVideos}
        />

        <section className="bg-white py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-brand-ivory shadow-soft">
              <Image
                src="/greenlux/booking/booking-common-area-01.jpg"
                alt="GreenLux Residency common terrace seating"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <SectionHeading
                eyebrow="Book direct"
                title="Message your dates. Get a clear answer."
                description="Direct booking is simple here: ask on WhatsApp, confirm the room and rate, then complete online check-in after your stay is confirmed."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {directBookingBenefits.map((benefit) => (
                  <div key={benefit.title} className="border-t border-brand-deep/10 pt-5">
                    <benefit.icon className="h-6 w-6 text-brand-gold" aria-hidden="true" />
                    <h3 className="mt-4 font-serif text-xl font-semibold text-brand-deep">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What guests say"
            title="Short notes from real stays."
            description="Guests often mention the privacy, peaceful setting, helpful host, and value."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {guestReviews.slice(0, 6).map((review) => (
              <figure key={`${review.source}-${review.quote}`} className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                <blockquote className="font-serif text-2xl leading-9 text-brand-deep">&quot;{review.quote}&quot;</blockquote>
                <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                  {review.source}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <SectionHeading
                eyebrow="Common areas"
                title="More than a room to sleep in."
                description="GreenLux gives selected guests access to calm shared spaces, including terrace seating, lounge areas, and dining or kitchen access where listed."
              />
              <div className="flex items-center gap-3 rounded-2xl bg-brand-ivory p-5 text-brand-deep">
                <MapPin className="h-6 w-6 flex-none text-brand-fresh" aria-hidden="true" />
                <p className="text-sm leading-6">
                  <span className="font-bold">{siteConfig.addressLine}.</span> A quiet base for Rawalpindi and Islamabad visits.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {propertyMoments.map((moment) => (
                <article key={moment.title} className="overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-brand-ivory">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={moment.image}
                      alt={moment.alt}
                      fill
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl font-semibold text-brand-deep">{moment.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{moment.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <SectionHeading
              eyebrow="Local guides"
              title="Plan the stay around your visit."
              description="A useful stay starts with location clarity. These guides help guests think through medical visits, family plans, food nearby, and Rawalpindi / Islamabad access."
            />
            <div className="flex justify-start lg:justify-end">
              <CTAButton href="/guides" variant="outline" showArrow>
                View guides
              </CTAButton>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {guides.slice(0, 3).map((guide) => (
              <Link
                key={guide.slug}
                href={guide.href}
                className="group overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
              >
                <span className="relative block aspect-[4/3] bg-brand-ivory">
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    sizes="(min-width: 1024px) 30vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="block p-5">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{guide.shortTitle}</span>
                  <span className="mt-3 block font-serif text-2xl font-semibold leading-tight text-brand-deep">
                    {guide.title}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{guide.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-brand-ivory py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Before you message."
              description="A quick preview of common questions guests ask before confirming a stay."
            />
            <div className="space-y-5">
              <FAQSection limit={4} />
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href="/rooms" variant="outline" showArrow>
                  View rooms
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#05281f] text-white shadow-soft lg:grid-cols-[1fr_0.8fr]">
            <div className="p-8 sm:p-12">
              <MessageCircle className="h-10 w-10 text-brand-gold" aria-hidden="true" />
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Ready to ask?</p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight">
                Tell us your dates and guest count. We will suggest the right stay.
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Ask for availability, room fit, and arrival details in one WhatsApp conversation.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>
            <Link href="/rooms" className="group relative min-h-80 overflow-hidden">
              <Image
                src="/greenlux/booking/booking-exterior-01.jpg"
                alt="GreenLux Residency terrace walkway at night"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-brand-deep shadow-sm">
                View rooms
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
