import { amenities } from "@/lib/site/content";
import { cn } from "@/lib/utils";

export function AmenityGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-4", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {amenities.map((amenity) => (
        <div
          key={amenity.title}
          className="rounded-2xl border border-brand-deep/10 bg-white/90 p-5 shadow-[0_18px_45px_rgba(15,61,46,0.08)]"
        >
          <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-deep text-brand-gold">
            <amenity.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-5 font-serif text-xl font-semibold text-brand-deep">{amenity.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{amenity.description}</p>
        </div>
      ))}
    </div>
  );
}
