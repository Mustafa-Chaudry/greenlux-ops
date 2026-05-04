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
import { reviewThemes, trustHighlights, whyStayItems } from "@/lib/site/content";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { apartmentRooms, featuredRooms, roomTypeLabels } from "@/lib/site/rooms";

const categories = [
  {
    label: roomTypeLabels.club_class,
    description: "Studio-style privacy with warm interiors and practical kitchen amenities.",
  },
  {
    label: roomTypeLabels.deluxe,
    description: "Polished private rooms for couples, business guests, and short stays.",
  },
  {
    label: roomTypeLabels.executive,
    description: "Value-focused private rooms with access to common GreenLux spaces.",
  },
  {
    label: roomTypeLabels.apartment,
    description: "Full apartment layouts for families, long stays, and guests needing separation.",
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
              eyebrow="Accommodation categories"
              title="Clear choices for short stays, families, business travel, and longer visits."
              description="GreenLux is easier to understand when the inventory is presented as named units, not generic hotel categories. Guests can compare rooms, studios, and full apartments quickly before messaging on WhatsApp."
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
                eyebrow="Featured stays"
                title="Premium spaces guests can book directly."
                description="A quick look at GreenLux's strongest direct-booking inventory: a club class studio, a full apartment, and a polished deluxe room."
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
              title="For guests who need more than a room."
              description="Families, overseas visitors, and longer-stay guests often need a kitchen, lounge, terrace, or work corner. GreenLux's studios and apartments make that choice obvious."
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
              title="Practical comforts, presented without guesswork."
              description="Amenities vary by unit, so room pages list the relevant details. These are the recurring GreenLux comforts guests look for before booking."
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
              title="A direct-booking site that supports how guests actually book."
              description="GreenLux guests often compare on Airbnb or hotel platforms, then want quick human confirmation. The public website now makes the next action clear without pretending to be a booking engine."
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
              eyebrow="Guest trust"
              title="The promise is simple: clean, calm, responsive."
              description="The public site avoids inflated claims and focuses on what matters operationally: clear rooms, direct confirmation, and check-in readiness."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {reviewThemes.map((theme) => (
                <figure key={theme.label} className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
                  <blockquote className="text-lg leading-8 text-white/90">&quot;{theme.quote}&quot;</blockquote>
                  <figcaption className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
                    {theme.label}
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
                A practical base for Rawalpindi and Islamabad visits.
              </h2>
              <p className="leading-7 text-slate-700">
                GreenLux is positioned for families, business schedules, medical appointments, event travel,
                tourism, and repeat direct bookings. Exact arrival guidance is shared with confirmed guests.
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
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-4xl font-semibold">Ready to check availability?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Tell GreenLux your dates, guest count, and preferred unit. Management will confirm the final rate and next steps directly.
            </p>
            <div className="mt-7 flex justify-center">
              <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                WhatsApp Book Now
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
