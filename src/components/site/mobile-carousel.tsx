"use client";

import { Children, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileCarouselProps = {
  children: ReactNode;
  className?: string;
  ariaLabel: string;
  intervalMs?: number;
};

export function MobileCarousel({ children, className, ariaLabel, intervalMs = 6500 }: MobileCarouselProps) {
  const slides = useMemo(() => Children.toArray(children), [children]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const manualPauseUntilRef = useRef(0);
  const hasMultipleSlides = slides.length > 1;
  const activeIndex = slides.length ? currentIndex % slides.length : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!hasMultipleSlides || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) {
        return;
      }

      setCurrentIndex((index) => (index + 1) % slides.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, intervalMs, prefersReducedMotion, slides.length]);

  if (!slides.length) {
    return null;
  }

  const previous = () => {
    manualPauseUntilRef.current = Date.now() + intervalMs * 1.5;
    setCurrentIndex((index) => (index - 1 + slides.length) % slides.length);
  };

  const next = () => {
    manualPauseUntilRef.current = Date.now() + intervalMs * 1.5;
    setCurrentIndex((index) => (index + 1) % slides.length);
  };

  return (
    <div
      className={cn("max-w-full overflow-x-clip [contain:paint] md:hidden", className)}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
    >
      <div
        className={cn(
          "w-full max-w-full overflow-hidden",
          prefersReducedMotion ? "transition-none" : "transition-opacity duration-500 ease-out",
        )}
      >
        {slides[activeIndex]}
      </div>

      {hasMultipleSlides ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={previous}
            className="grid h-9 w-9 place-items-center rounded-full border border-brand-deep/10 bg-white/90 text-brand-deep shadow-sm transition hover:bg-brand-ivory"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {slides.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activeIndex ? "w-5 bg-brand-gold" : "w-1.5 bg-brand-deep/20",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            className="grid h-9 w-9 place-items-center rounded-full border border-brand-deep/10 bg-white/90 text-brand-deep shadow-sm transition hover:bg-brand-ivory"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
