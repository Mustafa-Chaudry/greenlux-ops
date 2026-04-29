export const siteConfig = {
  name: "GreenLux Residency",
  tagline: "Premium serviced stays in Rawalpindi",
  location: "Rawalpindi / Islamabad, Pakistan",
  addressLine: "Rawalpindi, Pakistan",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY ?? "+92 300 0000000",
  phoneHref: process.env.NEXT_PUBLIC_CONTACT_PHONE_HREF ?? "tel:+923000000000",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "reservations@greenluxresidency.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000",
  whatsappMessage:
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ??
    "Hello GreenLux Residency, I would like to check availability.",
};

export function getWhatsAppHref(message = siteConfig.whatsappMessage) {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

