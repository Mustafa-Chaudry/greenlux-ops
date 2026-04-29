import Image from "next/image";
import Link from "next/link";
import { BedDouble, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPricePkr, type PublicRoom } from "@/lib/site/rooms";

type RoomCardProps = {
  room: PublicRoom;
  featured?: boolean;
};

export function RoomCard({ room, featured = false }: RoomCardProps) {
  return (
    <Card className="group overflow-hidden border-brand-sage bg-white shadow-sm transition-shadow hover:shadow-soft">
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-sage/45">
        <Image
          src={room.imageUrl}
          alt={room.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/55 to-transparent" />
        {featured ? (
          <span className="absolute left-4 top-4 rounded-lg bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
            Featured
          </span>
        ) : null}
      </Link>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link href={`/rooms/${room.slug}`} className="font-serif text-2xl font-semibold text-brand-deep">
                {room.name}
              </Link>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <UsersRound className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
                Up to {room.maxGuests} guests
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-500">From</p>
              <p className="font-semibold text-brand-deep">Rs {formatPricePkr(room.priceFromPkr)}</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-700">{room.shortDescription}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="rounded-lg bg-brand-sage/55 px-2.5 py-1 text-xs font-medium text-brand-deep">
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <CTAButton href={`/rooms/${room.slug}`} variant="outline" size="default" showArrow className="flex-1">
            Details
          </CTAButton>
          <CTAButton
            href={`/rooms/${room.slug}#book`}
            variant="default"
            size="default"
            className="flex-1"
          >
            Book
          </CTAButton>
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-500">
          <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
          Final rate depends on dates, guests, and length of stay.
        </p>
      </CardContent>
    </Card>
  );
}

