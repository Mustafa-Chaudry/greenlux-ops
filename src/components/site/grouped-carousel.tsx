"use client";

import { Children, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type GroupedCarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  itemsPerPage: number;
  className?: string;
  gridClassName?: string;
  intervalMs?: number;
};

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function GroupedCarousel({
  children,
  ariaLabel,
  itemsPerPage,
  className,
  gridClassName,
  intervalMs = 7200,
}: GroupedCarouselProps) {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const groups = useMemo(() => chunkItems(slides, Math.max(1, itemsPerPage)), [itemsPerPage, slides]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const manualPauseUntilRef = useRef(0);
  const hasMultipleGroups = groups.length > 1;
  const activeIndex = groups.length ? currentIndex % groups.length : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultipleGroups || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) {
        return;
      }

      setCurrentIndex((index) => (index + 1) % groups.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [groups.length, hasMultipleGroups, intervalMs, prefersReducedMotion]);

  if (!groups.length) {
    return null;
  }

  const previous = () => {
    manualPauseUntilRef.current = Date.now() + intervalMs * 1.5;
    setCurrentIndex((index) => (index - 1 + groups.length) % groups.length);
  };

  const next = () => {
    manualPauseUntilRef.current = Date.now() + intervalMs * 1.5;
    setCurrentIndex((index) => (index + 1) % groups.length);
  };

  return (
    <div className={cn("max-w-full overflow-x-clip [contain:paint]", className)} aria-label={ariaLabel} aria-roledescription="carousel">
      <div className={cn(prefersReducedMotion ? "transition-none" : "transition-opacity duration-500 ease-out")}>
        <div className={cn("grid gap-5", gridClassName)}>{groups[activeIndex]}</div>
      </div>

      {hasMultipleGroups ? (
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={previous}
            className="grid h-9 w-9 place-items-center rounded-full border border-brand-deep/10 bg-white/90 text-brand-deep shadow-sm transition hover:bg-brand-ivory"
            aria-label="Previous group"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {groups.map((_, index) => (
              <span
                key={index}
                className={cn("h-1.5 rounded-full transition-all", index === activeIndex ? "w-5 bg-brand-gold" : "w-1.5 bg-brand-deep/20")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="grid h-9 w-9 place-items-center rounded-full border border-brand-deep/10 bg-white/90 text-brand-deep shadow-sm transition hover:bg-brand-ivory"
            aria-label="Next group"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
