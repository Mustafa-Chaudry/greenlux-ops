import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, UsersRound } from "lucide-react";
import { AmenityGrid } from "@/components/site/amenity-grid";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { getWhatsAppHref } from "@/lib/site/config";
import { formatPricePkr, getRoomBySlug, rooms } from "@/lib/site/rooms";

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

  const whatsappMessage = `Hello GreenLux Residency, I would like to check availability for ${room.name}.`;

  return (
    <SiteShell>
      <main>
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Button asChild variant="ghost">
            <Link href="/rooms">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to rooms
            </Link>
          </Button>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-brand-sage shadow-soft">
                <Image
                  src={room.imageUrl}
                  alt={room.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-brand-sage bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-fresh">Common areas</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Rooftop/outdoor sitting and lounge spaces are available depending on stay type and house rules.
                  </p>
                </div>
                <div className="rounded-lg border border-brand-sage bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-fresh">Verification</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    ID verification is required for a secure, family-friendly check-in experience.
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-lg border border-brand-sage bg-white p-6 shadow-soft" id="book">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">Room detail</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-brand-deep sm:text-5xl">
                {room.name}
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-700">{room.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-brand-sage/55 p-4">
                  <p className="text-xs uppercase text-slate-600">From</p>
                  <p className="mt-1 text-xl font-semibold text-brand-deep">Rs {formatPricePkr(room.priceFromPkr)}</p>
                </div>
                <div className="rounded-lg bg-brand-sage/55 p-4">
                  <p className="text-xs uppercase text-slate-600">Guests</p>
                  <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-brand-deep">
                    <UsersRound className="h-5 w-5" aria-hidden="true" />
                    {room.maxGuests}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <CTAButton href={getWhatsAppHref(whatsappMessage)} external whatsapp className="w-full">
                  Check availability
                </CTAButton>
                <CTAButton href="/auth/sign-in" variant="outline" showArrow className="w-full">
                  Guest Check-In
                </CTAButton>
              </div>

              <p className="mt-5 text-xs leading-5 text-slate-500">
                Final price is confirmed by management based on dates, guest count, room availability, and length of stay.
              </p>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeading
            eyebrow="Best for"
            title={`${room.name} suits practical, peaceful stays.`}
            description="Each room type is positioned for guests who value cleanliness, privacy, secure surroundings, and clear communication."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {room.suitableFor.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-brand-sage bg-white p-4">
                <CheckCircle2 className="h-5 w-5 flex-none text-brand-fresh" aria-hidden="true" />
                <span className="font-medium text-brand-deep">{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/70 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Amenities"
              title="Included and available amenities"
              description="Exact amenity availability can vary by room type. Management confirms details before booking."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <span key={amenity} className="rounded-lg bg-brand-deep px-3 py-2 text-sm font-medium text-white">
                  {amenity}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <AmenityGrid compact />
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

