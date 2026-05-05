import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, BedDouble, CheckCircle2, MessageCircle, Play, ShieldCheck, UsersRound } from "lucide-react";
import { AmenityGrid } from "@/components/site/amenity-grid";
import { CTAButton } from "@/components/site/cta-button";
import { RatingCards } from "@/components/site/rating-cards";
import { RoomCard } from "@/components/site/room-card";
import { RoomGallery } from "@/components/site/room-gallery";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { VideoCard } from "@/components/site/video-card";
import { Button } from "@/components/ui/button";
import { getRoomWhatsAppHref, siteConfig } from "@/lib/site/config";
import { formatPricePkr, getRelatedRooms, getRoomBySlug, rooms } from "@/lib/site/rooms";
import { getRoomRating } from "@/lib/site/trust";
import { getVideoBySlug } from "@/lib/site/videos";

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
  const roomVideo = getVideoBySlug(room.videoTourSlug);
  const roomRating = getRoomRating(room.slug);
  const guestAccess =
    room.stayType === "Full apartment"
      ? ["Private apartment space", "Kitchen and lounge where listed", "Terrace or shared outdoor access where listed"]
      : room.stayType === "Studio apartment"
        ? ["Private studio space", "Kitchen basics where listed", "Terrace or shared outdoor access where listed"]
        : ["Private room", "Shared lounge or terrace access where listed", "Direct GreenLux support on WhatsApp"];

  return (
    <SiteShell>
      <main>
        <section className="bg-gradient-to-b from-brand-ivory via-white to-brand-ivory px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Button asChild variant="ghost" className="rounded-full text-brand-deep hover:bg-brand-sage/50">
              <Link href="/rooms">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to rooms
              </Link>
            </Button>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">{room.categoryLabel}</p>
                <h1 className="mt-4 font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                  {room.name}
                </h1>
                <p className="mt-4 max-w-3xl text-xl font-semibold leading-8 text-brand-fresh">{room.hook}</p>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{room.shortDescription}</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-deep/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm">
                    <UsersRound className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                    Up to {room.maxGuests} guests
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-deep/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm">
                    <BedDouble className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                    {room.stayType}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-deep/10 bg-white px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm">
                    <BadgeCheck className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                    {room.decisionLabel}
                  </span>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <CTAButton href={getRoomWhatsAppHref(room.name)} external whatsapp>
                    Check availability on WhatsApp
                  </CTAButton>
                  {roomVideo ? (
                    <CTAButton href="#video-tour" variant="outline">
                      <Play className="h-4 w-4" aria-hidden="true" />
                      Watch room tour
                    </CTAButton>
                  ) : null}
                  <CTAButton href="/rooms" variant="outline" showArrow>
                    View rooms
                  </CTAButton>
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-soft">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">From</p>
                <p className="mt-1 font-serif text-4xl font-semibold text-brand-deep">Rs {formatPricePkr(room.priceFromPkr)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">per night. Send your dates for the live rate and availability.</p>
                <div className="mt-5 space-y-3 border-t border-brand-deep/10 pt-5 text-sm text-slate-700">
                  {room.highlights.map((item) => (
                    <p key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RoomGallery images={room.images} captions={room.galleryLabels} alt={room.imageAlt} priority />
        </section>

        {roomVideo ? (
          <section id="video-tour" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 rounded-[1.75rem] border border-brand-deep/10 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <SectionHeading
                eyebrow="Room video"
                title={`Watch a quick tour of ${room.name}.`}
                description="Use the video as a practical preview of the space before you message us for availability."
              />
              <VideoCard video={roomVideo} />
            </div>
          </section>
        ) : null}

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div className="space-y-10">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Why choose this stay?"
                title={`Why guests choose ${room.name}.`}
                description={room.description}
              />
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {room.whyChoose.map((item) => (
                  <div key={item} className="rounded-2xl bg-brand-sage/35 p-5 text-sm font-semibold leading-6 text-brand-deep">
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

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="font-serif text-3xl font-semibold text-brand-deep">Guest access</h2>
                <div className="mt-5 space-y-3">
                  {guestAccess.map((item) => (
                    <p key={item} className="flex gap-3 text-sm font-medium leading-6 text-brand-deep">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-brand-deep/10 bg-brand-ivory p-6 shadow-sm sm:p-8">
                <h2 className="font-serif text-3xl font-semibold text-brand-deep">Good to know</h2>
                <div className="mt-5 space-y-3 text-sm font-medium leading-6 text-brand-deep">
                  <p>Rates and availability are confirmed directly on WhatsApp for your dates.</p>
                  <p>Amenities can vary by room, so ask us if one detail matters for your trip.</p>
                  <p>Already-booked guests can complete online check-in before arrival.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Amenities"
                title="What matters most for this stay"
                description="Key comforts are shown first. Ask on WhatsApp if one detail matters for your trip."
              />
              <div className="mt-6 flex flex-wrap gap-2">
                {room.amenities.slice(0, 9).map((amenity) => (
                  <span key={amenity} className="rounded-full bg-brand-ivory px-3 py-2 text-sm font-semibold text-brand-deep">
                    {amenity}
                  </span>
                ))}
              </div>
              <div className="mt-8">
                <AmenityGrid compact limit={6} />
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start" id="book">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Direct booking</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-deep">{room.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{room.hook}</p>
              {roomRating ? (
                <div className="mt-5">
                  <RatingCards ratings={[roomRating]} compact />
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    {roomRating.roomSlug
                      ? "Room-specific public listing snapshot where the listing clearly maps to this stay."
                      : "Property-level public listing snapshot. Ratings vary by platform and listing."}
                  </p>
                </div>
              ) : null}
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
              <div className="mt-5 space-y-3 rounded-2xl bg-brand-sage/35 p-4 text-sm font-medium text-brand-deep">
                <p className="flex gap-2">
                  <MessageCircle className="mt-0.5 h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                  Availability is confirmed on WhatsApp.
                </p>
                <p className="flex gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                  Ask questions before you confirm.
                </p>
                <p className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                  Online check-in is available after booking.
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <CTAButton href={getRoomWhatsAppHref(room.name)} external whatsapp className="w-full">
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow className="w-full">
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
              <p className="mt-5 text-xs leading-5 text-slate-500">
                We confirm the stay, live rate, and arrival details with you directly before you travel.
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
