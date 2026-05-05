import type { Metadata } from "next";
import Image from "next/image";
import { HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { VideoTourSection } from "@/components/site/video-tour-section";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";
import { aboutVideos } from "@/lib/site/videos";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about GreenLux Residency's boutique serviced accommodation in Rawalpindi.",
};

const values = [
  {
    title: "Clean, prepared stays",
    description: "Rooms are set up before arrival so guests can settle in with less waiting.",
    icon: Sparkles,
  },
  {
    title: "Privacy for families",
    description: "A calmer option for families, overseas guests, and visitors who need peace.",
    icon: UsersRound,
  },
  {
    title: "Easy arrival",
    description: "Already booked? Complete online check-in before you reach.",
    icon: ShieldCheck,
  },
  {
    title: "Direct WhatsApp help",
    description: "Ask questions, share arrival time, and confirm details in one chat.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">About GreenLux</p>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                A quieter place to stay between Rawalpindi and Islamabad.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-700">
                GreenLux Residency is built for guests who want clean rooms, privacy, and a simple direct booking
                conversation. Choose a named stay, message your dates, and arrive with the main details already clear.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={getWhatsAppHref()} external whatsapp>
                  Check availability on WhatsApp
                </CTAButton>
                <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" showArrow>
                  Already booked? Complete online check-in
                </CTAButton>
              </div>
            </div>
            <div className="relative min-h-[460px] overflow-hidden rounded-[2rem] bg-white shadow-soft">
              <Image
                src="/greenlux/booking/booking-terrace-01.jpg"
                alt="GreenLux Residency terrace seating with plants"
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Why guests choose it"
              title="Practical comfort, without the busy hotel feeling."
              description="GreenLux suits families, business visitors, short-stay guests, and repeat guests who value privacy, clear answers, and a calm base in Westridge."
              align="center"
            />
            <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.title} className="border-t border-brand-deep/10 pt-6">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-deep text-brand-gold">
                    <value.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 font-serif text-xl font-semibold text-brand-deep">{value.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <VideoTourSection
          className="bg-brand-ivory"
          eyebrow="See the property"
          title="Shared spaces that make the stay feel calmer."
          description="A quick look at lounge and terrace access helps guests understand the GreenLux feel before confirming dates."
          videos={aboutVideos}
        />

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-brand-ivory shadow-sm">
              <Image
                src="/greenlux/booking/booking-lounge-01.jpg"
                alt="GreenLux Residency shared lounge seating"
                fill
                sizes="(min-width: 1024px) 24vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-brand-ivory shadow-sm sm:mt-12">
              <Image
                src="/greenlux/booking/booking-exterior-01.jpg"
                alt="GreenLux Residency terrace walkway at night"
                fill
                sizes="(min-width: 1024px) 24vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <SectionHeading
              eyebrow="Arrive prepared"
              title="Know where you are staying before you reach."
              description="You can ask questions before booking, share your arrival time, and complete online check-in once your stay is confirmed."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Named rooms and apartments", "Direct WhatsApp replies", "Online check-in", "Westridge location"].map((item) => (
                <div key={item} className="rounded-2xl border border-brand-deep/10 bg-white p-4 text-sm font-semibold text-brand-deep">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
