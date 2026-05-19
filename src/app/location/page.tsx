import type { Metadata } from "next";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Clock3,
  HeartPulse,
  Hospital,
  MapPin,
  MessageCircle,
  Plane,
  Route,
  ShieldCheck,
  ShoppingBag,
  Trees,
  UsersRound,
  Utensils,
} from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { MobileCarousel } from "@/components/site/mobile-carousel";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

export const metadata: Metadata = {
  title: "Location",
  description:
    "GreenLux Residency in Westridge 1, Rawalpindi, with local guidance for hospitals, food, parks, families, work trips, and Islamabad access.",
};

const exactAddress = "28A, Mian Iqbal Road, Westridge 1, Rawalpindi, 46000, Pakistan";

const guestTypes: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Families",
    description: "Apartments and studios give families more privacy, space, and a calmer base between local visits.",
    icon: UsersRound,
  },
  {
    title: "Medical visits",
    description: "A practical stay for patients, attendants, and relatives coordinating appointments or recovery time.",
    icon: HeartPulse,
  },
  {
    title: "Work trips",
    description: "Private rooms and studios help repeat business guests keep arrival and movement simple.",
    icon: Building2,
  },
  {
    title: "Overseas Pakistanis",
    description: "Direct WhatsApp support helps returning families confirm location, timing, and room fit before travel.",
    icon: Plane,
  },
  {
    title: "International visitors",
    description: "Share arrival details early so check-in, directions, and stay expectations are clear.",
    icon: ShieldCheck,
  },
  {
    title: "Short stays",
    description: "Useful when you need a clean, managed place for a few nights without hotel-style friction.",
    icon: Clock3,
  },
];

const nearbyEssentials: Array<{
  title: string;
  description: string;
  detail: string;
  imageSrc: string;
  imageAlt: string;
  icon: LucideIcon;
}> = [
  {
    title: "Hospitals",
    description: "AFIC, MH, CMH, Maryam Memorial, Mega Medical Complex, and other clinics are part of the local medical-access picture.",
    detail: "Good for appointments, attendants, follow-ups, and recovery stays.",
    imageSrc: "/greenlux/location/afic-hospital.jpg",
    imageAlt: "Armed Forces Institute of Cardiology hospital building",
    icon: Hospital,
  },
  {
    title: "Food",
    description: "Westridge has familiar food options including Cheezious, OPTP, Tehzeeb, Hot N Spicy, and other casual choices.",
    detail: "Helpful for late arrivals, families, and guests who want simple meals nearby.",
    imageSrc: "/greenlux/location/westridge-food-options.jpg",
    imageAlt: "Collage of Westridge food options including Cheezious, OPTP, Tehzeeb, and Hot N Spicy",
    icon: Utensils,
  },
  {
    title: "Parks",
    description: "Race Course Park gives families a green outing nearby, with walking tracks and room to slow down between plans.",
    detail: "Useful for children, longer stays, and relatives visiting together.",
    imageSrc: "/greenlux/location/race-course-park.jpg",
    imageAlt: "Tree-lined walkway inside Race Course Park Rawalpindi",
    icon: Trees,
  },
  {
    title: "Grocery and access",
    description: "GreenLux's existing Westridge guidance notes nearby groceries, local errands, and practical daily essentials.",
    detail: "Ask on WhatsApp if you need groceries, tea, transport, or arrival help.",
    imageSrc: "/greenlux/location/army-museum-park.jpg",
    imageAlt: "Aircraft display in a Westridge local attraction park",
    icon: ShoppingBag,
  },
  {
    title: "Rawalpindi and Islamabad movement",
    description: "Westridge works as a Rawalpindi base for guests moving between family, work, medical, and Islamabad plans.",
    detail: "Share your visit purpose so the team can suggest a room and arrival timing.",
    imageSrc: "/greenlux/location/race-course-park-route-satellite.png",
    imageAlt: "Satellite-style route map from GreenLux Residency to Race Course Park",
    icon: Route,
  },
];

const arrivalDetails = [
  "Dates",
  "Guest count",
  "Arrival time",
  "Visit purpose",
  "Room preference",
];

function GuestTypeCard({ item }: { item: (typeof guestTypes)[number] }) {
  return (
    <div className="h-full rounded-[1.35rem] border border-brand-deep/10 bg-white p-5 shadow-sm sm:p-6">
      <item.icon className="h-7 w-7 text-brand-fresh" aria-hidden="true" />
      <h3 className="mt-5 font-serif text-2xl font-semibold text-brand-deep">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
    </div>
  );
}

function EssentialCard({ item }: { item: (typeof nearbyEssentials)[number] }) {
  return (
    <article className="h-full overflow-hidden rounded-[1.35rem] border border-brand-deep/10 bg-white shadow-sm">
      <div className="relative aspect-[4/3] bg-brand-deep/5">
        <Image src={item.imageSrc} alt={item.imageAlt} fill sizes="(min-width: 768px) 33vw, 90vw" className="object-cover" />
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-sage/45 text-brand-deep">
          <item.icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-brand-deep">{item.title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
        <p className="mt-3 text-sm font-semibold leading-6 text-brand-deep">{item.detail}</p>
      </div>
    </article>
  );
}

