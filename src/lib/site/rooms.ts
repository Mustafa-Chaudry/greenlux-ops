export type RoomType = "club_class" | "deluxe" | "executive" | "economy" | "apartment";

export type PublicRoom = {
  name: string;
  slug: string;
  type: RoomType;
  categoryLabel: string;
  stayType: "Studio apartment" | "Private room" | "Full apartment";
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
    shortDescription:
      "Cedar-toned club class studio with a private terrace garden, kitchen essentials, and generous serviced-apartment comfort.",
    description:
      "Studio 1 is a club class studio apartment for guests who want privacy, warmth, and a more residential stay than a standard hotel room. The current GreenLux room page highlights cedar wood interiors, a private terrace garden, kitchen and dining essentials, microwave, refrigerator, toaster, iron, and a 65 inch Smart TV.",
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
    suitableFor: ["Couples", "Business travellers", "Long stays", "Direct WhatsApp bookings"],
    highlights: ["Private terrace", "Kitchen setup", "Club class privacy"],
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
    shortDescription:
      "A polished studio apartment with warm finishes, practical amenities, and the privacy repeat guests expect.",
    description:
      "Studio 2 follows GreenLux's club class studio positioning: a self-contained, comfortable stay with a calm residential feel. It is best for guests comparing Airbnb-style independence with managed hospitality and fast WhatsApp support.",
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
    highlights: ["Studio layout", "Kitchen essentials", "Warm residential feel"],
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
    shortDescription:
      "One-bedroom apartment with independent bedroom, separate lounge and dining, kitchen, walk-in dresser, and two terraces.",
    description:
      "Apartment 3 is a full-featured one-bedroom apartment for guests who want space and separation. The GreenLux room page notes an independent bedroom, separate TV lounge and dining, kitchen, walk-in dresser, spacious bathroom, and two terraces including one for laundry.",
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
    suitableFor: ["Families", "Long stays", "Business travellers", "Guests needing extra space"],
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
    shortDescription:
      "Split-level apartment with bedroom, work nook, bathroom, terrace, large private kitchen, and private lounge.",
    description:
      "Apartment 4 is designed for guests who want a more independent apartment-style stay. The upper level includes the bedroom, small seating or working space, bathroom, and back terrace, while the lower level includes a large private kitchen and private lounge.",
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
    shortDescription:
      "Elegant deluxe room with warm woodwork, a refined grey palette, and access to shared GreenLux spaces.",
    description:
      "Room 5 is a deluxe private room where the current listing highlights crafted wall woodwork and a sleek grey color theme. It is a strong choice for guests who want hotel-style privacy with the softer character of a boutique serviced residence.",
    priceFromPkr: 7500,
    maxGuests: 3,
    amenities: [
      ...sharedAmenities,
      "Refrigerator access",
      "Common lounge access",
      "Terrace seating access",
      "Common kitchen access",
    ],
    suitableFor: ["Couples", "Business travellers", "Short stays", "Repeat direct guests"],
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
    shortDescription:
      "Deluxe room with plush furnishings and a composed grey interior for a quiet, premium short stay.",
    description:
      "Room 7 is positioned as a deluxe room on the current WordPress listing, with a sophisticated grey palette and plush furnishings. It suits guests who want comfort, privacy, and direct booking support without moving into a full apartment.",
    priceFromPkr: 7500,
    maxGuests: 3,
    amenities: [
      ...sharedAmenities,
      "Plush furnishings",
      "Common lounge access",
      "Terrace seating access",
      "Refrigerator access",
    ],
    suitableFor: ["Couples", "Short stays", "Business travellers", "Airbnb-style guests"],
    highlights: ["Plush setup", "Deluxe privacy", "Common spaces"],
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
    shortDescription:
      "Mid-size executive room for practical guests who want privacy, security, and common-area access.",
    description:
      "Room 6 is a mid-size executive room for budget-conscious guests who still want the GreenLux common-use facilities, ambiance, security, and privacy. It is a practical base for business visits and short stays.",
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
    highlights: ["Executive value", "Common lounge", "Secure private room"],
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
    shortDescription:
      "Executive room with refrigerator, air conditioning, and easy access to the lounge, terrace seating, and kitchen.",
    description:
      "Room 10 is listed as a mid-size executive room for guests who want common-use facilities with security and privacy. The WordPress rooms page notes a 7 cu.ft refrigerator, 1200 BTU air conditioner, and direct access to the common lounge, outdoor terrace seating, and kitchen.",
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
    highlights: ["Direct common-area access", "Refrigerator", "Executive value"],
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
    shortDescription:
      "Economy-category room with a deluxe-feeling grey palette and plush furnishings at a direct-booking rate.",
    description:
      "Room 9 appears on the current rooms page as an economy room at Rs 7,500, described with a sleek grey palette and plush furnishings. It is a useful option for guests who want a refined private room while still comparing value across platforms.",
    priceFromPkr: 7500,
    maxGuests: 2,
    amenities: [
      ...sharedAmenities,
      "Plush furnishings",
      "Common lounge access",
      "Terrace seating access",
      "Common kitchen access",
    ],
    suitableFor: ["Couples", "Business travellers", "Short stays", "Direct WhatsApp bookings"],
    highlights: ["Economy category", "Polished finish", "Fast confirmation"],
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
    shortDescription:
      "Simple, secure room for guests who need an economical overnight stay with access to shared executive spaces.",
    description:
      "Budget Room 11 is the most economical visible option on the current GreenLux rooms page. The listing positions it for guests on a tighter budget who still want a safe, friendly environment for the night and access to executive common spaces.",
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
