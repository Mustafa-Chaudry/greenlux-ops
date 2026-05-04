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

export const directBookingBenefits = [
  {
    title: "Faster response",
    description: "Send your dates and get a clear reply from the GreenLux team.",
    icon: MessageCircle,
  },
  {
    title: "No platform fees",
    description: "Ask for the direct rate for your dates.",
    icon: CircleDollarSign,
  },
  {
    title: "Direct communication",
    description: "Share arrival time, guest count, and room preference in one WhatsApp chat.",
    icon: HeartHandshake,
  },
  {
    title: "Flexible stays",
    description: "Ask about short stays, family trips, work visits, and longer bookings.",
    icon: CalendarClock,
  },
];

export const propertyMoments: PropertyMoment[] = [
  {
    title: "Terrace seating",
    description: "A calm outdoor corner for tea, calls, or a slower evening after travel.",
    image: "/greenlux/booking/booking-terrace-01.jpg",
    alt: "GreenLux Residency terrace seating with plants",
  },
  {
    title: "Shared lounge",
    description: "Extra sitting space for selected rooms, useful when you do not want to stay inside your bedroom.",
    image: "/greenlux/booking/booking-lounge-01.jpg",
    alt: "GreenLux Residency shared lounge seating",
  },
  {
    title: "Dining and kitchen access",
    description: "Practical shared spaces help short stays and longer visits feel easier.",
    image: "/greenlux/booking/booking-dining-01.jpg",
    alt: "GreenLux Residency common dining space",
  },
];

export const faqs = [
  {
    question: "How do I book GreenLux Residency?",
    answer:
      "Message GreenLux on WhatsApp with your dates, guest count, room preference, and arrival time. You will receive availability and rate details directly.",
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
];
