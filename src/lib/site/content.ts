import {
  BedDouble,
  Building2,
  Camera,
  CalendarClock,
  Clock3,
  ConciergeBell,
  CookingPot,
  CircleDollarSign,
  HeartHandshake,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Snowflake,
  Sofa,
  Sparkles,
  Tv,
  UsersRound,
  Utensils,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Amenity = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type GuestReview = {
  quote: string;
  source: string;
};

export type TrustSignal = {
  title: string;
  description: string;
};

export type PropertyMoment = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const trustHighlights = [
  {
    title: "Named rooms",
    description: "Choose a specific room, studio, or apartment before you message.",
    icon: BedDouble,
  },
  {
    title: "Calm privacy",
    description: "A quiet stay for families, business travellers, and repeat guests.",
    icon: UsersRound,
  },
  {
    title: "Easy arrival",
    description: "Already booked? Complete check-in before you reach.",
    icon: ShieldCheck,
  },
  {
    title: "Fast replies",
    description: "Ask for availability, rates, and arrival help on WhatsApp.",
    icon: HeartHandshake,
  },
];

export const amenities: Amenity[] = [
  { title: "WiFi", description: "Stay connected for work, calls, and entertainment.", icon: Wifi },
  { title: "24/7 light", description: "Reliable comfort for a more settled stay.", icon: Zap },
  { title: "Smart TV", description: "Relax with in-room entertainment where listed.", icon: Tv },
  { title: "Air conditioning", description: "Cool rooms for Rawalpindi and Islamabad visits.", icon: Snowflake },
  { title: "Refrigerator / freezer", description: "Keep drinks, snacks, and essentials chilled.", icon: ConciergeBell },
  { title: "Kitchen and dining", description: "Private or shared cooking space, depending on your stay.", icon: CookingPot },
  { title: "Microwave", description: "Useful for longer stays and quick meals.", icon: Utensils },
  { title: "Common lounge", description: "Comfortable shared seating for selected rooms.", icon: Sofa },
  { title: "Home safety", description: "A safer, family-friendly place to stay.", icon: Camera },
];

export const whyStayItems = [
  {
    title: "More privacy than a busy hotel",
    description: "Settle into a quieter stay with a room, studio, or full apartment.",
    icon: Building2,
  },
  {
    title: "Easy to ask before you book",
    description: "Send your dates on WhatsApp and get a clear answer.",
    icon: Clock3,
  },
  {
    title: "Close to Rawalpindi and Islamabad",
    description: "Useful for family visits, work trips, events, and medical travel.",
    icon: MapPin,
  },
  {
    title: "Simple from first message",
    description: "See the rooms, choose what fits, and confirm on WhatsApp.",
    icon: Sparkles,
  },
];

export const guestReviews: GuestReview[] = [
  {
    quote: "Totally worth it.",
    source: "Aoun, GreenLux guest",
  },
  {
    quote: "Good privacy.",
    source: "Khaleeq, GreenLux guest",
  },
  {
    quote: "Peaceful, clean, green, secured, safe.",
    source: "Muniba, GreenLux guest",
  },
  {
    quote: "Everything is good. Your place is peaceful.",
    source: "Booking.com traveller",
  },
  {
    quote: "Superb facilities & amenities.",
    source: "Booking.com traveller",
  },
  {
    quote: "A great place to stay.",
    source: "GreenLux guest",
  },
];

export const platformTrustSignals: TrustSignal[] = [
  {
    title: "Listed on Booking.com",
    description: "Guests can compare GreenLux on major travel platforms before booking direct.",
  },
  {
    title: "Listed on Airbnb",
    description: "Useful for guests who want platform-style confidence before messaging GreenLux.",
  },
  {
    title: "Direct WhatsApp booking",
    description: "Ask dates, rates, room fit, and arrival questions in one conversation.",
  },
  {
    title: "Online check-in after confirmation",
    description: "Already-booked guests can complete details before arrival.",
  },
  {
    title: "Review themes",
    description: "Guest excerpts mention privacy, cleanliness, peaceful stays, amenities, and helpful support.",
  },
];

export const directBookingBenefits = [
  {
    title: "Calm arrival support on WhatsApp",
    description: "Message before arrival so timing, location, and next steps feel clear.",
    icon: MessageCircle,
  },
  {
    title: "Direct communication with the stay team",
    description: "Speak with GreenLux about dates, room fit, and arrival details.",
    icon: CircleDollarSign,
  },
  {
    title: "Flexible stays for real travel plans",
    description: "Share family visits, work trips, medical plans, or short stays.",
    icon: HeartHandshake,
  },
  {
    title: "Easier booking without platform friction",
    description: "Book directly with prompt, human replies to your specific dates and needs.",
    icon: CalendarClock,
  },
];

export const propertyMoments: PropertyMoment[] = [
  {
    title: "Terrace seating",
    description: "A botanical outdoor corner for tea, calls, or a slower evening after travel.",
    image: "/greenlux/curation-review/homepage/09__common-area__Terrace-seating-updated.jpg",
    alt: "GreenLux Residency terrace seating and swing",
  },
  {
    title: "Shared dining",
    description: "Comfortable indoor space for selected rooms, useful when you want to sit outside your bedroom.",
    image: "/greenlux/curation-review/homepage/10__common-area__Shared-dining-dining-updated.webp",
    alt: "GreenLux Residency shared lounge and dining space",
  },
  {
    title: "Shared lounge",
    description: "A green open-air walkway and seating area that gives longer stays more breathing room.",
    image: "/greenlux/curation-review/homepage/11__common-area__shared-lounge-changed.jpg",
    alt: "GreenLux Residency premium rooftop terrace garden and common area",
  },
  {
    title: "First floor lounge",
    description: "A comfortable shared lounge for selected stays when you want a quiet place outside the room.",
    image: "/greenlux/curation-review/homepage/18__video-poster__First-floor-lounge__updated.webp",
    alt: "GreenLux Residency first floor lounge seating",
  },
  {
    title: "Studio terrace seating",
    description: "A private studio terrace corner for tea, fresh air, or a slower moment during a longer stay.",
    image: "/greenlux/curation-review/rooms/studio-1/06__gallery__Private-terrace-seating-corner__studio-1-terrace-garden-new.jpg",
    alt: "GreenLux Residency private studio terrace seating corner",
  },
  {
    title: "First floor kitchen",
    description: "Shared kitchen access where listed, useful for tea, snacks, simple meals, and longer visits.",
    image: "/greenlux/curation-review/rooms/room-5/first_floor_Kitchen.png",
    alt: "GreenLux Residency first floor shared kitchen",
  },
];

export const faqs = [
  {
    question: "How do I book GreenLux Residency?",
    answer:
      "Simply click our WhatsApp link to start a personal chat. Share your planned dates, guest count, and any preferences. Our team will personally review availability, offer the best direct rates, and guide you through check-in.",
  },
  {
    question: "Can I check in online after booking?",
    answer:
      "Yes. Already-booked guests can complete online check-in before arrival.",
  },
  {
    question: "Are studios and full apartments available?",
    answer:
      "Yes. GreenLux has studios, full apartments, deluxe rooms, executive rooms, and budget rooms.",
  },
  {
    question: "Is GreenLux suitable for families?",
    answer:
      "Yes. Families often choose GreenLux for privacy, space, and a quieter setting.",
  },
  {
    question: "Are amenities identical in every room?",
    answer:
      "No. Amenities vary by room. Each room page shows what is available for that stay.",
  },
  {
    question: "What payment methods does GreenLux accept?",
    answer:
      "GreenLux accepts bank transfer, cash, EasyPaisa, and JazzCash. The method and amount are confirmed at booking time. Bank transfers require proof of payment before the stay is confirmed.",
  },
];
