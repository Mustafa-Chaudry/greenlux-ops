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
          title="Guests from around the world choose GreenLux."
          description="These approved guest videos are shared as trust signals only. No names or quotes are added without a verified transcript."
          align="center"
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.slug} className="space-y-3">
              <VideoCard video={testimonial} label="Guest video" />
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{testimonial.guestType}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{testimonial.caption}</p>
                <p className="mt-2 text-xs font-semibold text-brand-fresh">Consent status: approved</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
