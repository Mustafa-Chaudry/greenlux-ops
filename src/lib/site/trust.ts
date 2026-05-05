export type PlatformRating = {
  id: string;
  platform: "Booking.com" | "Airbnb" | "Skyscanner";
  score: string;
  scale: string;
  label: string;
  reviewCount: string;
  context: string;
  sourceLabel: string;
  roomSlug?: string;
};

export const platformRatings: PlatformRating[] = [
  {
    id: "booking-property",
    platform: "Booking.com",
    score: "8.8",
    scale: "/ 10",
    label: "Fabulous",
    reviewCount: "161 reviews",
    context: "Property listing",
    sourceLabel: "Booking.com",
  },
  {
    id: "airbnb-studio-1",
    platform: "Airbnb",
    score: "4.86",
    scale: "/ 5",
    label: "Guest favorite",
    reviewCount: "21 reviews",
    context: "Studio 1 listing",
    sourceLabel: "Airbnb",
    roomSlug: "studio-1",
  },
  {
    id: "airbnb-budget-room",
    platform: "Airbnb",
    score: "4.69",
    scale: "/ 5",
    label: "Budget Room listing",
    reviewCount: "13 reviews",
    context: "Budget Room listing",
    sourceLabel: "Airbnb",
    roomSlug: "budget-room-11",
  },
  {
    id: "airbnb-superhost",
    platform: "Airbnb",
    score: "4.89",
    scale: "/ 5",
    label: "Superhost",
    reviewCount: "91-92 reviews shown on listings",
    context: "Host signal",
    sourceLabel: "Airbnb",
  },
  {
    id: "skyscanner-property",
    platform: "Skyscanner",
    score: "4.6",
    scale: "/ 5",
    label: "Excellent",
    reviewCount: "7 reviews",
    context: "Property listing",
    sourceLabel: "Skyscanner",
  },
];

export const homepageRatings = platformRatings.filter((rating) =>
  ["booking-property", "airbnb-studio-1", "skyscanner-property", "airbnb-superhost"].includes(rating.id),
);

export function getRoomRating(slug: string) {
  return platformRatings.find((rating) => rating.roomSlug === slug) ?? platformRatings.find((rating) => rating.id === "booking-property");
}
