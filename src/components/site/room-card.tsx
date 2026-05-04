import Image from "next/image";
import Link from "next/link";
import { BedDouble, MessageCircle, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPricePkr, type PublicRoom } from "@/lib/site/rooms";
import { getRoomWhatsAppHref } from "@/lib/site/config";

type RoomCardProps = {
  room: PublicRoom;
  featured?: boolean;
};

export function RoomCard({ room, featured = false }: RoomCardProps) {
  return (
    <Card className="group overflow-hidden rounded-[1.5rem] border-brand-deep/10 bg-white shadow-[0_22px_60px_rgba(15,61,46,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(15,61,46,0.16)]">
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-ivory">
        <Image
          src={room.images[0]}
          alt={room.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-2 transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {featured ? (
            <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
              Featured
            </span>
          ) : null}
          <span className="rounded-full border border-brand-deep/10 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep shadow-sm">
            {room.categoryLabel}
          </span>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-brand-deep/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
          View photos
        </span>
      </Link>
      <CardContent className="space-y-4 p-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-none text-brand-deep">{room.name}</h2>
            <p className="mt-2 text-sm font-semibold leading-5 text-brand-fresh">{room.hook}</p>
          </div>
          <div className="shrink-0 rounded-2xl bg-brand-ivory px-4 py-3 text-right text-brand-deep shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">From</p>
            <p className="text-xl font-bold leading-none">Rs {formatPricePkr(room.priceFromPkr)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-deep">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/45 px-3 py-1.5">
            <UsersRound className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
            Up to {room.maxGuests} guests
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/45 px-3 py-1.5">
            <BedDouble className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
            {room.sizeLabel ?? room.stayType}
          </span>
        </div>

        <p className="text-sm leading-6 text-slate-700">{room.shortDescription}</p>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full bg-brand-ivory px-3 py-1 text-xs font-medium text-brand-deep">
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <CTAButton href={`/rooms/${room.slug}`} variant="outline" size="default" showArrow className="flex-1">
            View details
          </CTAButton>
          <CTAButton
            href={getRoomWhatsAppHref(room.name)}
            external
            whatsapp
            variant="default"
            size="default"
            className="flex-1"
          >
            WhatsApp
          </CTAButton>
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-500">
          <MessageCircle className="h-3.5 w-3.5 text-brand-fresh" aria-hidden="true" />
          Ask for the live rate for your dates.
        </p>
      </CardContent>
    </Card>
  );
}
