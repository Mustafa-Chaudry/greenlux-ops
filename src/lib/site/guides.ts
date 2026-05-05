export type SiteGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  guestNeed: string;
  stayTypes: string[];
  image: string;
  href: string;
};

export const guides: SiteGuide[] = [
  {
    slug: "westridge-rawalpindi",
    title: "Westridge, Rawalpindi location guide",
    shortTitle: "Westridge guide",
    description: "A quiet Rawalpindi base with access toward Islamabad, family visits, work trips, and short stays.",
    guestNeed: "Best when you want a calmer place to stay without being far from the city.",
    stayTypes: ["Studios", "Private rooms", "Family apartments"],
    image: "/greenlux/booking/booking-exterior-01.jpg",
    href: "/guides#westridge-rawalpindi",
  },
  {
    slug: "nearby-hospitals",
    title: "Nearby hospitals and medical visits",
    shortTitle: "Medical visits",
    description: "Helpful for guests travelling with family, attending appointments, or needing a quieter recovery base.",
    guestNeed: "Ask us which room gives the easiest stay for your appointment schedule.",
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    image: "/greenlux/property/exterior-entry.jpg",
    href: "/guides#nearby-hospitals",
  },
  {
    slug: "food-nearby",
    title: "Food and cafes nearby",
    shortTitle: "Food nearby",
    description: "Simple options for guests who want nearby food, tea, and casual meals during their stay.",
    guestNeed: "Useful for short stays, business visits, and families arriving after travel.",
    stayTypes: ["Private rooms", "Studios"],
    image: "/greenlux/booking/booking-dining-01.jpg",
    href: "/guides#food-nearby",
  },
  {
    slug: "parks-nearby",
    title: "Parks and family-friendly places nearby",
    shortTitle: "Parks nearby",
    description: "A quick guide for families who want green space, slower evenings, or simple outings nearby.",
    guestNeed: "A good fit for families choosing apartment-style stays.",
    stayTypes: ["Apartments", "Studios"],
    image: "/greenlux/booking/booking-terrace-01.jpg",
    href: "/guides#parks-nearby",
  },
  {
    slug: "rawalpindi-islamabad-access",
    title: "Rawalpindi and Islamabad access",
    shortTitle: "City access",
    description: "Use GreenLux as a quieter base between Rawalpindi plans and Islamabad visits.",
    guestNeed: "Share your visit purpose and arrival time so we can suggest the right stay.",
    stayTypes: ["Executive rooms", "Studios", "Apartments"],
    image: "/greenlux/booking/booking-lounge-01.jpg",
    href: "/guides#rawalpindi-islamabad-access",
  },
];

export const nearbyCategories = [
  {
    title: "Hospitals and medical visits",
    description: "Ask for a stay that keeps arrival and rest simple around appointments.",
  },
  {
    title: "Parks and family visits",
    description: "Apartment-style stays work well when families want more space.",
  },
  {
    title: "Food and cafes",
    description: "Message us for nearby food suggestions before or after arrival.",
  },
  {
    title: "Islamabad access",
    description: "A quieter Rawalpindi base for guests moving between both cities.",
  },
  {
    title: "Business and work trips",
    description: "Private rooms and studios suit short work visits and repeat stays.",
  },
];
