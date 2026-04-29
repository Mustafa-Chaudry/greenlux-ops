import type { Metadata } from "next";
import { RoomCard } from "@/components/site/room-card";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { rooms } from "@/lib/site/rooms";

export const metadata: Metadata = {
  title: "Rooms and Apartments",
  description: "Explore GreenLux Residency rooms, studios, and serviced apartments in Rawalpindi.",
};

const roomTypes = ["All stays", "Rooms", "Studios", "Apartments"];

export default function RoomsPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-deep px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-gold">Rooms and apartments</p>
            <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight sm:text-6xl">
              Comfortable serviced stays for every kind of visit.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/75">
              Economy rooms, executive rooms, deluxe rooms, studios, and full apartments with clean rooms,
              secure surroundings, and responsive management.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {roomTypes.map((type) => (
              <span key={type} className="rounded-lg border border-brand-sage bg-white px-3 py-2 text-sm font-medium text-brand-deep">
                {type}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        </section>

        <section className="bg-white/70 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Rate note"
              title="Prices start from Rs 5,500 to Rs 9,500 per night."
              description="Rates vary by dates, occupancy, length of stay, room availability, and booking source. WhatsApp is the fastest way to confirm a final rate."
            />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