export default function LocationPage() {
  return (
    <SiteShell>
      <main>
        <section className="bg-brand-ivory px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">Location</p>
              <h1 className="mt-5 max-w-4xl font-serif text-4xl font-semibold leading-tight text-brand-deep sm:text-6xl">
                A calm Westridge base for Rawalpindi and Islamabad visits.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                GreenLux Residency is positioned for guests who want a quieter managed stay near Rawalpindi essentials,
                with practical access toward Islamabad and direct WhatsApp guidance before arrival.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, I am planning a visit to Rawalpindi or Islamabad. Please suggest the best stay option and share location guidance.")}
                  external
                  whatsapp
                >
                  Ask for stay guidance
                </CTAButton>
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" showArrow>
                  Open in Google Maps
                </CTAButton>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1.18fr_0.82fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-white shadow-soft sm:min-h-[480px]">
                <Image
                  src="/greenlux/location/army-museum-park.jpg"
                  alt="Aircraft display in a Westridge local attraction park"
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-4 shadow-soft">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Westridge 1 context</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">
                    A residential Rawalpindi base near local parks, daily essentials, and city movement.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <Image
                    src="/greenlux/location/afic-hospital.jpg"
                    alt="Armed Forces Institute of Cardiology hospital building"
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <Image
                    src="/greenlux/location/race-course-park.jpg"
                    alt="Tree-lined walkway inside Race Course Park Rawalpindi"
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div className="rounded-[1.5rem] border border-brand-deep/10 bg-brand-ivory p-6 shadow-sm sm:p-8">
              <MapPin className="h-8 w-8 text-brand-fresh" aria-hidden="true" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Address</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-4xl">
                GreenLux Residency
              </h2>
              <p className="mt-4 text-lg font-semibold leading-8 text-brand-deep">{exactAddress}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use the map for orientation, then message GreenLux for practical arrival guidance, room fit, and timing.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" showArrow>
                  Open in Google Maps
                </CTAButton>
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, please share location and arrival guidance for 28A Mian Iqbal Road, Westridge 1.")}
                  external
                  whatsapp
                >
                  Ask on WhatsApp
                </CTAButton>
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-[#05281f] p-6 text-white shadow-soft sm:p-8">
              <MessageCircle className="h-8 w-8 text-brand-gold" aria-hidden="true" />
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight sm:text-4xl">
                Before you arrive, send the stay context.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                The fastest way to reduce arrival stress is to message the team with the few details that shape the stay.
              </p>
              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {arrivalDetails.map((detail) => (
                  <div key={detail} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold">
                    {detail}
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, my dates are __, guest count is __, arrival time is __, visit purpose is __, and room preference is __. Please suggest the best stay option.")}
                  external
                  whatsapp
                  variant="secondary"
                  className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
                >
                  Send stay details
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <SectionHeading
              eyebrow="Why this location works"
              title="Useful for real guest plans, not just sightseeing."
              description="GreenLux is most helpful when the location supports the reason for travel: family, medical visits, work, overseas arrivals, international guests, or a short stay that needs to be simple."
            />
            <MobileCarousel ariaLabel="Guest types this location supports">
              {guestTypes.map((item) => (
                <GuestTypeCard key={item.title} item={item} />
              ))}
            </MobileCarousel>
            <div className="hidden grid-cols-2 gap-4 md:grid xl:grid-cols-3">
              {guestTypes.map((item) => (
                <GuestTypeCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Nearby essentials"
              title="Hospitals, food, parks, errands, and city movement."
              description="These are the practical signals guests ask about before booking. The team can guide you on what matters for your specific visit."
            />
            <div className="mt-10">
              <MobileCarousel ariaLabel="Nearby essentials">
                {nearbyEssentials.map((item) => (
                  <EssentialCard key={item.title} item={item} />
                ))}
              </MobileCarousel>
              <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-5">
                {nearbyEssentials.map((item) => (
                  <EssentialCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white p-4 shadow-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-brand-deep/5">
                <Image
                  src="/greenlux/location/afic-route-map.png"
                  alt="Route map from GreenLux Residency toward nearby hospital access"
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 px-1 text-sm font-semibold leading-6 text-brand-deep">
                Route screenshots are shown only as planning context. Ask the team for current arrival guidance before travel.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Medical and family planning</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-5xl">
                Use WhatsApp to turn the location into a clearer plan.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Tell GreenLux whether you are coming for a hospital visit, family stay, work trip, or short visit. The team can suggest a room type, arrival timing, and next step without sending you through a generic booking flow.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, I need help choosing a stay based on location, visit purpose, and arrival timing.")}
                  external
                  whatsapp
                >
                  Plan on WhatsApp
                </CTAButton>
                <CTAButton href="/guides" variant="outline" showArrow>
                  Read local guides
                </CTAButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
