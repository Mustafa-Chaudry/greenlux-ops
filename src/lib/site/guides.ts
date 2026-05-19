export type GuideIcon = "map" | "hospital" | "food" | "park" | "route" | "passport";

export type SiteGuide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  sourceNote: string;
  highlights: string[];
  whoItHelps: string;
  whyItMatters: string;
  suggestedRoomType: string;
  stayTypes: string[];
  icon: GuideIcon;
  href: string;
  supportImageSrc?: string;
  supportImageAlt?: string;
  supportLabel?: string;
};

export const guides: SiteGuide[] = [
  {
    slug: "westridge-rawalpindi",
    title: "Westridge 1 location guide",
    shortTitle: "Westridge 1",
    description:
      "GreenLux sits in Westridge 1, a cantonment-side Rawalpindi neighbourhood that works well for guests who want a calmer base with practical city access.",
    imageSrc: "/greenlux/location/army-museum-park.jpg",
    imageAlt: "Aircraft display in a Westridge local attraction park",
    sourceNote: "Based on GreenLux Westridge location guidance.",
    highlights: ["Cantonment-side residential feel", "Groceries and errands nearby", "Useful for Rawalpindi and Islamabad plans"],
    whoItHelps: "Families, overseas Pakistanis, repeat guests, work travellers, and short-stay guests.",
    whyItMatters: "A quieter base makes arrival, local movement, and daily planning feel easier.",
    suggestedRoomType: "Studios or apartments for longer stays; private rooms for short trips.",
    stayTypes: ["Studios", "Private rooms", "Family apartments"],
    icon: "map",
    href: "/guides#westridge-rawalpindi",
  },
  {
    slug: "nearby-hospitals",
    title: "Nearby hospitals and medical visits",
    shortTitle: "Medical visits",
    description:
      "A practical stay-planning guide for patients, attendants, and families visiting Rawalpindi for appointments, follow-ups, or recovery time.",
    imageSrc: "/greenlux/location/afic-hospital.jpg",
    imageAlt: "Armed Forces Institute of Cardiology hospital building",
    sourceNote: "Based on GreenLux hospital-access blog guidance.",
    highlights: ["AFIC, MH, CMH and private hospitals in reach", "Privacy between appointments", "WhatsApp help for timing and room fit"],
    whoItHelps: "Medical travellers, attendants, families, and guests who need a quieter place between appointments.",
    whyItMatters: "A managed stay with direct WhatsApp support can reduce arrival stress around appointment schedules.",
    suggestedRoomType: "Studios or apartments when you need more privacy; private rooms for short appointment visits.",
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "hospital",
    href: "/guides#nearby-hospitals",
    supportImageSrc: "/greenlux/location/afic-route-map.png",
    supportImageAlt: "Route map from GreenLux Residency toward nearby hospital access",
    supportLabel: "Hospital route context",
  },
  {
    slug: "parks-nearby",
    title: "Race Course Park and family outings",
    shortTitle: "Race Course Park",
    description:
      "Race Course Park gives families and longer-stay guests a nearby green outing for walks, children, and calmer evenings away from traffic.",
    imageSrc: "/greenlux/location/race-course-park.jpg",
    imageAlt: "Tree-lined walkway inside Race Course Park Rawalpindi",
    sourceNote: "Based on GreenLux Race Course Park blog guidance.",
    highlights: ["1.8 km walking track", "Green space for children and family time", "Useful reset between city plans"],
    whoItHelps: "Families with children, overseas guests visiting relatives, and guests staying more than one night.",
    whyItMatters: "Families often choose more space and a calmer place to return to after local visits.",
    suggestedRoomType: "Apartment 3 or Apartment 4 for families; Studio 1 or Studio 2 for couples.",
    stayTypes: ["Apartments", "Studios"],
    icon: "park",
    href: "/guides#parks-nearby",
    supportImageSrc: "/greenlux/location/race-course-park-route-satellite.png",
    supportImageAlt: "Satellite-style route map from GreenLux Residency to Race Course Park",
    supportLabel: "Park route context",
  },
  {
    slug: "food-nearby",
    title: "Food chains and daily essentials",
    shortTitle: "Food nearby",
    description:
      "Westridge gives guests easy options for quick food, familiar chains, traditional meals, tea, snacks, and simple daily essentials.",
    imageSrc: "/greenlux/location/westridge-food-options.jpg",
    imageAlt: "Collage of Westridge food options including Cheezious, OPTP, Tehzeeb, and Hot N Spicy",
    sourceNote: "Based on GreenLux Westridge food-chain guidance.",
    highlights: ["Cheezious, OPTP, Tehzeeb and Hot N Spicy nearby", "Good for late arrivals", "Groceries and basics within local reach"],
    whoItHelps: "Short-stay guests, business travellers, families arriving late, and longer-stay guests.",
    whyItMatters: "Knowing how to handle meals and basics makes the stay feel easier from the first evening.",
    suggestedRoomType: "Studios and apartments if you want kitchen access; private rooms for quick stays.",
    stayTypes: ["Private rooms", "Studios", "Apartments"],
    icon: "food",
    href: "/guides#food-nearby",
  },
  {
    slug: "rawalpindi-islamabad-access",
    title: "Rawalpindi and Islamabad access",
    shortTitle: "City access",
    description:
      "Use GreenLux as a calmer Rawalpindi base while planning work, family visits, appointments, or day movement across Islamabad.",
    imageSrc: "/greenlux/location/army-museum-park.jpg",
    imageAlt: "Westridge local attraction park with aircraft display",
    sourceNote: "Based on GreenLux Westridge access and about-page context.",
    highlights: ["Rawalpindi base with Islamabad movement", "Useful for work and family visits", "Share plans before booking for room guidance"],
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
      "Simple planning notes for overseas guests: share arrival time, guest count, luggage needs, visit purpose, and room preference before you travel.",
    imageSrc: "/greenlux/location/race-course-park.jpg",
    imageAlt: "Calm tree-lined walkway in a nearby Rawalpindi park",
    sourceNote: "Based on GreenLux direct-arrival and serviced-stay guidance.",
    highlights: ["Confirm arrival time early", "Use online check-in after booking", "Ask on WhatsApp for location and room fit"],
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
