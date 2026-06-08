export const siteConfig = {
  name: "GreenLux Residency",
  tagline: "Quiet, clean stays in Rawalpindi / Islamabad",
  location: "28A, Street 8B, Westridge 1, Rawalpindi",
  addressLine: "28A, Street 8B, Westridge 1, Rawalpindi",
  shortAddress: "28A, Street 8B, Westridge 1, Rawalpindi",
  coordinates: {
    latitude: 33.6062,
    longitude: 73.0232,
  },
  googleMapsHref: "https://www.google.com/maps/search/?api=1&query=33.6062,73.0232",
  phoneDisplay: "+92 333 7067065",
  phoneHref: "tel:+923337067065",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@greenluxresidency.com",
  whatsappNumber: "923337067065",
  whatsappMessage:
    "Hi GreenLux Residency, I would like to check availability. My dates are __, guest count is __, arrival time is __, and visit purpose is __. Please suggest the right stay and share the live rate.",
  arrivalGuideHref: "/arrival",
  onlineCheckInHref: "/dashboard/check-in",
};

export function getWhatsAppHref(message = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getRoomWhatsAppHref(roomName: string) {
  return getWhatsAppHref(
    `Hi GreenLux Residency, I am interested in ${roomName}. My dates are __, guest count is __, and arrival time is __. Please confirm availability, live rate, and whether this room fits my stay.`,
  );
}
