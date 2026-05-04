import { amenities } from "@/lib/site/content";
import { cn } from "@/lib/utils";

export function AmenityGrid({ compact = false, limit }: { compact?: boolean; limit?: number }) {
  const visibleAmenities = typeof limit === "number" ? amenities.slice(0, limit) : amenities;

  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {visibleAmenities.map((amenity) => (
        <div
          key={amenity.title}
          className={cn(
            "rounded-2xl border border-brand-deep/10 bg-white/90 shadow-[0_18px_45px_rgba(15,61,46,0.08)]",
            compact ? "flex items-start gap-3 p-4" : "p-5",
          )}
        >
          <div className="grid h-11 w-11 flex-none place-items-center rounded-full bg-brand-deep text-brand-gold">
            <amenity.icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className={cn("font-serif font-semibold text-brand-deep", compact ? "text-lg" : "mt-5 text-xl")}>
              {amenity.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{amenity.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
