import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, UsersRound } from "lucide-react";
import { AmenityGrid } from "@/components/site/amenity-grid";
import { CTAButton } from "@/components/site/cta-button";
import { RoomCard } from "@/components/site/room-card";
import { RoomGallery } from "@/components/site/room-gallery";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { getRoomWhatsAppHref, siteConfig } from "@/lib/site/config";
import { formatPricePkr, getRelatedRooms, getRoomBySlug, rooms } from "@/lib/site/rooms";

type RoomDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: RoomDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    return {
      title: "Room Not Found",
    };
  }

  return {
    title: room.name,
    description: room.shortDescription,
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);

  if (!room) {
    notFound();
  }

  const relatedRooms = getRelatedRooms(room);

  return (
    <SiteShell>
      <main>
        <section className="bg-[#05281f] px-4 py-8 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10">
              <Link href="/rooms">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to rooms
              </Link>
            </Button>
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.78fr_0.22fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">{room.categoryLabel}</p>
                <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl">{room.name}</h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/75">{room.shortDescription}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">From</p>
                <p className="mt-1 font-serif text-4xl font-semibold">Rs {formatPricePkr(room.priceFromPkr)}</p>
                <p className="mt-2 text-sm text-white/70">per night. Ask for your date-specific rate.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RoomGallery images={room.images} alt={room.imageAlt} priority />
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="space-y-10">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="About this stay"
                title={`${room.name} at GreenLux Residency`}
                description={room.description}
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {room.highlights.map((item) => (
                  <div key={item} className="rounded-2xl bg-brand-sage/40 p-4 text-sm font-semibold text-brand-deep">
                    <CheckCircle2 className="mb-2 h-5 w-5 text-brand-fresh" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionHeading
                eyebrow="Suitable for"
                title="Best for these trips."
                description="Use this as a quick guide before you message us with your dates."
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {room.suitableFor.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-brand-deep/10 bg-white p-4">
                    <CheckCircle2 className="h-5 w-5 flex-none text-brand-fresh" aria-hidden="true" />
                    <span className="font-medium text-brand-deep">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Amenities"
                title="Comforts included with this stay"
                description="Amenities vary by room. Ask on WhatsApp if one detail matters for your trip."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {room.amenities.map((amenity) => (
                  <span key={amenity} className="rounded-full bg-brand-deep px-3 py-2 text-sm font-medium text-white">
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <AmenityGrid compact />
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" id="book">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Book this stay</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-deep">{room.name}</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-brand-ivory p-4">
                  <p className="text-xs uppercase text-slate-600">From</p>
                  <p className="mt-1 text-xl font-semibold text-brand-deep">Rs {formatPricePkr(room.priceFromPkr)}</p>
                </div>
                <div className="rounded-2xl bg-brand-ivory p-4">
                  <p className="text-xs uppercase text-slate-600">Guests</p>
                  <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-brand-deep">
                    <UsersRound className="h-5 w-5" aria-hidden="true" />
                    {room.maxGuests}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <CTAButton href={getRoomWhatsAppHref(room.name)} external whatsapp className="w-full">
                  WhatsApp Book Now
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow className="w-full">
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
              <p className="mt-5 text-xs leading-5 text-slate-500">
                Message on WhatsApp for live availability, your rate, and arrival details.
              </p>
            </div>
          </aside>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Related stays"
              title="Compare similar GreenLux options."
              description="If this stay is unavailable, these nearby choices may fit your dates."
            />
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {relatedRooms.map((relatedRoom) => (
                <RoomCard key={relatedRoom.slug} room={relatedRoom} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
