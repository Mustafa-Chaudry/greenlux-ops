import {
  BedDouble,
  Building2,
  Camera,
  Clock3,
  ConciergeBell,
  CookingPot,
  HeartHandshake,
  MapPin,
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

export const trustHighlights = [
  {
    title: "Real serviced inventory",
    description: "Browse named GreenLux units with direct WhatsApp confirmation before you travel.",
    icon: BedDouble,
  },
  {
    title: "Family-friendly privacy",
    description: "A calm, respectful stay for families, overseas guests, medical visitors, and repeat guests.",
    icon: UsersRound,
  },
  {
    title: "Managed check-in",
    description: "Already booked guests can complete online check-in before arrival for a smoother handover.",
    icon: ShieldCheck,
  },
  {
    title: "Responsive booking support",
    description: "WhatsApp remains the fastest route for availability, rates, location guidance, and arrival timing.",
    icon: HeartHandshake,
  },
];

export const amenities: Amenity[] = [
  { title: "WiFi", description: "Connectivity for work calls, messaging, and entertainment.", icon: Wifi },
  { title: "24/7 light", description: "Practical continuity support for a more settled stay.", icon: Zap },
  { title: "Smart TV", description: "In-room entertainment in the listed rooms and apartments.", icon: Tv },
  { title: "Air conditioning", description: "Cooling comfort for Rawalpindi and Islamabad visits.", icon: Snowflake },
  { title: "Refrigerator / freezer", description: "Available in rooms, studios, or shared areas depending on unit.", icon: ConciergeBell },
  { title: "Kitchen and dining", description: "Private or common kitchen and dining access depending on room type.", icon: CookingPot },
  { title: "Microwave", description: "Available in studio and apartment-style stays where noted by GreenLux.", icon: Utensils },
  { title: "Common lounge", description: "Shared executive lounge access for selected private rooms.", icon: Sofa },
  { title: "Home safety", description: "Managed access and verification support a safer family-friendly environment.", icon: Camera },
];

export const whyStayItems = [
  {
    title: "Boutique aparthotel feel",
    description: "A more personal alternative to a large hotel, with named rooms, studios, and full apartments.",
    icon: Building2,
  },
  {
    title: "Clear direct booking",
    description: "Guests compare on Airbnb and hotel platforms, then confirm availability quickly through WhatsApp.",
    icon: Clock3,
  },
  {
    title: "Rawalpindi / Islamabad base",
    description: "Convenient for family visits, business schedules, events, medical trips, and longer stays.",
    icon: MapPin,
  },
  {
    title: "Comfort without overcomplication",
    description: "No booking engine or payment portal here yet, just practical room information and fast contact.",
    icon: Sparkles,
  },
];

export const reviewThemes = [
  {
    quote: "Clean, calm, and private enough for a family stay.",
    label: "Family guest priority",
  },
  {
    quote: "Fast host response matters when arrival plans change.",
    label: "Business traveller priority",
  },
  {
    quote: "Apartment-style space makes repeat and longer stays easier.",
    label: "Long-stay priority",
  },
];

export const faqs = [
  {
    question: "How do I book GreenLux Residency?",
    answer:
      "Message GreenLux on WhatsApp with your dates, number of guests, room preference, and arrival time. Management confirms availability and the final rate directly.",
  },
  {
    question: "Can I check in online after booking?",
    answer:
      "Yes. Already-booked guests can use the online check-in link to complete guest details before arrival.",
  },
  {
    question: "Are studios and full apartments available?",
    answer:
      "Yes. GreenLux lists Studio 1, Studio 2, Apartment 3, and Apartment 4 alongside private rooms.",
  },
  {
    question: "Is GreenLux suitable for families?",
    answer:
      "Yes. The public positioning is family-friendly, privacy-focused, and practical for Rawalpindi and Islamabad visits.",
  },
  {
    question: "Are amenities identical in every room?",
    answer:
      "No. Amenities vary by room type. The room detail pages list the amenities found on GreenLux's current pages or described cautiously where shared facilities apply.",
  },
];
