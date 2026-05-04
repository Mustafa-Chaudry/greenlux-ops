import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { formatPricePkr, roomTypeLabels, rooms, type RoomType } from "@/lib/site/rooms";

export const metadata: Metadata = {
  title: "Rooms and Apartments",
  description: "Explore GreenLux Residency rooms, studios, and serviced apartments in Rawalpindi.",
};

const roomTypes: Array<{ label: string; type?: RoomType }> = [
  { label: "All stays" },
  { label: roomTypeLabels.club_class, type: "club_class" },
  { label: roomTypeLabels.deluxe, type: "deluxe" },
  { label: roomTypeLabels.executive, type: "executive" },
  { label: roomTypeLabels.economy, type: "economy" },
  { label: roomTypeLabels.apartment, type: "apartment" },
];

const decisionGuide = [
  { label: "Cheapest", room: rooms.find((room) => room.slug === "budget-room-11") },
  { label: "Best for family", room: rooms.find((room) => room.slug === "apartment-3") },
  { label: "Most private", room: rooms.find((room) => room.slug === "studio-1") },
  { label: "Executive value", room: rooms.find((room) => room.slug === "room-10") },
];

export default function RoomsPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Rooms and apartments</p>
              <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                Choose the stay that fits your trip.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
                Compare private rooms, studios, and apartments by price, space, and guest capacity. Message us when one
                feels right for your dates.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/booking/booking-lounge-01.jpg"
                alt="GreenLux Residency shared lounge seating"
                fill
                priority
                sizes="(min-width: 1024px) 48vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-[1.5rem] border border-brand-deep/10 bg-white p-5 shadow-sm md:grid-cols-4">
            {decisionGuide.map(({ label, room }) =>
              room ? (
                <Link key={label} href={`/rooms/${room.slug}`} className="rounded-2xl bg-brand-ivory p-4 transition hover:bg-brand-sage/55">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">{label}</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-brand-deep">{room.name}</p>
                  <p className="mt-2 text-sm font-semibold text-brand-fresh">{room.decisionLabel}</p>
                  <p className="mt-3 text-sm text-slate-600">
                    From Rs {formatPricePkr(room.priceFromPkr)} - up to {room.maxGuests} guests
                  </p>
                </Link>
              ) : null,
            )}
          </div>

          <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
            {roomTypes.map((type) => (
              <a
                key={type.label}
                href={type.type ? `#${type.type}` : "#all-stays"}
                className="whitespace-nowrap rounded-full border border-brand-deep/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm hover:bg-brand-sage/50"
              >
                {type.label}
              </a>
            ))}
          </div>

          <div id="all-stays" className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Which stay fits?"
              title="A quick way to decide."
              description="Private rooms suit short stays and work trips. Studios add kitchenette-style independence. Full apartments give families more room to settle."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {roomTypes.slice(1).map((type) => {
                const count = rooms.filter((room) => room.type === type.type).length;

                return (
                  <div key={type.label} id={type.type} className="rounded-2xl border border-brand-deep/10 bg-brand-ivory p-5">
                    <p className="font-serif text-xl font-semibold text-brand-deep">{type.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {count} stay{count === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-4xl font-semibold">Not sure which one to choose?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Send your dates, guest count, and budget. We will suggest the best available GreenLux stay.
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
