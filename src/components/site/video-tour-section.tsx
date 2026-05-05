import { VideoCard } from "@/components/site/video-card";
import { SectionHeading } from "@/components/site/section-heading";
import type { SiteVideo } from "@/lib/site/videos";

type VideoTourSectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  videos: SiteVideo[];
  className?: string;
};

export function VideoTourSection({ eyebrow = "Video tour", title, description, videos, className }: VideoTourSectionProps) {
  const [primaryVideo, ...secondaryVideos] = videos;

  if (!primaryVideo) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          <p className="rounded-2xl bg-brand-ivory p-5 text-sm leading-6 text-slate-700">
            Videos open with controls and stay muted by default. They are here to help you see the space before you
            message your dates.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <VideoCard video={primaryVideo} featured />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryVideos.slice(0, 2).map((video) => (
              <VideoCard key={video.slug} video={video} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
