export type RoomType = "club_class" | "deluxe" | "executive" | "economy" | "apartment";

export type PublicRoom = {
  name: string;
  slug: string;
  type: RoomType;
  categoryLabel: string;
  stayType: "Studio apartment" | "Private room" | "Full apartment";
  hook: string;
  decisionLabel: string;
  shortDescription: string;
  description: string;
  priceFromPkr: number;
  maxGuests: number;
  sizeLabel?: string;
  amenities: string[];
  suitableFor: string[];
  highlights: string[];
  whyChoose: string[];
  images: string[];
  galleryLabels: string[];
  imageAlt: string;
  videoTourSlug?: string;
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
    decisionLabel: "More space for longer visits",
    shortDescription:
      "A warm studio with terrace garden, kitchen basics, refrigerator, microwave, and a 65 inch Smart TV.",
    description:
      "Choose Studio 1 when you want privacy, outdoor space, and the ease of a small apartment. The terrace garden gives you a quiet corner, while the kitchen basics, refrigerator, microwave, toaster, iron, and Smart TV help longer stays feel settled.",
    priceFromPkr: 10000,
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
    whyChoose: [
      "More breathing room than a standard room.",
      "Useful kitchen basics for longer stays.",
      "Private terrace space when you want quiet air outside.",
    ],
    images: [
      "/greenlux/rooms/studio-1-curated-01.png",
      "/greenlux/rooms/studio-1-curated-02.jpg",
      "/greenlux/rooms/studio-1-curated-03.jpg",
      "/greenlux/rooms/studio-1-curated-04.jpg",
      "/greenlux/rooms/studio-1-curated-05.jpg",
      "/greenlux/rooms/studio-1-curated-06.jpg",
      "/greenlux/rooms/studio-1-curated-07.jpg",
      "/greenlux/rooms/studio-1-curated-08.jpg",
      "/greenlux/rooms/studio-1-curated-09.jpg",
    ],
    galleryLabels: [
      "Studio 1",
      "Cosy living area with 65 inch Smart TV",
      "Private terrace seating corner",
      "Lush green private terrace garden",
      "Private terrace seating corner",
      "Modern vanity with premium marble finish",
      "Clean enclosed shower cabin",
      "Private kitchenette with microwave and fridge",
      "Private kitchenette with Stove and sink",
    ],
    imageAlt: "GreenLux Studio 1 room gallery",
    videoTourSlug: "studio-tour",
    sourceUrl: "https://greenluxresidency.com/apartment/studio-1/",
  },
  {
    name: "Studio 2",
    slug: "studio-2",
    type: "club_class",
    categoryLabel: "Club Class Studio",
    stayType: "Studio apartment",
    hook: "Warm studio with garden access and kitchen basics.",
    decisionLabel: "Best for couples",
    shortDescription:
      "A private studio with warm finishes, kitchen essentials, refrigerator, freezer, and terrace access.",
    description:
      "Studio 2 works well when you want a private room with more independence. It gives you a calm studio feel, useful kitchen essentials, and easy access to shared outdoor space.",
    priceFromPkr: 10000,
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
    whyChoose: [
      "Private studio feel without booking a full apartment.",
      "Kitchen essentials make short stays easier.",
      "Good balance of comfort, privacy, and value.",
    ],
    images: [
      "/greenlux/rooms/studio-2-curated-01.jpg",
      "/greenlux/rooms/studio-2-curated-02.jpg",
      "/greenlux/rooms/studio-2-curated-03.avif",
      "/greenlux/rooms/studio-2-curated-04.jpg",
      "/greenlux/rooms/studio-2-curated-05.jpg",
      "/greenlux/rooms/studio-2-curated-06.jpg",
      "/greenlux/rooms/studio-2-curated-07.jpg",
      "/greenlux/rooms/studio-2-curated-08.jpg",
      "/greenlux/rooms/studio-2-curated-09.jpg",
    ],
    galleryLabels: [
      "Studio 2",
      "65 inch tv study desk and sitting area",
      "Double bed and ambient bedside lighting",
      "Dedicated private terrace garden",
      "Private bathroom vanity",
      "Clean rain shower cabin",
      "Compact kitchenette with microwave and fridge",
      "Compact kitchenette with stove",
      "Dedicated private terrace garden",
    ],
    imageAlt: "GreenLux Studio 2 room gallery",
    videoTourSlug: "studio-2-tour",
    sourceUrl: "https://greenluxresidency.com/apartment/studio-2/",
  },
  {
    name: "Apartment 3",
    slug: "apartment-3",
    type: "apartment",
    categoryLabel: "One-Bed Apartment",
    stayType: "Full apartment",
    hook: "Best for families who need space to settle.",
    decisionLabel: "Best for families",
    shortDescription:
      "A one-bedroom apartment with separate lounge, dining area, kitchen, walk-in dresser, and two terraces.",
    description:
      "Apartment 3 is a strong choice for families and longer stays. You get a separate bedroom, TV lounge, dining area, kitchen, walk-in dresser, spacious bathroom, and two terraces, including a laundry terrace.",
    priceFromPkr: 10000,
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
    whyChoose: [
      "Separate lounge and bedroom give families more privacy.",
      "Private kitchen and dining area suit longer visits.",
      "Two terraces add extra space beyond the room.",
    ],
    images: [
      "/greenlux/rooms/apartment-3-curated-01.jpg",
      "/greenlux/rooms/apartment-3-curated-02.jpg",
      "/greenlux/rooms/apartment-3-curated-03.jpg",
      "/greenlux/rooms/apartment-3-curated-04.avif",
      "/greenlux/rooms/apartment-3-curated-05.jpg",
      "/greenlux/rooms/apartment-3-curated-06.jpg",
      "/greenlux/rooms/apartment-3-curated-07.jpg",
      "/greenlux/rooms/apartment-3-curated-08.avif",
      "/greenlux/rooms/apartment-3-curated-09.jpg",
      "/greenlux/rooms/apartment-3-curated-10.jpg",
      "/greenlux/rooms/apartment-3-curated-11.jpg",
      "/greenlux/rooms/apartment-3-curated-12.jpg",
      "/greenlux/rooms/apartment-3-curated-13.jpg",
      "/greenlux/rooms/apartment-3-curated-14.jpg",
    ],
    galleryLabels: [
      "Apartment 3",
      "Master bedroom with ambient evening lights",
      "Lounge doorway",
      "Spacious separate TV lounge and seating",
      "Dedicated dining table for four",
      "Dedicated dining table for four",
      "Private kitchen with microwave and storage",
      "Private kitchen with microwave and fridge",
      "Spacious modern bathroom vanity",
      "Premium walk in rain shower",
      "Hanging swing chair on private terrace",
      "Primary private terrace garden",
      "Terrace seating 01",
      "Terrace walkway 01",
    ],
    imageAlt: "GreenLux Apartment 3 room gallery",
    videoTourSlug: "one-bed-apartment-tour",
    sourceUrl: "https://greenluxresidency.com/apartment/apartment-3/",
  },
  {
    name: "Apartment 4",
    slug: "apartment-4",
    type: "apartment",
    categoryLabel: "Split-Level Apartment",
    stayType: "Full apartment",
    hook: "Split-level space for work, rest, and family stays.",
    decisionLabel: "Most apartment-style",
    shortDescription:
      "A split-level apartment with bedroom, work nook, bathroom, terrace, private kitchen, and lounge.",
    description:
      "Apartment 4 gives you a bedroom and seating or work corner upstairs, plus a private kitchen and lounge downstairs. It suits families, small groups, and business stays that need more room than a private bedroom.",
    priceFromPkr: 11000,
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
    whyChoose: [
      "Bedroom, lounge, and kitchen are separated across levels.",
      "Better for families or guests who need a work corner.",
      "A stronger choice when you want apartment privacy.",
    ],
    images: [
      "/greenlux/rooms/apartment-4-curated-01.jpg",
      "/greenlux/rooms/apartment-4-curated-02.jpg",
      "/greenlux/rooms/apartment-4-curated-03.jpg",
      "/greenlux/rooms/apartment-4-curated-04.jpg",
      "/greenlux/rooms/apartment-4-curated-05.jpg",
      "/greenlux/rooms/apartment-4-curated-06.jpg",
      "/greenlux/rooms/apartment-4-curated-07.jpg",
    ],
    galleryLabels: [
      "Apartment 4",
      "Refined workspace nook and bedroom angle",
      "Upper level sitting area and secondary lounge",
      "Clean private bathroom",
      "Spacious private kitchen downstairs",
      "Cosy private living room and TV lounge",
      "Private downstairs TV lounge with home cinema projector setup",
    ],
    imageAlt: "GreenLux Apartment 4 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/apartment-4/",
  },
  {
    name: "Room 5",
    slug: "room-5",
    type: "deluxe",
    categoryLabel: "Deluxe Room",
    stayType: "Private room",
    hook: "Polished deluxe room for quiet short stays.",
    decisionLabel: "Quiet deluxe option",
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
    whyChoose: [
      "A polished private room for short Rawalpindi stays.",
      "Good for guests who want comfort without a full apartment.",
      "Shared lounge and terrace access add space outside the room.",
    ],
    images: [
      "/greenlux/rooms/room-5-curated-01.jpg",
      "/greenlux/rooms/room-5-curated-02.jpg",
      "/greenlux/rooms/room-5-curated-03.jpg",
      "/greenlux/rooms/room-5-curated-04.jpg",
      "/greenlux/rooms/room-5-curated-05.jpg",
      "/greenlux/rooms/room-5-curated-06.webp",
      "/greenlux/rooms/room-5-curated-07.png",
      "/greenlux/rooms/room-5-curated-08.jpg",
      "/greenlux/rooms/room-5-curated-09.jpg",
      "/greenlux/rooms/room-5-curated-10.jpg",
    ],
    galleryLabels: [
      "Room 5",
      "Polished wardrobe and storage",
      "Clean private bathroom",
      "Bed area and reading corner",
      "Alternate room angle",
      "First floor lounde",
      "First floor Kitchen",
      "First floor dining new",
      "Hero terrace",
      "Stairs mosaic",
    ],
    imageAlt: "GreenLux Room 5 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/room-5/",
  },
  {
    name: "Room 7",
    slug: "room-7",
    type: "deluxe",
    categoryLabel: "Deluxe Room",
    stayType: "Private room",
    hook: "Comfortable deluxe room with a calm grey finish.",
    decisionLabel: "Best for short stays",
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
    whyChoose: [
      "Private deluxe room with a calmer finish.",
      "Good fit for couples and work trips.",
      "Shared GreenLux spaces give you somewhere to sit outside the room.",
    ],
    images: [
      "/greenlux/rooms/room-7-curated-01.jpg",
      "/greenlux/rooms/room-7-curated-02.jpg",
      "/greenlux/rooms/room-7-curated-03.jpg",
      "/greenlux/rooms/room-7-curated-04.jpg",
      "/greenlux/rooms/room-7-curated-05.jpg",
      "/greenlux/rooms/room-7-curated-06.jpg",
      "/greenlux/rooms/room-7-curated-07.jpg",
      "/greenlux/rooms/room-7-curated-08.webp",
      "/greenlux/rooms/room-7-curated-09.png",
      "/greenlux/rooms/room-7-curated-10.jpg",
      "/greenlux/rooms/room-7-curated-11.jpg",
      "/greenlux/rooms/room-7-curated-12.jpg",
    ],
    galleryLabels: [
      "Room 7",
      "Cosy bed area",
      "Alternate room angle",
      "Seating corner",
      "Shared lounge and common access",
      "Bathrom vanity shower",
      "Toilet",
      "First floor lounde",
      "First floor Kitchen",
      "First floor dining new",
      "Hero terrace",
      "Stairs mosaic",
    ],
    imageAlt: "GreenLux Room 7 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/room-7/",
  },
  {
    name: "Room 6",
    slug: "room-6",
    type: "executive",
    categoryLabel: "Executive Room",
    stayType: "Private room",
    hook: "Quiet executive stay with strong value.",
    decisionLabel: "Quiet executive option",
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
    whyChoose: [
      "A simple private room at a sensible rate.",
      "Good for solo guests and business stays.",
      "Access to shared lounge, terrace, and kitchen areas.",
    ],
    images: [
      "/greenlux/rooms/room-6-curated-01.jpg",
      "/greenlux/rooms/room-6-curated-02.jpg",
      "/greenlux/rooms/room-6-curated-03.jpg",
      "/greenlux/rooms/room-6-curated-04.webp",
      "/greenlux/rooms/room-6-curated-05.png",
      "/greenlux/rooms/room-6-curated-06.jpg",
      "/greenlux/rooms/room-6-curated-07.jpg",
      "/greenlux/rooms/room-6-curated-08.jpg",
    ],
    galleryLabels: [
      "Room 6",
      "Desk corner and room view",
      "Private shower room",
      "First floor lounde",
      "First floor Kitchen",
      "First floor dining new",
      "Hero terrace",
      "Stairs mosaic",
    ],
    imageAlt: "GreenLux Room 6 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/room-6/",
  },
  {
    name: "Room 10",
    slug: "room-10",
    type: "executive",
    categoryLabel: "Executive Room",
    stayType: "Private room",
    hook: "Executive room close to lounge and terrace spaces.",
    decisionLabel: "Executive value",
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
    whyChoose: [
      "Private room with useful shared spaces nearby.",
      "Good value for business travellers and solo guests.",
      "Refrigerator, AC, WiFi, and lounge access keep the stay practical.",
    ],
    images: [
      "/greenlux/rooms/room-10-curated-01.jpg",
      "/greenlux/rooms/room-10-curated-02.jpg",
      "/greenlux/rooms/room-10-curated-03.jpg",
      "/greenlux/rooms/room-10-curated-04.jpg",
      "/greenlux/rooms/room-10-curated-05.jpg",
      "/greenlux/rooms/room-10-curated-06.png",
      "/greenlux/rooms/room-10-curated-07.jpg",
      "/greenlux/rooms/room-10-curated-08.jpg",
    ],
    galleryLabels: [
      "Room 10",
      "In room refrigerator and desk",
      "Clean private bathroom",
      "Shared kitchen access",
      "Shared terrace seating",
      "First floor Kitchen",
      "Ground floor lounnge",
      "Hero terrace",
    ],
    imageAlt: "GreenLux Room 10 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/special-need-room/",
  },
  {
    name: "Room 9",
    slug: "room-9",
    type: "economy",
    categoryLabel: "Economy Room",
    stayType: "Private room",
    hook: "Smart economy room with a polished feel.",
    decisionLabel: "Budget-friendly short stay",
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
    whyChoose: [
      "Lower-cost private room with a more polished feel.",
      "Good for short stays and work visits.",
      "Access to shared lounge, terrace, and kitchen spaces.",
    ],
    images: [
      "/greenlux/rooms/room-9-curated-01.jpg",
      "/greenlux/rooms/room-9-curated-02.jpg",
      "/greenlux/rooms/room-9-curated-03.jpg",
      "/greenlux/rooms/room-9-curated-04.jpg",
      "/greenlux/rooms/room-9-curated-05.jpg",
      "/greenlux/rooms/room-9-curated-06.jpg",
      "/greenlux/rooms/room-9-curated-07.png",
      "/greenlux/rooms/room-9-curated-08.jpg",
      "/greenlux/rooms/room-9-curated-09.jpg",
    ],
    galleryLabels: [
      "Room 9",
      "Room layout and wardrobe",
      "Private bathroom",
      "Shared first floor lounge",
      "Shared dining and kitchen access",
      "Shared terrace garden",
      "First floor Kitchen",
      "Ground floor lounnge",
      "Hero terrace",
    ],
    imageAlt: "GreenLux Room 9 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/room-11/",
  },
  {
    name: "Budget Room 11",
    slug: "budget-room-11",
    type: "economy",
    categoryLabel: "Budget Room",
    stayType: "Private room",
    hook: "Simple, safe value for a short overnight stay.",
    decisionLabel: "Best value stay",
    shortDescription:
      "A clean, secure, and economical private base for solo travellers, transit stops, and short overnight stays.",
    description:
      "Budget Room 11 offers a clean, secure, and highly economical private base. It is ideal for solo travellers, quick transit stops, or short overnight stays, with access to GreenLux shared lounges, terrace seating, and kitchen spaces.",
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
    whyChoose: [
      "A highly economical GreenLux private room.",
      "Best when you need a simple, clean overnight stay.",
      "Shared lounge, terrace, and kitchen access keep it practical.",
    ],
    images: [
      "/greenlux/rooms/budget-room-11-curated-01.jpg",
      "/greenlux/rooms/budget-room-11-curated-02.jpg",
      "/greenlux/rooms/budget-room-11-curated-03.jpg",
      "/greenlux/rooms/budget-room-11-curated-04.jpg",
      "/greenlux/rooms/budget-room-11-curated-05.jpg",
      "/greenlux/rooms/budget-room-11-curated-06.jpg",
      "/greenlux/rooms/budget-room-11-curated-07.png",
      "/greenlux/rooms/budget-room-11-curated-08.jpg",
      "/greenlux/rooms/budget-room-11-curated-09.jpg",
    ],
    galleryLabels: [
      "Budget Room 11",
      "Shared living room access",
      "Clean private bathroom",
      "Shared kitchen and dining",
      "Residency secure entryway",
      "Bathroom vanity detail",
      "First floor Kitchen",
      "Ground floor lounnge",
      "Hero terrace",
    ],
    imageAlt: "GreenLux Budget Room 11 room gallery",
    sourceUrl: "https://greenluxresidency.com/apartment/room-13/",
  },
];

export const featuredRooms = rooms.filter((room) =>
  ["studio-2", "apartment-3", "apartment-4", "room-5"].includes(room.slug),
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
