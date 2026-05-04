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
      <Link href={`/rooms/${room.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-deep">
        <Image
          src={room.images[0]}
          alt={room.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/75 via-brand-deep/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {featured ? (
            <span className="rounded-full bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
              Featured
            </span>
          ) : null}
          <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur">
            {room.categoryLabel}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
          <div>
            <p className="font-serif text-3xl font-semibold leading-none">{room.name}</p>
            <p className="mt-2 text-sm text-white/80">{room.stayType}</p>
          </div>
          <div className="rounded-2xl bg-white/90 px-3 py-2 text-right text-brand-deep shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">From</p>
            <p className="font-semibold">Rs {formatPricePkr(room.priceFromPkr)}</p>
          </div>
        </div>
      </Link>
      <CardContent className="space-y-5 p-5">
        <p className="text-sm leading-6 text-slate-700">{room.shortDescription}</p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-brand-sage/40 p-3 text-brand-deep">
            <UsersRound className="mb-2 h-4 w-4 text-brand-fresh" aria-hidden="true" />
            Up to {room.maxGuests} guests
          </div>
          <div className="rounded-2xl bg-brand-sage/40 p-3 text-brand-deep">
            <BedDouble className="mb-2 h-4 w-4 text-brand-fresh" aria-hidden="true" />
            {room.sizeLabel ?? room.stayType}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((amenity) => (
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
          Final rate is confirmed by management for your dates.
        </p>
      </CardContent>
    </Card>
  );
}
