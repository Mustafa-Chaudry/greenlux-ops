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
    title: "Clean, prepared rooms",
    description: "Every stay is set up with practical comfort, clean bedding, and a calm arrival experience.",
    icon: Sparkles,
  },
  {
    title: "Secure environment",
    description: "CCTV/security, managed access, and a peaceful setting for families and business guests.",
    icon: ShieldCheck,
  },
  {
    title: "Family-friendly privacy",
    description: "A respectful home-like stay for families, overseas visitors, medical guests, and longer visits.",
    icon: UsersRound,
  },
  {
    title: "Responsive management",
    description: "WhatsApp-first support before arrival, during check-in, and throughout the stay.",
    icon: HeartHandshake,
  },
];

export const amenities: Amenity[] = [
  { title: "Wi-Fi", description: "Reliable connectivity for work, calls, and entertainment.", icon: Wifi },
  { title: "Smart TV", description: "In-room entertainment for relaxed evenings.", icon: Tv },
  { title: "AC comfort", description: "Air-conditioned rooms for Rawalpindi summers.", icon: Snowflake },
  { title: "Refrigerator", description: "Available depending on room or apartment type.", icon: ConciergeBell },
  { title: "Kitchen access", description: "Useful for studios, apartments, and longer stays.", icon: CookingPot },
  { title: "Dining space", description: "Shared or private dining access depending on unit.", icon: Utensils },
  { title: "Backup power", description: "Practical support for a more consistent stay.", icon: Zap },
  { title: "CCTV/security", description: "Managed security for added peace of mind.", icon: Camera },
  { title: "Rooftop sitting", description: "Outdoor terrace and common areas for quiet downtime.", icon: Sofa },
];

export const whyStayItems = [
  {
    title: "Hotel-level consistency",
    description: "Reliable basics, responsive service, and managed standards without the feel of a crowded hotel.",
    icon: BedDouble,
  },
  {
    title: "Home-like comfort",
    description: "Private rooms and apartments with the flexibility families and longer-stay guests often need.",
    icon: Building2,
  },
  {
    title: "Helpful location",
    description: "A practical base for Rawalpindi and Islamabad visits, including work, medical, family, and events.",
    icon: MapPin,
  },
  {
    title: "Simple arrival flow",
    description: "WhatsApp booking, clear communication, and secure ID verification before check-in.",
    icon: Clock3,
  },
];

export const reviewThemes = [
  {
    quote: "Peaceful, clean, and easy for families who want privacy during their stay.",
    label: "Family stay theme",
  },
  {
    quote: "The host response and check-in communication make short visits feel managed and predictable.",
    label: "Business guest theme",
  },
  {
    quote: "A practical home-like base for medical appointments, events, and longer visits.",
    label: "Longer-stay theme",
  },
];

export const faqs = [
  {
    question: "How do I check availability?",
    answer:
      "The fastest way is WhatsApp. Share your dates, number of guests, room preference, and arrival time so management can confirm availability and rate.",
  },
  {
    question: "Is GreenLux suitable for families?",
    answer:
      "Yes. The stay is positioned for families who need a clean, calm, secure, and respectful environment with responsive management.",
  },
  {
    question: "Do guests need to provide ID?",
    answer:
      "Yes. CNIC or passport verification is required for booking verification, safety, and stay records.",
  },
  {
    question: "Are longer stays available?",
    answer:
      "Yes. Studios and apartments are especially suitable for longer stays. Message your dates to discuss availability and rate options.",
  },
  {
    question: "Is payment proof required?",
    answer:
      "Payment proof may be requested for bank transfer or online payments so management can verify the booking before arrival.",
  },
];

