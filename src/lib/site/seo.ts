import type { MetadataRoute } from "next";
import { guides } from "@/lib/site/guides";
import { rooms } from "@/lib/site/rooms";
import { siteConfig } from "@/lib/site/config";

export const siteUrl = "https://www.greenluxresidency.com";

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export const publicStaticRoutes: MetadataRoute.Sitemap = [
  {
    url: absoluteUrl("/"),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: absoluteUrl("/rooms"),
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    url: absoluteUrl("/location"),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/arrival"),
    changeFrequency: "monthly",
    priority: 0.75,
  },
  {
    url: absoluteUrl("/guides"),
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    url: absoluteUrl("/contact"),
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    url: absoluteUrl("/about"),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: absoluteUrl("/privacy"),
    changeFrequency: "yearly",
    priority: 0.2,
  },
  {
    url: absoluteUrl("/terms"),
    changeFrequency: "yearly",
    priority: 0.2,
  },
];

export const roomSitemapRoutes: MetadataRoute.Sitemap = rooms.map((room) => ({
  url: absoluteUrl(`/rooms/${room.slug}`),
  changeFrequency: "weekly",
  priority: room.type === "apartment" || room.type === "club_class" ? 0.85 : 0.75,
}));

export const guideSitemapRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
  url: absoluteUrl(guide.href),
  changeFrequency: "monthly",
  priority: 0.72,
}));

export const guideLinks = guides.map((guide) => ({
  title: guide.title,
  url: absoluteUrl(guide.href),
}));

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export const roomItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": absoluteUrl("/rooms#room-list"),
  name: "GreenLux Residency rooms and apartments",
  itemListElement: rooms.map((room, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(`/rooms/${room.slug}`),
    name: room.name,
    item: {
      "@type": room.stayType === "Full apartment" ? "Apartment" : "HotelRoom",
      name: room.name,
      description: room.shortDescription,
      image: absoluteUrl(room.images[0]),
      url: absoluteUrl(`/rooms/${room.slug}`),
      offers: {
        "@type": "Offer",
        price: room.priceFromPkr,
        priceCurrency: "PKR",
        availability: "https://schema.org/InStock",
      },
    },
  })),
};

export const guideItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": absoluteUrl("/guides#guide-list"),
  name: "GreenLux Residency local stay guides",
  itemListElement: guides.map((guide, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(guide.href),
    name: guide.title,
    item: {
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      image: absoluteUrl(guide.imageSrc),
      url: absoluteUrl(guide.href),
    },
  })),
};

export function faqPageJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function guideJsonLd(guide: (typeof guides)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": absoluteUrl(`${guide.href}#article`),
    headline: guide.title,
    description: guide.description,
    image: absoluteUrl(guide.imageSrc),
    url: absoluteUrl(guide.href),
    mainEntityOfPage: absoluteUrl(guide.href),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: absoluteUrl("/"),
    },
    articleSection: [...guide.planningSections.map((section) => section.title), ...(guide.localNotes?.map((note) => note.title) ?? [])],
    keywords: [guide.shortTitle, ...guide.highlights, ...guide.stayTypes, ...(guide.localNotes?.map((note) => note.title) ?? [])].join(", "),
    about: guide.stayTypes,
  };
}

export const lodgingBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "@id": absoluteUrl("/#greenlux-residency"),
  name: siteConfig.name,
  url: absoluteUrl("/"),
  telephone: siteConfig.phoneDisplay,
  email: siteConfig.email,
  priceRange: "PKR 10,000+",
  description:
    "Thoughtfully managed private rooms, studios, and serviced apartments in Westridge 1, Rawalpindi with direct GreenLux support.",
  image: [
    absoluteUrl(
      "/greenlux/curation-review/homepage/03__hero-slide__GreenLux-Residency-secure-gated-entry__gates-day-custom.png",
    ),
    absoluteUrl("/greenlux/curation-review/homepage/05__hero-slide__Terrace-seating-updated.jpg"),
    absoluteUrl("/greenlux/curation-review/homepage/10__common-area__Shared-dining-dining-updated.webp"),
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "28A, Street 8B, Westridge 1",
    addressLocality: "Rawalpindi",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.coordinates.latitude,
    longitude: siteConfig.coordinates.longitude,
  },
  areaServed: [
    {
      "@type": "City",
      name: "Rawalpindi",
    },
    {
      "@type": "City",
      name: "Islamabad",
    },
  ],
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "Smart TV", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kitchen access where listed", value: true },
    { "@type": "LocationFeatureSpecification", name: "Direct WhatsApp support", value: true },
  ],
  subjectOf: guideLinks,
  makesOffer: rooms.slice(0, 6).map((room) => ({
    "@type": "Offer",
    name: room.name,
    url: absoluteUrl(`/rooms/${room.slug}`),
    price: room.priceFromPkr,
    priceCurrency: "PKR",
    availability: "https://schema.org/InStock",
    itemOffered: {
      "@type": room.stayType === "Full apartment" ? "Apartment" : "HotelRoom",
      name: room.name,
      occupancy: {
        "@type": "QuantitativeValue",
        maxValue: room.maxGuests,
      },
    },
  })),
};

export function roomJsonLd(room: (typeof rooms)[number]) {
  return {
    "@context": "https://schema.org",
    "@type": room.stayType === "Full apartment" ? "Apartment" : "HotelRoom",
    "@id": absoluteUrl(`/rooms/${room.slug}#room`),
    name: `${room.name} at ${siteConfig.name}`,
    description: room.description,
    image: room.images.map((image) => absoluteUrl(image)),
    url: absoluteUrl(`/rooms/${room.slug}`),
    containedInPlace: {
      "@id": absoluteUrl("/#greenlux-residency"),
    },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: room.maxGuests,
    },
    amenityFeature: room.amenities.slice(0, 8).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: amenity,
      value: true,
    })),
    offers: {
      "@type": "Offer",
      price: room.priceFromPkr,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      url: absoluteUrl(`/rooms/${room.slug}`),
    },
  };
}
