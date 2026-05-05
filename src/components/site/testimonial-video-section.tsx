import { VideoCard } from "@/components/site/video-card";
import { SectionHeading } from "@/components/site/section-heading";
import type { VideoTestimonial } from "@/lib/site/testimonials";

type TestimonialVideoSectionProps = {
  testimonials: VideoTestimonial[];
  className?: string;
};

export function TestimonialVideoSection({ testimonials, className }: TestimonialVideoSectionProps) {
  if (!testimonials.length) {
    return null;
  }

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Video testimonials"
          title="Real guests, real stays at GreenLux"
          description="Short video notes from international and overseas guests who stayed here."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.slug} className="space-y-3">
              <VideoCard video={testimonial} label="Guest video" />
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-ivory px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
                    {testimonial.guestType}
                  </span>
                  <span className="rounded-full bg-brand-sage/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
                    {testimonial.stayContext}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{testimonial.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
