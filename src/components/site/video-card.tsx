"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteVideo } from "@/lib/site/videos";
import { VideoModal } from "@/components/site/video-modal";

type VideoCardProps = {
  video: SiteVideo;
  featured?: boolean;
  label?: string;
};

export function VideoCard({ video, featured = false, label = "Video tour" }: VideoCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative block w-full overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-soft",
          featured && "lg:min-h-[520px]",
        )}
        aria-label={`Play ${video.title}`}
      >
        <span className={cn("relative block bg-[#f7f1e6]", featured ? "aspect-[4/5] lg:aspect-auto lg:h-full" : "aspect-[4/3]")}>
          <Image
            src={video.poster}
            alt={`${video.title} poster`}
            fill
            sizes={featured ? "(min-width: 1024px) 45vw, 100vw" : "(min-width: 1024px) 24vw, 100vw"}
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-brand-deep/75 via-brand-deep/15 to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep shadow-sm">
            {video.durationLabel}
          </span>
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-gold text-brand-deep shadow-soft transition group-hover:scale-105">
              <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute inset-x-0 bottom-0 p-5 text-white">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-gold">
              <Video className="h-4 w-4" aria-hidden="true" />
              {label}
            </span>
            <span className="mt-2 block font-serif text-2xl font-semibold leading-tight">{video.title}</span>
            <span className="mt-2 block text-sm leading-6 text-white/78">{video.description}</span>
          </span>
        </span>
      </button>
      <VideoModal video={video} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
