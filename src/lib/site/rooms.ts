export type RoomType = "club_class" | "deluxe" | "executive" | "economy" | "apartment";

export type PublicRoom = {
  name: string;
  slug: string;
  type: RoomType;
  categoryLabel: string;
  stayType: "Studio apartment" | "Private room" | "Full apartment";
  hook: string;
  shortDescription: string;
  description: string;
  priceFromPkr: number;
  maxGuests: number;
  sizeLabel?: string;
  amenities: string[];
  suitableFor: string[];
  highlights: string[];
  images: string[];
  imageAlt: string;
  sourceUrl?: string;
  sourceNote?: string;
};

export const roomTypeLabels: Record<RoomType, string> = {
  club_class: "Club Class",
  deluxe: "Deluxe",
  executive: "Executive",
  economy: "Economy",
  apartment: "Apartments / Studios",
};

const sharedAmenities = [
  "WiFi",
  "Smart TV",
  "Air conditioning",
  "24/7 light",
  "Home safety",
];

export const rooms: PublicRoom[] = [
  {
    name: "Studio 1",
    slug: "studio-1",
    type: "club_class",
    categoryLabel: "Club Class Studio",
    stayType: "Studio apartment",
    hook: "Private terrace studio for longer, calmer stays.",
    shortDescription:
      "A warm studio with terrace garden, kitchen basics, refrigerator, microwave, and a 65 inch Smart TV.",
    description:
      "Choose Studio 1 when you want privacy, outdoor space, and the ease of a small apartment. The terrace garden gives you a quiet corner, while the kitchen basics, refrigerator, microwave, toaster, iron, and Smart TV help longer stays feel settled.",
    priceFromPkr: 8500,
    maxGuests: 3,
    sizeLabel: "Approx. 750 sq ft",
    amenities: [
      ...sharedAmenities,
      "Private terrace garden",
      "Kitchen and dining",
      "Microwave",
      "Refrigerator",
      "Sound system",
    ],
    suitableFor: ["Couples", "Business travellers", "Long stays", "Guests who want a terrace"],
    highlights: ["Private terrace", "Kitchen basics", "Warm studio layout"],
    images: [
      "/greenlux/rooms/studio-1-01.jpg",
      "/greenlux/rooms/studio-1-02.jpg",
      "/greenlux/rooms/studio-1-03.jpg",
      "/greenlux/rooms/studio-1-04.jpg",
      "/greenlux/rooms/studio-1-05.jpg",
      "/greenlux/rooms/studio-1-06.jpg",
      "/greenlux/rooms/studio-1-07.jpg",
    ],
    imageAlt: "GreenLux Studio 1 serviced apartment with warm interiors",
    sourceUrl: "https://greenluxresidency.com/apartment/studio-1/",
  },
  {
    name: "Studio 2",
    slug: "studio-2",
    type: "club_class",
    categoryLabel: "Club Class Studio",
    stayType: "Studio apartment",
    hook: "Warm studio with garden access and kitchen basics.",
    shortDescription:
      "A private studio with warm finishes, kitchen essentials, refrigerator, freezer, and terrace access.",
    description:
      "Studio 2 works well when you want a private room with more independence. It gives you a calm studio feel, useful kitchen essentials, and easy access to shared outdoor space.",
    priceFromPkr: 8500,
    maxGuests: 3,
    amenities: [
      ...sharedAmenities,
      "Kitchen and dining",
      "Microwave",
      "Refrigerator",
      "Freezer",
      "Common terrace access",
    ],
    suitableFor: ["Couples", "Solo guests", "Business travellers", "Short stays"],
    highlights: ["Studio layout", "Kitchen essentials", "Terrace access"],
    images: [
      "/greenlux/rooms/studio-2-01.jpg",
      "/greenlux/rooms/studio-2-02.jpg",
      "/greenlux/rooms/studio-2-03.jpg",
      "/greenlux/rooms/studio-2-05.jpg",
      "/greenlux/rooms/studio-2-04.jpg",
      "/greenlux/rooms/studio-2-06.jpg",
      "/greenlux/rooms/studio-2-07.jpg",
    ],
    imageAlt: "GreenLux Studio 2 room with serviced apartment amenities",
    sourceUrl: "https://greenluxresidency.com/apartment/studio-2/",
  },
  {
    name: "Apartment 3",
    slug: "apartment-3",
    type: "apartment",
    categoryLabel: "One-Bed Apartment",
    stayType: "Full apartment",
    hook: "Best for families who need space to settle.",
    shortDescription:
      "A one-bedroom apartment with separate lounge, dining area, kitchen, walk-in dresser, and two terraces.",
    description:
      "Apartment 3 is a strong choice for families and longer stays. You get a separate bedroom, TV lounge, dining area, kitchen, walk-in dresser, spacious bathroom, and two terraces, including a laundry terrace.",
    priceFromPkr: 9000,
    maxGuests: 4,
    sizeLabel: "Approx. 850 sq ft",
    amenities: [
      ...sharedAmenities,
      "Separate TV lounge",
      "Private kitchen",
      "Dining area",
      "Walk-in dresser",
      "Two terraces",
      "Laundry terrace",
    ],
    suitableFor: ["Families", "Long stays", "Business travellers", "Guests who need extra space"],
    highlights: ["Separate lounge", "Two terraces", "Private kitchen"],
    images: [
      "/greenlux/rooms/apartment-3-02.jpg",
      "/greenlux/rooms/apartment-3-01.jpg",
      "/greenlux/rooms/apartment-3-03.jpg",
      "/greenlux/rooms/apartment-3-04.jpg",
      "/greenlux/rooms/apartment-3-05.jpg",
      "/greenlux/rooms/apartment-3-06.jpg",
      "/greenlux/rooms/apartment-3-07.jpg",
    ],
    imageAlt: "GreenLux Apartment 3 dining and serviced apartment details",
    sourceUrl: "https://greenluxresidency.com/apartment/apartment-3/",
  },
  {
    name: "Apartment 4",
    slug: "apartment-4",
    type: "apartment",
    categoryLabel: "Split-Level Apartment",
    stayType: "Full apartment",
    hook: "Split-level space for work, rest, and family stays.",
    shortDescription:
      "A split-level apartment with bedroom, work nook, bathroom, terrace, private kitchen, and lounge.",
    description:
      "Apartment 4 gives you a bedroom and seating or work corner upstairs, plus a private kitchen and lounge downstairs. It suits families, small groups, and business stays that need more room than a private bedroom.",
    priceFromPkr: 9500,
    maxGuests: 4,
    amenities: [
      ...sharedAmenities,
      "Private lounge",
      "Large private kitchen",
      "Work nook",
      "Back terrace",
      "Dining space",
      "Refrigerator",
    ],
    suitableFor: ["Families", "Small groups", "Business stays", "Long stays"],
    highlights: ["Split-level layout", "Private lounge", "Large kitchen"],
    images: [
      "/greenlux/rooms/apartment-4-01.jpg",
      "/greenlux/rooms/apartment-4-02.jpg",
      "/greenlux/rooms/apartment-4-03.jpg",
      "/greenlux/rooms/apartment-4-04.jpg",
      "/greenlux/rooms/apartment-4-05.jpg",
      "/greenlux/rooms/apartment-4-06.jpg",
    ],
    imageAlt: "GreenLux Apartment 4 bedroom and apartment interiors",
    sourceUrl: "https://greenluxresidency.com/apartment/apartment-4/",
  },
  {
    name: "Room 5",
    slug: "room-5",
    type: "deluxe",
    categoryLabel: "Deluxe Room",
    stayType: "Private room",
    hook: "Polished deluxe room for quiet short stays.",
    shortDescription:
      "A deluxe private room with warm woodwork, a grey palette, and shared lounge, kitchen, and terrace access.",
    description:
      "Room 5 is a comfortable private room for guests who want a refined space without booking a full apartment. The warm woodwork, grey finish, and shared lounge access make it practical for short stays.",
    priceFromPkr: 7500,
    maxGuests: 3,
    amenities: [
      ...sharedAmenities,
      "Refrigerator access",
      "Common lounge access",
      "Terrace seating access",
      "Common kitchen access",
    ],
    suitableFor: ["Couples", "Business travellers", "Short stays", "Repeat guests"],
    highlights: ["Deluxe finish", "Warm woodwork", "Shared lounge access"],
    images: [
      "/greenlux/rooms/room-5-01.jpg",
      "/greenlux/rooms/room-5-02.jpg",
      "/greenlux/rooms/room-5-03.jpg",
      "/greenlux/rooms/room-5-04.jpg",
      "/greenlux/rooms/room-5-05.jpg",
      "/greenlux/rooms/room-5-06.jpg",
    ],
    imageAlt: "GreenLux Room 5 deluxe private room",
    sourceUrl: "https://greenluxresidency.com/apartment/room-5/",
  },
  {
    name: "Room 7",
    slug: "room-7",
    type: "deluxe",
    categoryLabel: "Deluxe Room",
    stayType: "Private room",
    hook: "Comfortable deluxe room with a calm grey finish.",
    shortDescription:
      "A deluxe room with plush furnishings, a calm grey finish, and access to shared GreenLux spaces.",
    description:
      "Room 7 suits guests who want comfort, privacy, and a polished room without moving into a full apartment. It is a good fit for couples, work trips, and shorter visits.",
    priceFromPkr: 7500,
    maxGuests: 3,
    amenities: [
      ...sharedAmenities,
      "Plush furnishings",
      "Common lounge access",
      "Terrace seating access",
      "Refrigerator access",
    ],
    suitableFor: ["Couples", "Short stays", "Business travellers", "Guests who want a quieter room"],
    highlights: ["Plush setup", "Deluxe privacy", "Shared spaces"],
    images: [
      "/greenlux/rooms/room-7-01.jpg",
      "/greenlux/rooms/room-7-02.jpg",
      "/greenlux/rooms/room-7-03.jpg",
      "/greenlux/rooms/room-7-04.jpg",
      "/greenlux/rooms/room-7-05.jpg",
      "/greenlux/rooms/room-7-06.jpg",
    ],
    imageAlt: "GreenLux Room 7 deluxe room interiors",
    sourceUrl: "https://greenluxresidency.com/apartment/room-7/",
  },
  {
    name: "Room 6",
    slug: "room-6",
    type: "executive",
    categoryLabel: "Executive Room",
    stayType: "Private room",
    hook: "Quiet executive stay with strong value.",
    shortDescription:
      "A mid-size executive room with privacy, air conditioning, and access to shared lounge and kitchen areas.",
    description:
      "Room 6 is a practical base for solo guests, business travellers, and short stays. It keeps the price sensible while still giving you a private room and access to shared GreenLux spaces.",
    priceFromPkr: 6800,
    maxGuests: 2,
    amenities: [
      ...sharedAmenities,
      "Common lounge access",
      "Outdoor terrace seating",
      "Common kitchen access",
      "Refrigerator access",
    ],
    suitableFor: ["Business travellers", "Budget-conscious guests", "Solo guests", "Repeat stays"],
    highlights: ["Strong value", "Common lounge", "Private room"],
    images: [
      "/greenlux/rooms/room-6-01.jpg",
      "/greenlux/rooms/room-6-02.jpg",
      "/greenlux/rooms/room-6-03.jpg",
      "/greenlux/rooms/room-6-04.png",
      "/greenlux/rooms/room-6-05.png",
    ],
    imageAlt: "GreenLux Room 6 executive private room",
    sourceUrl: "https://greenluxresidency.com/apartment/room-6/",
  },
  {
    name: "Room 10",
    slug: "room-10",
    type: "executive",
    categoryLabel: "Executive Room",
    stayType: "Private room",
    hook: "Executive room close to lounge and terrace spaces.",
    shortDescription:
      "An executive room with refrigerator, air conditioning, and easy access to lounge, terrace, and kitchen areas.",
    description:
      "Room 10 is a good fit when you want a private room plus nearby shared spaces. It includes a refrigerator and air conditioning, with lounge, terrace seating, and kitchen access close by.",
    priceFromPkr: 6800,
    maxGuests: 2,
    amenities: [
      ...sharedAmenities,
      "7 cu.ft refrigerator",
      "Common lounge access",
      "Outdoor terrace seating",
      "Common kitchen access",
    ],
    suitableFor: ["Business travellers", "Budget-conscious guests", "Solo guests", "Short stays"],
    highlights: ["Shared-space access", "Refrigerator", "Executive value"],
    images: [
      "/greenlux/rooms/room-10-01.jpg",
      "/greenlux/rooms/room-10-02.jpg",
      "/greenlux/rooms/room-10-03.jpg",
      "/greenlux/rooms/room-10-05.jpg",
      "/greenlux/rooms/room-10-04.jpg",
      "/greenlux/rooms/room-10-06.jpg",
    ],
    imageAlt: "GreenLux Room 10 executive room and shared spaces",
    sourceUrl: "https://greenluxresidency.com/apartment/special-need-room/",
  },
  {
    name: "Room 9",
    slug: "room-9",
    type: "economy",
    categoryLabel: "Economy Room",
    stayType: "Private room",
    hook: "Smart economy room with a polished feel.",
    shortDescription:
      "An economy room with a polished grey finish, plush furnishings, and access to shared GreenLux spaces.",
    description:
      "Room 9 gives guests a clean, private room with a more polished feel than a basic stay. It works well for short trips, couples, and business travellers who want comfort at a sensible rate.",
    priceFromPkr: 7500,
    maxGuests: 2,
    amenities: [
      ...sharedAmenities,
      "Plush furnishings",
      "Common lounge access",
      "Terrace seating access",
      "Common kitchen access",
    ],
    suitableFor: ["Couples", "Business travellers", "Short stays", "Value-focused guests"],
    highlights: ["Economy price", "Polished finish", "Private room"],
    images: [
      "/greenlux/rooms/room-9-01.jpg",
      "/greenlux/rooms/room-9-02.jpg",
      "/greenlux/rooms/room-9-03.jpg",
      "/greenlux/rooms/room-9-04.jpg",
      "/greenlux/rooms/room-9-05.jpg",
      "/greenlux/rooms/room-9-06.jpg",
    ],
    imageAlt: "GreenLux Room 9 private room interiors",
    sourceUrl: "https://greenluxresidency.com/apartment/room-11/",
  },
  {
    name: "Budget Room 11",
    slug: "budget-room-11",
    type: "economy",
    categoryLabel: "Budget Room",
    stayType: "Private room",
    hook: "Simple, safe value for a short overnight stay.",
    shortDescription:
      "A simple private room for budget stays, solo guests, transit stops, and short visits.",
    description:
      "Budget Room 11 is the lowest-priced GreenLux option. It is best for guests who need a safe, simple, economical place to stay with access to shared lounge, terrace, and kitchen spaces.",
    priceFromPkr: 5500,
    maxGuests: 2,
    amenities: [
      "WiFi",
      "24/7 light",
      "Home safety",
      "Common lounge access",
      "Terrace seating access",
      "Common kitchen access",
    ],
    suitableFor: ["Budget stays", "Solo guests", "Short stays", "Transit guests"],
    highlights: ["Best nightly value", "Safe environment", "Shared executive spaces"],
    images: [
      "/greenlux/rooms/budget-room-11-01.jpg",
      "/greenlux/rooms/budget-room-11-02.jpg",
      "/greenlux/rooms/budget-room-11-03.jpg",
      "/greenlux/rooms/budget-room-11-04.jpg",
      "/greenlux/rooms/budget-room-11-05.jpg",
      "/greenlux/rooms/budget-room-11-06.jpg",
    ],
    imageAlt: "GreenLux Budget Room 11 private room",
    sourceUrl: "https://greenluxresidency.com/apartment/room-13/",
  },
];

export const featuredRooms = rooms.filter((room) =>
  ["studio-1", "apartment-4", "room-5"].includes(room.slug),
);

export const apartmentRooms = rooms.filter((room) => room.type === "apartment" || room.type === "club_class");

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}

export function getRelatedRooms(room: PublicRoom) {
  return rooms
    .filter((candidate) => candidate.slug !== room.slug)
    .sort((a, b) => {
      if (a.type === room.type && b.type !== room.type) return -1;
      if (b.type === room.type && a.type !== room.type) return 1;
      return Math.abs(a.priceFromPkr - room.priceFromPkr) - Math.abs(b.priceFromPkr - room.priceFromPkr);
    })
    .slice(0, 3);
}

export function formatPricePkr(price: number) {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(price);
}
