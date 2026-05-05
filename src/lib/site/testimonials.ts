import type { SiteVideo } from "@/lib/site/videos";

export type VideoTestimonial = SiteVideo & {
  guestType: string;
  stayContext: string;
  consentStatus: "approved";
  caption: string;
};

export const approvedVideoTestimonials: VideoTestimonial[] = [
  {
    slug: "new-zealand-guest-testimonial",
    title: "New Zealand guest",
    description: "A short video note from a New Zealand guest after staying at GreenLux.",
    src: "/greenlux/testimonials/Newzeland-male-testimonial.mp4",
    durationLabel: "0:24",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about"],
    priority: "primary",
    shows: "New Zealand male guest testimonial",
    guestType: "New Zealand guest",
    stayContext: "Overseas guest stay",
    consentStatus: "approved",
    caption: "A guest perspective shared for future overseas visitors.",
  },
  {
    slug: "slovakian-guest-testimonial",
    title: "Slovakian guest",
    description: "A short video note from a Slovakian guest after staying at GreenLux.",
    src: "/greenlux/testimonials/slovakian-male-testimonial.mp4",
    durationLabel: "0:15",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about"],
    priority: "secondary",
    shows: "Slovakian male guest testimonial",
    guestType: "Slovakian guest",
    stayContext: "International short stay",
    consentStatus: "approved",
    caption: "A short guest note for people comparing GreenLux before booking.",
  },
  {
    slug: "international-female-guest-testimonial",
    title: "International guest",
    description: "A short video note from an international guest after staying at GreenLux.",
    src: "/greenlux/testimonials/International-female-testimonial.mp4",
    durationLabel: "0:25",
    orientation: "portrait",
    quality: "good",
    placement: ["homepage", "about", "contact"],
    priority: "secondary",
    shows: "International female guest testimonial",
    guestType: "International guest",
    stayContext: "International visitor stay",
    consentStatus: "approved",
    caption: "A simple guest video note, shown without names or added quotes.",
  },
];
