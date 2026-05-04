export const siteConfig = {
  name: "GreenLux Residency",
  tagline: "Boutique serviced accommodation in Rawalpindi / Islamabad",
  location: "Westridge, Rawalpindi / Islamabad access",
  addressLine: "Westridge, Rawalpindi",
  phoneDisplay: "+92 333 7067065",
  phoneHref: "tel:+923337067065",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@greenluxresidency.com",
  whatsappNumber: "923337067065",
  whatsappMessage:
    "Hi GreenLux Residency, I'm interested in booking a stay. Please share availability and rates.",
  onlineCheckInHref: "/dashboard/check-in",
};

export function getWhatsAppHref(message = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function getRoomWhatsAppHref(roomName: string) {
  return getWhatsAppHref(
    `Hi GreenLux Residency, I'm interested in booking ${roomName}. Please share availability and rates.`,
  );
}
