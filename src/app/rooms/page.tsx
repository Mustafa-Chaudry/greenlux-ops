import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { roomTypeLabels, rooms, type RoomType } from "@/lib/site/rooms";

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

export default function RoomsPage() {
  return (
    <SiteShell>
      <main>
        <section className="relative overflow-hidden bg-[#05281f] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.24),transparent_34rem)]" />
          <div className="relative mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Rooms and apartments</p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl">
              Real GreenLux units, clear prices, one-click WhatsApp booking.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Browse named studios, apartments, deluxe rooms, executive rooms, and budget options from the current
              GreenLux public inventory.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                WhatsApp Book Now
              </CTAButton>
              <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                Complete online check-in
              </CTAButton>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
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

          <div id="all-stays" className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </section>

        <section className="bg-white/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Inventory guide"
              title="Rooms, studios, and full apartments are intentionally separated."
              description="Private rooms are best for short stays and business trips. Studios add kitchen-style independence. Full apartments suit families, longer stays, and guests who need separate lounge or dining space."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {roomTypes.slice(1).map((type) => (
                <div key={type.label} id={type.type} className="rounded-2xl border border-brand-deep/10 bg-white p-5 shadow-sm">
                  <p className="font-serif text-xl font-semibold text-brand-deep">{type.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {rooms.filter((room) => room.type === type.type).length} visible unit
                    {rooms.filter((room) => room.type === type.type).length === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] bg-[#05281f] p-8 text-center text-white shadow-soft sm:p-12">
            <MessageCircle className="mx-auto h-10 w-10 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-5 font-serif text-4xl font-semibold">Need help choosing a unit?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/70">
              Send your dates, guest count, budget, and whether you prefer a room, studio, or apartment. GreenLux will
              confirm the best available option.
            </p>
            <div className="mt-7 flex justify-center">
              <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
                Ask GreenLux on WhatsApp
              </CTAButton>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
