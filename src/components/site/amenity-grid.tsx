import { amenities } from "@/lib/site/content";
import { cn } from "@/lib/utils";

export function AmenityGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-4", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {amenities.map((amenity) => (
        <div key={amenity.title} className="rounded-lg border border-brand-sage bg-white p-5 shadow-sm">
          <amenity.icon className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
          <h3 className="mt-4 font-semibold text-brand-deep">{amenity.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{amenity.description}</p>
        </div>
      ))}
    </div>
  );
}

