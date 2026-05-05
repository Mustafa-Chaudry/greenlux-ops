export type SiteVideoPlacement = "homepage" | "about" | "contact" | "location" | "room" | "unused";

export type SiteVideo = {
  slug: string;
  title: string;
  description: string;
  src: string;
  poster: string;
  durationLabel: string;
  orientation: "landscape" | "portrait";
  quality: "good" | "usable" | "weak";
  placement: SiteVideoPlacement[];
  priority: "primary" | "secondary" | "unused";
  shows: string;
};

export const siteVideos: SiteVideo[] = [
  {
    slug: "property-tour-main",
    title: "Main property walkthrough",
    description: "A fuller look through GreenLux for guests who want to understand the space before they book.",
    src: "/greenlux/videos/property-tour-main.mp4",
    poster: "/greenlux/booking/booking-terrace-01.jpg",
    durationLabel: "2:55",
    orientation: "portrait",
    quality: "usable",
    placement: ["homepage", "about"],
    priority: "primary",
    shows: "Main vertical property walkthrough",
  },
  {
    slug: "property-gate-day",
    title: "Daytime entrance preview",
    description: "A quick look at the gate and arrival point for GreenLux Residency.",
    src: "/greenlux/videos/property-gate-day.mp4",
    poster: "/greenlux/property/exterior-entry.jpg",
    durationLabel: "0:08",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "contact", "location"],
    priority: "primary",
    shows: "Short daytime gate and property entrance clip",
  },
  {
    slug: "first-floor-lounge",
    title: "First-floor lounge",
    description: "Shared lounge seating for guests who want somewhere calm beyond the bedroom.",
    src: "/greenlux/videos/first-floor-lounge.mp4",
    poster: "/greenlux/booking/booking-lounge-01.jpg",
    durationLabel: "0:51",
    orientation: "landscape",
    quality: "good",
    placement: ["homepage", "about"],
    priority: "secondary",
    shows: "First-floor lounge and common seating",
  },
  {
    slug: "terrace-night",
    title: "Terrace at night",
    description: "A night view of GreenLux terrace space and outdoor seating.",
    src: "/greenlux/videos/terrace-night.mp4",
    poster: "/greenlux/booking/booking-terrace-01.jpg",
    durationLabel: "1:13",
    orientation: "landscape",
    quality: "usable",
    placement: ["contact"],
    priority: "secondary",
    shows: "Terrace and common area at night",
  },
  {
    slug: "one-bed-apartment-tour",
    title: "One-bedroom apartment tour",
    description: "A daytime look at the one-bedroom apartment layout for families and longer stays.",
    src: "/greenlux/videos/1-bed-appartment-tour-day.mp4",
    poster: "/greenlux/rooms/apartment-3-01.jpg",
    durationLabel: "0:35",
    orientation: "portrait",
    quality: "good",
    placement: ["room"],
    priority: "primary",
    shows: "One-bedroom apartment daytime tour",
  },
  {
    slug: "studio-tour",
    title: "Studio tour",
    description: "A quick studio walkthrough for guests comparing the studio-style stays.",
    src: "/greenlux/videos/studio-tour.mp4",
    poster: "/greenlux/rooms/studio-1-01.jpg",
    durationLabel: "0:27",
    orientation: "portrait",
    quality: "good",
    placement: ["room"],
    priority: "primary",
    shows: "Studio room tour",
  },
  {
    slug: "terrace-studio-apartment-entrance-night",
    title: "Terrace and apartment entrance",
    description: "A night walkthrough connecting terrace and apartment entrance areas.",
    src: "/greenlux/videos/terrace-studio-appartment-entrance-night.mp4",
    poster: "/greenlux/booking/booking-exterior-01.jpg",
    durationLabel: "1:46",
    orientation: "landscape",
    quality: "usable",
    placement: ["about", "location"],
    priority: "secondary",
    shows: "Terrace, studio, and apartment entrance at night",
  },
  {
    slug: "gate-opening-building-shots-night",
    title: "Night exterior approach",
    description: "A longer night view of the gate opening and building exterior.",
    src: "/greenlux/videos/gate-opening-building-shots-night-landscape.mp4",
    poster: "/greenlux/booking/booking-exterior-01.jpg",
    durationLabel: "1:38",
    orientation: "landscape",
    quality: "usable",
    placement: ["location"],
    priority: "secondary",
    shows: "Gate opening and building shots at night",
  },
  {
    slug: "gate-driveway-parking-night",
    title: "Driveway and parking approach",
    description: "A night arrival and driveway clip kept for future review.",
    src: "/greenlux/videos/gate-driveway-parking-night.mp4",
    poster: "/greenlux/booking/booking-exterior-01.jpg",
    durationLabel: "1:31",
    orientation: "landscape",
    quality: "weak",
    placement: ["unused"],
    priority: "unused",
    shows: "Gate, driveway, and parking approach at night",
  },
];

export const homepageVideos = siteVideos.filter((video) =>
  ["property-tour-main", "property-gate-day", "first-floor-lounge"].includes(video.slug),
);

export const aboutVideos = siteVideos.filter((video) =>
  ["first-floor-lounge", "terrace-studio-apartment-entrance-night"].includes(video.slug),
);

export const contactVideos = siteVideos.filter((video) =>
  ["property-gate-day", "terrace-night"].includes(video.slug),
);

export const locationVideos = siteVideos.filter((video) =>
  ["property-gate-day", "terrace-studio-apartment-entrance-night"].includes(video.slug),
);

export function getVideoBySlug(slug?: string) {
  if (!slug) {
    return undefined;
  }

  return siteVideos.find((video) => video.slug === slug);
}
