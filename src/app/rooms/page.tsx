import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { formatPricePkr, roomTypeLabels, rooms, type RoomType } from "@/lib/site/rooms";
import { roomItemListJsonLd } from "@/lib/site/seo";

export const metadata: Metadata = {
  title: "Rooms and Apartments in Rawalpindi",
  description: "Explore GreenLux Residency rooms, studios, and serviced apartments in Rawalpindi.",
  alternates: {
    canonical: "/rooms",
  },
  openGraph: {
    title: "Rooms and Apartments at GreenLux Residency",
    description: "Compare GreenLux private rooms, studios, and serviced apartments in Westridge 1, Rawalpindi.",
    url: "/rooms",
    images: [
      {
        url: "/greenlux/curation-review/rooms-page/03__rooms-page-image__booking-lounge-01__booking-lounge-01.jpg",
        width: 1200,
        height: 800,
        alt: "GreenLux Residency shared lounge seating",
      },
    ],
  },
};

const roomTypes: Array<{ label: string; type?: RoomType; description?: string }> = [
  { label: "All stays" },
  {
    label: roomTypeLabels.club_class,
    type: "club_class",
    description: "Studios for guests who want more independence, kitchen basics, and a calmer longer-stay rhythm.",
  },
  {
    label: roomTypeLabels.deluxe,
    type: "deluxe",
    description: "Polished private rooms for couples, work trips, repeat guests, and short Rawalpindi stays.",
  },
  {
    label: roomTypeLabels.executive,
    type: "executive",
    description: "Practical private rooms with strong value for solo guests, business travel, and simple overnight stays.",
  },
  {
    label: roomTypeLabels.economy,
    type: "economy",
    description: "Lower-cost private options when the priority is a clean, managed base and sensible nightly rate.",
  },
  {
    label: roomTypeLabels.apartment,
    type: "apartment",
    description: "Full apartment-style stays for families, luggage, longer visits, and guests who need more space.",
  },
];

const decisionGuide = [
  { label: "Exceptional value", room: rooms.find((room) => room.slug === "budget-room-11") },
  { label: "Best for family", room: rooms.find((room) => room.slug === "apartment-3") },
  { label: "Most private", room: rooms.find((room) => room.slug === "studio-1") },
  { label: "Executive value", room: rooms.find((room) => room.slug === "room-10") },
];

const roomCardImages: Record<string, string> = {
  "studio-1": "/greenlux/curation-review/rooms-page/04__room-card__Studio-1__studio-1-main-updated.png",
  "studio-2": "/greenlux/curation-review/rooms-page/05__room-card__Studio-2__studio-2-main-updated.jpg",
  "apartment-3": "/greenlux/curation-review/rooms-page/06__room-card__Apartment-3__apartment-3-bed-changed.jpg",
  "apartment-4": "/greenlux/curation-review/rooms-page/07__room-card__Apartment-4__apartment-4-1.jpg",
  "room-5": "/greenlux/curation-review/rooms-page/08__room-card__Room-5__room-5-1.jpg",
  "room-7": "/greenlux/curation-review/rooms-page/09__room-card__Room-7__room-7-1.jpg",
  "room-6": "/greenlux/curation-review/rooms-page/10__room-card__Room-6__room-6-1.jpg",
  "room-10": "/greenlux/curation-review/rooms-page/11__room-card__Room-10__room-10-1.jpg",
  "room-9": "/greenlux/curation-review/rooms-page/12__room-card__Room-9__room-9-1.jpg",
  "budget-room-11": "/greenlux/curation-review/rooms-page/13__room-card__Budget-Room-11__budget-room-11-1.jpg",
};

export default function RoomsPage() {
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(roomItemListJsonLd) }} />
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
                src="/greenlux/curation-review/rooms-page/03__rooms-page-image__booking-lounge-01__booking-lounge-01.jpg"
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
              <RoomCard key={room.slug} room={room} imageSrc={roomCardImages[room.slug]} />
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Which stay fits?"
              title="A quick way to decide."
              description="Use this section to narrow the room type, then message GreenLux with dates, guest count, arrival time, and anything that matters for your stay."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {roomTypes.slice(1).map((type) => {
                const count = type.type === "economy" ? 3 : rooms.filter((room) => room.type === type.type).length;

                return (
                  <div key={type.label} id={type.type} className="rounded-2xl border border-brand-deep/10 bg-brand-ivory p-5">
                    <p className="font-serif text-xl font-semibold text-brand-deep">{type.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {count} stay{count === 1 ? "" : "s"}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{type.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </main>
    </SiteShell>
  );
}
