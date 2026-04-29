import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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
import { featuredRooms } from "@/lib/site/rooms";

export default function HomePage() {
  return (
    <SiteShell>
      <main>
        <Hero />

        <section className="mx-auto -mt-8 grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {trustHighlights.map((item) => (
            <div key={item.title} className="relative rounded-lg border border-brand-sage bg-white p-5 shadow-soft">
              <item.icon className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
              <h2 className="mt-4 font-semibold text-brand-deep">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Rooms and apartments"
              title="Choose the stay that fits your visit."
              description="From budget-friendly rooms to full serviced apartments, GreenLux is built for practical comfort and clear communication."
              className="max-w-2xl"
            />
            <Button asChild variant="outline">
              <Link href="/rooms">
                View all rooms
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {featuredRooms.map((room) => (
              <RoomCard key={room.slug} room={room} featured />
            ))}
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Amenities"
              title="Everything guests expect for a calm serviced stay."
              description="Practical, family-friendly amenities with management support before and during your visit."
              align="center"
            />
            <div className="mt-8">
              <AmenityGrid />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Why stay with us"
              title="A boutique stay that feels managed, private, and easy."
              description="GreenLux is built around the real needs of families, overseas visitors, business travelers, medical guests, and longer-stay guests."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {whyStayItems.map((item) => (
                <div key={item.title} className="rounded-lg border border-brand-sage bg-white p-5 shadow-sm">
                  <item.icon className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold text-brand-deep">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-deep py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Guest review themes"
              title="Clean, calm, and responsive."
              description="The public site copy is shaped around the strengths guests consistently value: cleanliness, peace, safety, host response, and a home-like environment."
              align="center"
              className="[&_h2]:text-white [&_p]:text-white/75"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {reviewThemes.map((theme) => (
                <figure key={theme.label} className="rounded-lg border border-white/15 bg-white/10 p-6">
                  <blockquote className="text-lg leading-8 text-white/90">“{theme.quote}”</blockquote>
                  <figcaption className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">
                    {theme.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-lg border border-brand-sage bg-white p-6 shadow-soft lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Location</p>
              <h2 className="font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-4xl">
                A practical base for Rawalpindi and Islamabad visits.
              </h2>
              <p className="leading-7 text-slate-700">
                Suitable for family visits, business schedules, medical appointments, event travel, tourism, and
                longer stays where privacy and management support matter.
              </p>
              <CTAButton href={getWhatsAppHref("Hello GreenLux Residency, please share your location details.")} external whatsapp>
                Ask for location
              </CTAButton>
            </div>
            <div className="grid min-h-72 place-items-center rounded-lg bg-brand-sage/55 p-6">
              <div className="w-full max-w-md rounded-lg border border-brand-deep/10 bg-brand-ivory p-6 text-center shadow-sm">
                <MapPin className="mx-auto h-10 w-10 text-brand-fresh" aria-hidden="true" />
                <p className="mt-4 font-serif text-2xl font-semibold text-brand-deep">{siteConfig.location}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Exact directions are shared with confirmed guests for privacy and a smoother arrival.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Before you book."
              description="A quick preview of common questions guests ask before confirming a stay."
            />
            <div className="space-y-5">
              <FAQSection limit={4} />
              <Button asChild variant="outline">
                <Link href="/contact">Ask another question</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
