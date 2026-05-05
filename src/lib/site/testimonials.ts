import type { SiteVideo } from "@/lib/site/videos";

export type VideoTestimonial = SiteVideo & {
  guestType: string;
  consentStatus: "approved";
  caption: string;
};

export const approvedVideoTestimonials: VideoTestimonial[] = [
  {
    slug: "new-zealand-guest-testimonial",
    title: "New Zealand guest",
    description: "Approved guest video testimonial from an international GreenLux guest.",
    src: "/greenlux/testimonials/Newzeland-male-testimonial.mp4",
    poster: "/greenlux/booking/booking-terrace-01.jpg",
    durationLabel: "0:24",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about"],
    priority: "primary",
    shows: "New Zealand male guest testimonial",
    guestType: "New Zealand guest",
    consentStatus: "approved",
    caption: "An approved international guest video testimonial.",
  },
  {
    slug: "slovakian-guest-testimonial",
    title: "Slovakian guest",
    description: "Approved guest video testimonial from an international GreenLux guest.",
    src: "/greenlux/testimonials/slovakian-male-testimonial.mp4",
    poster: "/greenlux/booking/booking-lounge-01.jpg",
    durationLabel: "0:15",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about"],
    priority: "secondary",
    shows: "Slovakian male guest testimonial",
    guestType: "Slovakian guest",
    consentStatus: "approved",
    caption: "An approved international guest video testimonial.",
  },
  {
    slug: "international-female-guest-testimonial",
    title: "International guest",
    description: "Approved guest video testimonial from an international GreenLux guest.",
    src: "/greenlux/testimonials/International-female-testimonial.mp4",
    poster: "/greenlux/booking/booking-common-area-01.jpg",
    durationLabel: "0:25",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about", "contact"],
    priority: "secondary",
    shows: "International female guest testimonial",
    guestType: "International guest",
    consentStatus: "approved",
    caption: "An approved international guest video testimonial.",
  },
];
