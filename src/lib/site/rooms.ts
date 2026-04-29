export type RoomType = "economy_room" | "executive_room" | "deluxe_room" | "studio" | "apartment";

export type PublicRoom = {
  name: string;
  slug: string;
  type: RoomType;
  shortDescription: string;
  description: string;
  priceFromPkr: number;
  maxGuests: number;
  amenities: string[];
  suitableFor: string[];
  highlights: string[];
  imageUrl: string;
  imageAlt: string;
};

export const rooms: PublicRoom[] = [
  {
    name: "Economy Room",
    slug: "economy-room",
    type: "economy_room",
    shortDescription: "A clean, secure stay for guests who want comfort and value without compromising basics.",
    description:
      "The Economy Room is designed for short stays, solo guests, and couples who need a peaceful, well-managed base in Rawalpindi. It keeps the essentials simple: clean bedding, AC comfort, Wi-Fi, Smart TV, and responsive support.",
    priceFromPkr: 5500,
    maxGuests: 2,
    amenities: ["Wi-Fi", "Smart TV", "AC", "CCTV/security", "Backup power"],
    suitableFor: ["Solo guests", "Couples", "Short business visits", "Budget-conscious family visits"],
    highlights: ["Best value", "Quiet environment", "Fast WhatsApp support"],
    imageUrl: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Clean serviced room with neutral bedding and warm lighting",
  },
  {
    name: "Executive Room",
    slug: "executive-room",
    type: "executive_room",
    shortDescription: "A quiet, practical room for business visitors and comfortable family stopovers.",
    description:
      "The Executive Room adds a more settled feel for guests who need convenience during work trips, medical visits, or family travel. It balances calm privacy with easy access to management support when needed.",
    priceFromPkr: 6500,
    maxGuests: 2,
    amenities: ["Wi-Fi", "Smart TV", "AC", "Refrigerator", "CCTV/security", "Backup power"],
    suitableFor: ["Business visitors", "Medical visitors", "Overseas Pakistanis", "Couples"],
    highlights: ["Work-friendly", "Refrigerator", "Consistent service"],
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Premium hotel-style room with desk, bed, and soft lighting",
  },
  {
    name: "Deluxe Room",
    slug: "deluxe-room",
    type: "deluxe_room",
    shortDescription: "A more spacious room with added comfort for families, events, and longer stays.",
    description:
      "The Deluxe Room is suited to guests who want a little more room to settle in. It works well for families, event visitors, and guests staying several nights who appreciate privacy, cleanliness, and reliable amenities.",
    priceFromPkr: 7500,
    maxGuests: 3,
    amenities: ["Wi-Fi", "Smart TV", "AC", "Refrigerator", "Dining access", "CCTV/security", "Backup power"],
    suitableFor: ["Small families", "Wedding guests", "Medical visitors", "Longer stays"],
    highlights: ["More space", "Dining access", "Family-friendly"],
    imageUrl: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Spacious serviced room with seating, bed, and warm decor",
  },
  {
    name: "Studio Apartment",
    slug: "studio-apartment",
    type: "studio",
    shortDescription: "A self-contained serviced studio with home-style convenience for longer visits.",
    description:
      "The Studio Apartment gives guests a compact home-like setup with space to rest, dine, and manage a longer visit comfortably. It is a strong fit for couples, business travelers, and overseas guests who prefer privacy.",
    priceFromPkr: 8500,
    maxGuests: 3,
    amenities: ["Wi-Fi", "Smart TV", "AC", "Refrigerator", "Kitchen access", "Dining access", "CCTV/security"],
    suitableFor: ["Couples", "Longer-stay guests", "Business visitors", "Overseas Pakistanis"],
    highlights: ["Home-like layout", "Kitchen access", "Private stay"],
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267f?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Modern studio apartment with seating, dining space, and bedroom area",
  },
  {
    name: "Full Apartment",
    slug: "full-apartment",
    type: "apartment",
    shortDescription: "A complete serviced apartment for families and groups needing privacy and space.",
    description:
      "The Full Apartment is the most spacious option for families, groups, wedding guests, and longer stays. It offers a home-like environment with practical amenities, secure surroundings, and management close at hand.",
    priceFromPkr: 9500,
    maxGuests: 5,
    amenities: [
      "Wi-Fi",
      "Smart TV",
      "AC",
      "Refrigerator",
      "Kitchen",
      "Dining area",
      "Common lounge",
      "Rooftop/outdoor sitting",
      "CCTV/security",
      "Backup power",
    ],
    suitableFor: ["Families", "Groups", "Wedding visitors", "Extended stays", "Overseas Pakistanis"],
    highlights: ["Most spacious", "Full kitchen", "Rooftop/outdoor sitting"],
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=82",
    imageAlt: "Comfortable serviced apartment bedroom with home-style furnishings",
  },
];

export const featuredRooms = rooms.filter((room) =>
  ["executive-room", "studio-apartment", "full-apartment"].includes(room.slug),
);

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}

export function formatPricePkr(price: number) {
  return new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0,
  }).format(price);
}

