import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { AmenityGrid } from "@/components/site/amenity-grid";
import { CTAButton } from "@/components/site/cta-button";
import { FAQSection } from "@/components/site/faq-section";
import { Hero } from "@/components/site/hero";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { directBookingBenefits, guestReviews, trustHighlights, whyStayItems } from "@/lib/site/content";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { apartmentRooms, featuredRooms, roomTypeLabels } from "@/lib/site/rooms";

const categories = [
  {
    label: roomTypeLabels.club_class,
    description: "Private studios with room to relax and useful kitchen comforts.",
  },
  {
    label: roomTypeLabels.deluxe,
    description: "Quiet, polished rooms for couples, work trips, and short stays.",
  },
  {
    label: roomTypeLabels.executive,
    description: "Simple private rooms with strong value and shared-space access.",
  },
  {
    label: roomTypeLabels.apartment,
    description: "Full apartments for families, longer visits, and extra space.",
  },
];

export default function HomePage() {
  return (
    <SiteShell>
      <main>
        <Hero />

        <section className="mx-auto -mt-10 grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {trustHighlights.map((item) => (
            <div
              key={item.title}
              className="relative rounded-2xl border border-brand-deep/10 bg-white/95 p-5 shadow-[0_22px_60px_rgba(15,61,46,0.12)]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-deep text-brand-gold">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="mt-5 font-serif text-xl font-semibold text-brand-deep">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              eyebrow="Choose your stay"
              title="Find the space that fits your trip."
              description="Pick a room for a quick visit, a studio for more independence, or an apartment when your family needs space."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <div key={category.label} className="rounded-2xl border border-brand-deep/10 bg-white p-5 shadow-sm">
                  <p className="font-serif text-2xl font-semibold text-brand-deep">{category.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#082f25] py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Popular choices"
                title="Stays guests ask for first."
                description="A private studio, a full apartment, and a polished deluxe room. Message us when one fits your dates."
                className="max-w-3xl [&_h2]:text-white [&_p]:text-white/70"
              />
              <Button asChild variant="outline" className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link href="/rooms">
                  View all rooms
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {featuredRooms.map((room) => (
                <RoomCard key={room.slug} room={room} featured />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Apartments and studios"
              title="More space when a room is not enough."
              description="Choose a kitchen, lounge, terrace, or work corner when your stay needs a little more breathing room."
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href="/rooms" variant="default" showArrow>
                Browse apartment-style stays
              </CTAButton>
              <CTAButton href={getWhatsAppHref()} external whatsapp variant="outline">
                Ask availability
              </CTAButton>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {apartmentRooms.slice(0, 4).map((room) => (
              <Link
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className="group overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={room.images[0]}
                    alt={room.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{room.categoryLabel}</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-brand-deep">{room.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Amenities"
              title="Comforts that make the stay easier."
              description="WiFi, cooling, kitchen access, lounge areas, and in-room comforts vary by stay. Each room page shows what to expect."
              align="center"
            />
            <div className="mt-9">
              <AmenityGrid />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Why GreenLux"
              title="Quiet, clean, fully-managed stays you can rely on."
              description="You get clear room choices, quick WhatsApp replies, and a calmer place to arrive after a long day."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {whyStayItems.map((item) => (
                <div key={item.title} className="rounded-2xl border border-brand-deep/10 bg-white p-6 shadow-sm">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-deep text-brand-gold">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-serif text-xl font-semibold text-brand-deep">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-brand-deep py-20 text-white">
          <Image
            src="/greenlux/property/hero-terrace.jpg"
            alt="GreenLux Residency terrace and garden seating"
            fill
            sizes="100vw"
            className="object-cover object-top opacity-[0.26]"
          />
          <div className="absolute inset-0 bg-brand-deep/80" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What guests say"
              title="Short notes from real stays."
              description="Guests often mention the privacy, helpful host, peaceful setting, and value."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {guestReviews.map((review) => (
                <figure key={`${review.source}-${review.quote}`} className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                  <blockquote className="text-lg leading-8 text-white/90">&quot;{review.quote}&quot;</blockquote>
                  <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                    {review.source}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 overflow-hidden rounded-[2rem] border border-brand-deep/10 bg-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5 p-6 sm:p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Location</p>
              <h2 className="font-serif text-4xl font-semibold leading-tight text-brand-deep">
                A calm base for Rawalpindi and Islamabad visits.
              </h2>
              <p className="leading-7 text-slate-700">
                Stay close enough for family visits, work plans, medical appointments, events, and short city trips.
                Confirmed guests receive clear arrival guidance before they reach.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref("Hi GreenLux Residency, please share location and availability details.")} external whatsapp>
                  Ask on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked?
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-80 bg-brand-deep">
              <Image
                src="/greenlux/property/exterior-entry.jpg"
                alt="GreenLux Residency Westridge Rawalpindi property entrance"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/90 p-5 text-brand-deep shadow-soft backdrop-blur">
                <MapPin className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
                <p className="mt-3 font-serif text-2xl font-semibold">{siteConfig.addressLine}</p>
                <p className="mt-1 text-sm text-slate-600">Rawalpindi / Islamabad access</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/70 py-16">
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
                  Book on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Complete online check-in
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#05281f] text-white shadow-soft">
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <MessageCircle className="h-10 w-10 text-brand-gold" aria-hidden="true" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">
                  Why guests book direct with GreenLux
                </p>
                <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight">
                  One WhatsApp message can settle the stay.
                </h2>
                <p className="mt-4 max-w-xl text-white/70">
                  Send your dates, guest count, and preferred room. Ask the questions that matter before you confirm.
                </p>
                <div className="mt-7">
                  <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                    Check availability on WhatsApp
                  </CTAButton>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {directBookingBenefits.map((benefit) => (
                  <div key={benefit.title} className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <benefit.icon className="h-6 w-6 text-brand-gold" aria-hidden="true" />
                    <h3 className="mt-4 font-serif text-xl font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/70">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
