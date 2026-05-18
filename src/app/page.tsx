import Image from "next/image";
import { CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { FAQSection } from "@/components/site/faq-section";
import { Hero } from "@/components/site/hero";
import { RatingCards } from "@/components/site/rating-cards";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { TestimonialVideoSection } from "@/components/site/testimonial-video-section";
import { VideoTourSection } from "@/components/site/video-tour-section";
import { propertyMoments } from "@/lib/site/content";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

import { featuredRooms } from "@/lib/site/rooms";
import { approvedVideoTestimonials } from "@/lib/site/testimonials";
import { homepageRatings } from "@/lib/site/trust";
import { homepageVideos } from "@/lib/site/videos";


const guestMentionHighlights = [
  "Clean and well-kept rooms",
  "Quiet residential location",
  "Responsive and helpful host",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "GreenLux Residency",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rawalpindi / Islamabad",
    addressCountry: "Pakistan",
  },
  description: "Thoughtfully managed stays in Rawalpindi — designed for calm, privacy, and control.",
  priceRange: "$$",
};

export default function HomePage() {
  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Hero />

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What guests say"
            title="Highly Rated Across Platforms. Optimized for Direct Bookings."
            description="Enjoy verified peace of mind with our standout ratings on major networks, paired with a seamless, personalized direct booking experience right through WhatsApp."
            align="center"
          />
          <div className="mt-10 rounded-[1.75rem] border border-brand-deep/10 bg-brand-ivory p-5 shadow-sm sm:p-7">
            <RatingCards ratings={homepageRatings} />
            <div className="mt-6 grid gap-4 rounded-[1.25rem] bg-white p-5 md:grid-cols-[0.75fr_1.25fr] md:items-center">
              <div>
                <p className="font-serif text-2xl font-semibold text-brand-deep">Guests consistently mention:</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Direct communication available before arrival via WhatsApp.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {guestMentionHighlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl bg-brand-ivory px-4 py-3 text-sm font-bold text-brand-deep">
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
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
                  <span className="font-bold">{siteConfig.shortAddress}.</span> A quiet base for Rawalpindi and Islamabad visits.
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

        <TestimonialVideoSection testimonials={approvedVideoTestimonials} className="bg-brand-ivory" />

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

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featuredRooms.slice(0, 4).map((room) => (
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


        <section className="bg-brand-ivory py-12">
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
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#05281f] text-white shadow-soft">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-8 md:p-12">

              {/* Columns 1-5: The Value Proposition Layer */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    {
                      title: "Faster response",
                      description: "Send your dates and get a clear reply from our team.",
                    },
                    {
                      title: "No platform fees",
                      description: "Ask for the direct rate for your dates.",
                    },
                    {
                      title: "Direct communication",
                      description: "Share arrival time, guest count, and room preference in one chat.",
                    },
                    {
                      title: "Flexible stays",
                      description: "Ask about short stays, family trips, work visits, and longer bookings.",
                    },
                  ].map((pillar) => (
                    <div key={pillar.title} className="flex gap-4">
                      <div className="mt-1 flex-none">
                        <CheckCircle2 className="h-6 w-6 text-brand-gold" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-white/95">{pillar.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/70">{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columns 6-12: The Conversion & Intent Hub */}
              <div className="lg:col-span-7 flex flex-col justify-center lg:pl-12 lg:border-l lg:border-white/10">
                <MessageCircle className="h-10 w-10 text-brand-gold" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Ready to ask?</p>
                <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold leading-tight">
                  Tell us your dates and guest count. We will suggest the right stay.
                </h2>
                <p className="mt-4 max-w-xl text-white/70">
                  Ask for availability, room fit, and arrival details in one WhatsApp conversation.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "Visiting Family", msg: "Hi GreenLux, I'm planning a visit to see family..." },
                    { label: "Medical Visit", msg: "Hi GreenLux, I'm planning a medical visit stay..." },
                    { label: "Work Trip", msg: "Hi GreenLux, I'm planning a work trip..." },
                    { label: "International Travel", msg: "Hi GreenLux, I'm planning an international travel stay..." },
                  ].map((intent) => (
                    <a
                      key={intent.label}
                      href={getWhatsAppHref(intent.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-brand-deep/10 bg-brand-ivory/50 px-3 py-1 text-xs text-brand-deep/80 transition-colors hover:bg-brand-ivory"
                    >
                      {intent.label}
                    </a>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                    Check availability on WhatsApp
                  </CTAButton>
                  <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                    Already booked? Complete online check-in
                  </CTAButton>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
