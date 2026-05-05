import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlatformRating } from "@/lib/site/trust";

type RatingCardsProps = {
  ratings: PlatformRating[];
  compact?: boolean;
  className?: string;
};

export function RatingCards({ ratings, compact = false, className }: RatingCardsProps) {
  return (
    <div className={cn("grid gap-4", compact ? "sm:grid-cols-2" : "md:grid-cols-4", className)}>
      {ratings.map((rating) => (
        <div key={rating.id} className="rounded-[1.25rem] border border-brand-deep/10 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{rating.sourceLabel}</p>
            <Star className="h-4 w-4 fill-brand-gold text-brand-gold" aria-hidden="true" />
          </div>
          <div className="mt-4 flex items-end gap-1 text-brand-deep">
            <span className="font-serif text-4xl font-semibold leading-none">{rating.score}</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">{rating.scale}</span>
          </div>
          <p className="mt-3 font-serif text-xl font-semibold text-brand-deep">{rating.label}</p>
          <p className="mt-1 text-sm font-semibold text-brand-fresh">{rating.reviewCount}</p>
          <p className="mt-2 text-xs leading-5 text-slate-600">{rating.context}</p>
        </div>
      ))}
    </div>
  );
}
