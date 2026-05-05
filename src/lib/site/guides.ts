export type GuideIcon = "map" | "hospital" | "food" | "park" | "route" | "passport";

export type SiteGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  whoItHelps: string;
  whyItMatters: string;
  suggestedRoomType: string;
  stayTypes: string[];
  icon: GuideIcon;
  href: string;
};

export const guides: SiteGuide[] = [
  {
    slug: "westridge-rawalpindi",
    title: "Westridge, Rawalpindi base",
    shortTitle: "Westridge base",
    description:
      "GreenLux sits in Westridge 1, a quieter Rawalpindi base with useful access toward Islamabad and nearby city errands.",
    whoItHelps: "Families, repeat guests, work travellers, and short-stay guests who want a calmer base.",
    whyItMatters: "The right location makes arrival, local movement, and daily planning easier.",
    suggestedRoomType: "Studios or apartments for longer stays; private rooms for short trips.",
    stayTypes: ["Studios", "Private rooms", "Family apartments"],
    icon: "map",
    href: "/guides#westridge-rawalpindi",
  },
  {
    slug: "nearby-hospitals",
    title: "Medical visits and nearby hospitals",
    shortTitle: "Medical visits",
    description:
      "A practical guide for guests visiting Rawalpindi for appointments, attendants, recovery time, or family support.",
    whoItHelps: "Medical travellers, attendants, families, and guests who need a quieter place between appointments.",
    whyItMatters: "A managed stay with direct WhatsApp support can reduce arrival stress around appointment schedules.",
    suggestedRoomType: "Studios or apartments when you need more privacy; private rooms for short appointment visits.",
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "hospital",
    href: "/guides#nearby-hospitals",
  },
  {
    slug: "food-nearby",
    title: "Food, groceries, and daily essentials",
    shortTitle: "Food and essentials",
    description:
      "Useful notes for guests who want nearby food, tea, groceries, or simple daily essentials during their stay.",
    whoItHelps: "Short-stay guests, business travellers, families arriving late, and longer-stay guests.",
    whyItMatters: "Knowing how to handle meals and basics makes the stay feel easier from the first evening.",
    suggestedRoomType: "Studios and apartments if you want kitchen access; private rooms for quick stays.",
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "food",
    href: "/guides#food-nearby",
  },
  {
    slug: "parks-nearby",
    title: "Parks and family outings",
    shortTitle: "Parks nearby",
    description:
      "GreenLux can work as a base for families planning slower evenings, parks nearby, and simple Rawalpindi outings.",
    whoItHelps: "Families with children, overseas guests visiting relatives, and guests staying more than one night.",
    whyItMatters: "Families often choose more space and a calmer place to return to after local visits.",
    suggestedRoomType: "Apartment 3 or Apartment 4 for families; Studio 1 or Studio 2 for couples.",
    stayTypes: ["Apartments", "Studios"],
    icon: "park",
    href: "/guides#parks-nearby",
  },
  {
    slug: "rawalpindi-islamabad-access",
    title: "Rawalpindi and Islamabad access",
    shortTitle: "City access",
    description:
      "Use GreenLux as a quieter Rawalpindi base while planning work, family, or day visits across Islamabad.",
    whoItHelps: "Business travellers, families with plans in both cities, and guests arranging day trips.",
    whyItMatters: "Sharing your plans before booking helps GreenLux suggest the right room type and arrival timing.",
    suggestedRoomType: "Executive rooms for work trips; studios or apartments for longer visits.",
    stayTypes: ["Executive rooms", "Studios", "Apartments"],
    icon: "route",
    href: "/guides#rawalpindi-islamabad-access",
  },
  {
    slug: "international-guest-tips",
    title: "International guest practical tips",
    shortTitle: "Guest tips",
    description:
      "Simple planning notes for overseas guests: share arrival time, guest count, luggage needs, and check-in details early.",
    whoItHelps: "International guests, overseas Pakistanis, families arriving from the airport, and first-time visitors.",
    whyItMatters: "Direct WhatsApp communication helps clarify arrival, location guidance, and online check-in before travel.",
    suggestedRoomType: "Studios for privacy; apartments for families or longer visits.",
    stayTypes: ["Studios", "Apartments", "Private rooms"],
    icon: "passport",
    href: "/guides#international-guest-tips",
  },
];

export const nearbyCategories: Array<{
  title: string;
  description: string;
  icon: GuideIcon;
}> = [
  {
    title: "Hospitals and medical visits",
    description: "Useful for guests who need a managed base around appointments, attendants, or family support.",
    icon: "hospital",
  },
  {
    title: "Parks and family outings",
    description: "Apartment-style stays work well when families want more space between visits and outings.",
    icon: "park",
  },
  {
    title: "Food and daily essentials",
    description: "Ask us for nearby food, groceries, and simple daily convenience before arrival.",
    icon: "food",
  },
  {
    title: "Islamabad access",
    description: "A quieter Rawalpindi base for guests moving between Rawalpindi and Islamabad plans.",
    icon: "route",
  },
  {
    title: "Airport and arrival planning",
    description: "Share flight or arrival timing on WhatsApp so the stay and check-in details are clearer.",
    icon: "passport",
  },
  {
    title: "Business and work trips",
    description: "Private rooms and studios suit short work visits, repeat stays, and practical arrivals.",
    icon: "map",
  },
];
