import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
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
  title: "Location - Westridge 1, Rawalpindi",
  description:
    "GreenLux Residency in Westridge 1, Rawalpindi, with nearby hospitals, airport access, Ayub National Park, Joyland, Jinnah Park, Cinepax, food, shopping, families, work trips, and Islamabad access.",
  alternates: {
    canonical: "/location",
  },
  openGraph: {
    title: "GreenLux Residency Location in Westridge 1, Rawalpindi",
    description:
      "Plan a GreenLux stay around Westridge 1, Islamabad airport arrivals, nearby hospitals, Ayub National Park, Joyland, Jinnah Park, Cinepax, food, shopping, and Islamabad access.",
    url: "/location",
    images: [
      {
        url: "/greenlux/curation-review/location/08__page-image__gates-day-custom__gates-day-custom.png",
        width: 1200,
        height: 800,
        alt: "GreenLux Residency secure gated entrance in Westridge 1",
      },
    ],
  },
};

const exactAddress = "28A, Street 8B, Westridge 1, Rawalpindi";

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
    description: "Message the team with your timing and stay needs so arrival feels simple.",
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
  guideLinks: Array<{
    label: string;
    href: string;
  }>;
}> = [
  {
    title: "Hospitals",
    description: "Quaid-e-Azam International Hospital, CMH, MH, AFIC, Maryam Memorial, Mega Medical Complex, and other clinics are part of the local medical-access picture.",
    detail: "Good for appointments, attendants, follow-ups, and recovery stays. QIH is often around 15 minutes away in ordinary traffic, while CMH, MH, and AFIC are closer local hospital points.",
    imageSrc: "/greenlux/curation-review/location/03__location-image__quaid-e-azam-international-hospital__qih.webp",
    imageAlt: "Quaid-e-Azam International Hospital building",
    icon: Hospital,
    guideLinks: [{ label: "Medical visit guide", href: "/guides/nearby-hospitals" }],
  },
  {
    title: "Food",
    description: "Westridge has familiar food options including Cheezious, OPTP, Tehzeeb, Hot N Spicy, and other casual choices.",
    detail: "Helpful for late arrivals, families, and guests who want simple meals nearby.",
    imageSrc: "/greenlux/curation-review/location/04__location-image__westridge-food-options__westridge-food-options.jpg",
    imageAlt: "Collage of Westridge food options including Cheezious, OPTP, Tehzeeb, and Hot N Spicy",
    icon: Utensils,
    guideLinks: [{ label: "Food and essentials guide", href: "/guides/food-nearby" }],
  },
  {
    title: "Parks",
    description: "Race Course Park gives families a green outing nearby, with walking tracks and room to slow down between plans.",
    detail: "Useful for children, longer stays, and relatives visiting together.",
    imageSrc: "/greenlux/curation-review/location/05__location-image__race-course-park__race-course-park.jpg",
    imageAlt: "Tree-lined walkway inside Race Course Park Rawalpindi",
    icon: Trees,
    guideLinks: [{ label: "Family outings guide", href: "/guides/parks-nearby" }],
  },
  {
    title: "Grocery and access",
    description: "Nearby groceries, local errands, and practical daily essentials make longer stays easier.",
    detail: "Ask on WhatsApp if you need groceries, tea, transport, or arrival help.",
    imageSrc: "/greenlux/curation-review/location/grocery-csd.jpg",
    imageAlt: "Nearby grocery and daily essentials access for GreenLux guests",
    icon: ShoppingBag,
    guideLinks: [
      { label: "Westridge guide", href: "/guides/westridge-rawalpindi" },
      { label: "Food guide", href: "/guides/food-nearby" },
    ],
  },
  {
    title: "Rawalpindi and Islamabad movement",
    description: "Westridge works as a Rawalpindi base for guests moving between family, work, medical, and Islamabad plans.",
    detail: "Share your visit purpose so the team can suggest a room and arrival timing.",
    imageSrc: "/greenlux/curation-review/location/10__guide-card__Rawalpindi-and-Islamabad-access__army-museum-park.jpg",
    imageAlt: "Rawalpindi and Islamabad access near GreenLux Residency",
    icon: Route,
    guideLinks: [
      { label: "City access guide", href: "/guides/rawalpindi-islamabad-access" },
      { label: "Tourist base guide", href: "/guides/rawalpindi-islamabad-tourist-base" },
    ],
  },
  {
    title: "Islamabad airport access",
    description: "GreenLux is around 24 km from Islamabad International Airport, with road timing shaped by traffic, weather, and airport procedures.",
    detail: "Plan 35-60 minutes by car in ordinary conditions, with extra buffer for rush hour, rain, luggage, security checks, or late-night arrivals.",
    imageSrc: "/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg",
    imageAlt: "GreenLux Residency parking and guest arrival area",
    icon: Plane,
    guideLinks: [{ label: "Airport arrival guide", href: "/guides/airport-arrival-planning" }],
  },
];

const arrivalDetails = [
  "Dates",
  "Guest count",
  "Arrival time",
  "Visit purpose",
  "Room preference",
];

