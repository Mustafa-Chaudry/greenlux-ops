"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RoomGalleryProps = {
  images: string[];
  alt: string;
  captions?: string[];
  priority?: boolean;
};

export function RoomGallery({ images, alt, captions = [], priority = false }: RoomGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const selectedImage = images[activeIndex] ?? images[0];
  const photoCount = images.length;
  const activeCaption = captions[activeIndex] ?? "Room photo";

  const photoLabel = useMemo(() => `${activeIndex + 1} / ${photoCount}`, [activeIndex, photoCount]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => (current === 0 ? photoCount - 1 : current - 1));
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => (current === photoCount - 1 ? 0 : current + 1));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, photoCount]);

  if (!selectedImage) {
    return null;
  }

  const showPreviousPhoto = () => {
    setActiveIndex((current) => (current === 0 ? photoCount - 1 : current - 1));
  };

  const showNextPhoto = () => {
    setActiveIndex((current) => (current === photoCount - 1 ? 0 : current + 1));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-brand-deep/10 bg-white shadow-[0_28px_80px_rgba(15,61,46,0.12)]">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="group relative block aspect-[4/3] w-full bg-[#f7f1e6] text-left lg:aspect-[16/9]"
          aria-label={`Open photo gallery for ${alt}`}
        >
          <Image
            src={selectedImage}
            alt={`${alt} photo ${activeIndex + 1}`}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 1180px, 100vw"
            className="object-contain transition duration-300 group-hover:scale-[1.01]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm">
            {activeCaption}
          </span>
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-brand-deep shadow-sm">
            <Images className="h-4 w-4 text-brand-fresh" aria-hidden="true" />
            Click image to enlarge
          </span>
          <span className="absolute bottom-4 right-4 rounded-full bg-brand-deep/85 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            {photoLabel}
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">View all photos. Tap a thumbnail to preview it, or open the full gallery.</p>
        <Button
          type="button"
          variant="outline"
          className="hidden rounded-full sm:inline-flex"
          onClick={() => setLightboxOpen(true)}
        >
          View all photos
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {images.map((image, index) => {
          const active = index === activeIndex;

          return (
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${alt} photo ${index + 1}`}
              aria-pressed={active}
              key={`${image}-${index}`}
              className={`group relative aspect-[4/3] overflow-hidden rounded-2xl border bg-[#f7f1e6] transition ${
                active
                  ? "border-brand-gold shadow-[0_12px_30px_rgba(201,162,39,0.24)]"
                  : "border-brand-deep/10 hover:border-brand-gold/70"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 14vw, (min-width: 640px) 22vw, 32vw"
                className="object-contain"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-deep/75 to-transparent px-2 pb-2 pt-8 text-left text-[11px] font-semibold text-white opacity-95">
                {captions[index] ?? `Photo ${index + 1}`}
              </span>
            </button>
          );
        })}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-brand-deep/95 p-3 text-white sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo gallery`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white/80">{activeCaption}</p>
              <p className="text-xs text-white/55">{photoLabel}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setLightboxOpen(false)}
              className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.25rem] bg-black/35">
            <Image
              src={selectedImage}
              alt={`${alt} enlarged photo ${activeIndex + 1}: ${activeCaption}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
            {photoCount > 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={showPreviousPhoto}
                  className="absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/25 bg-white/15 text-white hover:bg-white/25"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={showNextPhoto}
                  className="absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full border-white/25 bg-white/15 text-white hover:bg-white/25"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </Button>
              </>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Open enlarged ${alt} photo ${index + 1}`}
                aria-pressed={index === activeIndex}
                key={`${image}-modal-${index}`}
                className={`relative h-20 w-28 flex-none overflow-hidden rounded-xl border bg-brand-ivory ${
                  index === activeIndex ? "border-brand-gold" : "border-white/20"
                }`}
              >
                <Image
                  src={image}
                  alt={`${alt} modal thumbnail ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
                <span className="sr-only">{captions[index] ?? `Photo ${index + 1}`}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
