"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteVideo } from "@/lib/site/videos";

type VideoModalProps = {
  video: SiteVideo;
  open: boolean;
  onClose: () => void;
};

export function VideoModal({ video, open, onClose }: VideoModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-brand-deep/95 p-3 text-white sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`${video.title} video tour`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/85">{video.title}</p>
          <p className="text-xs text-white/55">{video.durationLabel}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onClose}
          className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/20"
          aria-label="Close video"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 place-items-center overflow-hidden rounded-[1.25rem] bg-black/40">
        <video
          src={video.src}
          poster={video.poster}
          controls
          muted
          playsInline
          preload="metadata"
          className="max-h-full max-w-full rounded-[1.25rem]"
        >
          <track kind="captions" />
        </video>
      </div>
    </div>
  );
}