const localExperienceGroups: Array<{
  title: string;
  travelWindow: string;
  description: string;
  highlights: string[];
  guideLinks: Array<{
    label: string;
    href: string;
  }>;
}> = [
  {
    title: "Family parks, rides, and open space",
    travelWindow: "Race Course Park is a nearby short outing; Ayub National Park and Joyland are commonly around 15-30 minutes by car, depending on traffic.",
    description:
      "This is where GreenLux becomes useful for families: you can stay in a quieter Westridge base, then plan a park day, children's rides, a walk, or a calmer evening without building the whole trip around one crowded hotel location.",
    highlights: ["Race Course Park", "Ayub National Park", "Jungle World", "Joyland Rawalpindi"],
    guideLinks: [
      { label: "Family outings guide", href: "/guides/parks-nearby" },
      { label: "Tourist base guide", href: "/guides/rawalpindi-islamabad-tourist-base" },
    ],
  },
  {
    title: "Cinema, Jinnah Park, and casual nights",
    travelWindow: "Jinnah Park and Cinepax are often a 20-35 minute drive from GreenLux, with timing shaped by Airport Road and city traffic.",
    description:
      "For guests who want an easy evening out, Jinnah Park brings together cinema, food, rides, gaming, and public-park space in one Rawalpindi stop. It is useful for families, couples, and guests who want something to do after the main purpose of the visit is handled.",
    highlights: ["Cinepax Jinnah Park", "Motion rides", "Gaming lounges", "Family food options"],
    guideLinks: [{ label: "City access guide", href: "/guides/rawalpindi-islamabad-access" }],
  },
  {
    title: "Food brands and everyday meals",
    travelWindow: "Westridge has nearby food options for the first night; Jinnah Park and Airport Road add more international and casual brands.",
    description:
      "Late arrivals, children, work travellers, and overseas guests usually want food to be simple. GreenLux keeps you close to familiar Westridge options while still making McDonald's, Subway, KFC, Pappasallis, cafes, and other Rawalpindi food stops reachable when the evening allows.",
    highlights: ["Cheezious", "OPTP", "Tehzeeb", "Hot N Spicy", "McDonald's", "Subway", "KFC"],
    guideLinks: [{ label: "Food and essentials guide", href: "/guides/food-nearby" }],
  },
  {
    title: "Shopping, groceries, and household basics",
    travelWindow: "Range Road, Westridge, Saddar, Airport Road, and I-11 shopping runs are practical by car; ask GreenLux which route suits your arrival day.",
    description:
      "Longer stays feel easier when guests can buy groceries, toiletries, snacks, children's items, and household basics without guesswork. GreenLux can help you think through nearby groceries, Punjab Cash & Carry, Madina Cash & Carry, Cosmo, Metro, Saddar, Raja Bazaar, and other shopping stops.",
    highlights: ["Punjab Cash & Carry", "Madina Cash & Carry", "Cosmo", "Metro", "Saddar", "Raja Bazaar"],
    guideLinks: [
      { label: "Westridge guide", href: "/guides/westridge-rawalpindi" },
      { label: "Food guide", href: "/guides/food-nearby" },
    ],
  },
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
        <div className="mt-5 flex flex-wrap gap-2">
          {item.guideLinks.map((guideLink) => (
            <Link
              key={guideLink.href}
              href={guideLink.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-sage/45 px-3 py-1.5 text-xs font-bold text-brand-deep transition hover:bg-brand-sage"
            >
              {guideLink.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function ExperienceCard({ item }: { item: (typeof localExperienceGroups)[number] }) {
  return (
    <article className="h-full rounded-[1.35rem] border border-brand-deep/10 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="font-serif text-2xl font-semibold leading-tight text-brand-deep">{item.title}</h3>
      <p className="mt-3 rounded-2xl bg-brand-ivory px-4 py-3 text-sm font-semibold leading-6 text-brand-deep">
        {item.travelWindow}
      </p>
      <p className="mt-4 text-sm leading-7 text-slate-700">{item.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.highlights.map((highlight) => (
          <span key={highlight} className="rounded-full bg-brand-sage/45 px-3 py-1.5 text-xs font-bold text-brand-deep">
            {highlight}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {item.guideLinks.map((guideLink) => (
          <Link
            key={guideLink.href}
            href={guideLink.href}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-deep transition hover:text-brand-fresh"
          >
            {guideLink.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ))}
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
                A calmer Westridge base for the way people actually visit Rawalpindi.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
                GreenLux Residency is for guests who need the location to work: hospital appointments, family visits,
                food nearby, parking, errands, Islamabad movement, and a team you can message before you arrive.
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
                  src="/greenlux/curation-review/location/08__page-image__gates-day-custom__gates-day-custom.png"
                  alt="GreenLux Residency secure gated entrance and arrival"
                  fill
                  priority
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pb-5 pt-16 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold drop-shadow">Westridge arrival</p>
                  <p className="mt-2 text-sm font-semibold leading-6 drop-shadow">
                    Secure residential entry.
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <Image
                    src="/greenlux/curation-review/location/03__location-image__quaid-e-azam-international-hospital__qih.webp"
                    alt="Quaid-e-Azam International Hospital building"
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-white shadow-sm">
                  <Image
                    src="/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg"
                    alt="GreenLux Residency secure parking and guest arrivals"
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-4 pt-12 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold drop-shadow">Parking</p>
                    <p className="mt-0.5 text-xs font-semibold leading-tight drop-shadow">
                      Dedicated space.
                    </p>
                  </div>
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
                Open the map for orientation, then message GreenLux for the practical details: arrival timing, room fit,
                nearby essentials, and the easiest way to reach us.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <CTAButton href={siteConfig.googleMapsHref} external variant="outline" showArrow>
                  Open in Google Maps
                </CTAButton>
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, please share location and arrival guidance for 28A, Street 8B, Westridge 1, Rawalpindi.")}
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
                A few details make the whole arrival easier.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/75">
                Send the basics before you travel and the team can guide you to the room, timing, and local information
                that fit your visit.
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

        <section className="bg-brand-ivory px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-brand-deep/5 shadow-soft">
              <Image
                src="/greenlux/curation-review/location/09__page-image__side-front-parking-new__side-front-parking-new.jpg"
                alt="GreenLux Residency parking and guest arrival area"
                fill
                sizes="(min-width: 1024px) 42vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pb-5 pt-16 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold drop-shadow">Airport planning</p>
                <p className="mt-2 text-sm font-semibold leading-6 drop-shadow">
                  Plan the road time, luggage, and arrival window before you travel.
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Islamabad airport access</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-5xl">
                Airport arrivals and early departures are easier when the timing is planned.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                GreenLux is around 15 miles / 24 km from Islamabad International Airport. Plan 35-60 minutes by car in
                ordinary conditions, and allow more for rush hour, rain, road restrictions, security checks, luggage, or
                late-night arrivals.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Route note</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">
                    ISB connects with Rawalpindi through GT Road / N-5 and with Islamabad through Srinagar Highway.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Tell GreenLux</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">
                    Share flight time, guest count, luggage, and late check-in or early departure needs.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-gold">Room fit</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-brand-deep">
                    Private rooms suit quick transit; studios and apartments help families and luggage-heavy arrivals.
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, I am planning airport travel. My flight time is __, guest count is __, luggage is __, and I need arrival/departure guidance.")}
                  external
                  whatsapp
                >
                  Ask about airport timing
                </CTAButton>
                <CTAButton href="/guides/airport-arrival-planning" variant="outline" showArrow>
                  Read airport guide
                </CTAButton>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <SectionHeading
              eyebrow="Why this location works"
              title="Useful for real guest plans, not just a pin on the map."
              description="GreenLux is most helpful when the stay supports the reason for travel: family time, medical visits, work, overseas arrivals, international guests, or a short stay that needs to feel simple."
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
              title="Hospitals, airport access, food, parks, errands, and city movement."
              description="Start with the essentials below, then open the guide that matches your visit. The team can help you confirm what matters before you book."
            />
            <div className="mt-10">
              <MobileCarousel ariaLabel="Nearby essentials">
                {nearbyEssentials.map((item) => (
                  <EssentialCard key={item.title} item={item} />
                ))}
              </MobileCarousel>
              <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-3">
                {nearbyEssentials.map((item) => (
                  <EssentialCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <SectionHeading
              eyebrow="Explore from GreenLux"
              title="Parks, cinema, shopping, food, and family evenings within reach."
              description="GreenLux is not only a place to sleep. It works as a calm Westridge base for guests who want to experience Rawalpindi without losing privacy, parking, direct support, and a quieter room to return to."
            />
            <div>
              <MobileCarousel ariaLabel="Nearby attractions, shopping, and entertainment">
                {localExperienceGroups.map((item) => (
                  <ExperienceCard key={item.title} item={item} />
                ))}
              </MobileCarousel>
              <div className="hidden gap-5 md:grid md:grid-cols-2">
                {localExperienceGroups.map((item) => (
                  <ExperienceCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-brand-deep/10 bg-white p-4 shadow-sm">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-brand-deep/5">
                <Image
                  src="/greenlux/curation-review/location/10__guide-card__Rawalpindi-and-Islamabad-access__army-museum-park.jpg"
                  alt="Rawalpindi and Islamabad access near GreenLux Residency"
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 px-1 text-sm font-semibold leading-6 text-brand-deep">
                Use this as a quick visual for nearby movement. For live routes, timings, and arrival guidance, message
                GreenLux before you travel.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-gold">Medical and family planning</p>
              <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-5xl">
                Turn the location into a clearer stay plan.
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-700">
                Tell GreenLux whether you are coming for a hospital visit, family stay, work trip, onward travel, or a
                short city visit. The team can suggest a room type, arrival timing, and the guide that matches your plan.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <CTAButton
                  href={getWhatsAppHref("Hi GreenLux Residency, I need help choosing a stay. My visit purpose is __, arrival timing is __, and location needs are __.")}
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
