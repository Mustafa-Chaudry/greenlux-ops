import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.greenluxresidency.com"),
  title: {
    default: "GreenLux Residency | Serviced Rooms & Apartments in Rawalpindi",
    template: "%s | GreenLux Residency",
  },
  description:
    "A clean, green, and quiet serviced-stay retreat in Westridge 1 for overseas families, business executives, medical visitors, and short stays.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/greenlux/brand/glr-emblem.png",
    apple: "/greenlux/brand/glr-emblem.png",
  },
  openGraph: {
    title: "GreenLux Residency | Serviced Rooms & Apartments in Rawalpindi",
    description:
      "A clean, green, and quiet serviced-stay retreat in Westridge 1 for overseas families, business executives, medical visitors, and short stays.",
    type: "website",
    siteName: "GreenLux Residency",
    url: "/",
    images: [
      {
        url: "/greenlux/property/hero-terrace.jpg",
        width: 1024,
        height: 497,
        alt: "GreenLux Residency private terrace seating and serviced accommodation exterior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GreenLux Residency | Serviced Rooms & Apartments in Rawalpindi",
    description:
      "A clean, green, and quiet serviced-stay retreat in Westridge 1 for overseas families, business executives, medical visitors, and short stays.",
    images: ["/greenlux/property/hero-terrace.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.variable, playfair.variable, "font-sans antialiased")}>{children}</body>
    </html>
  );
}
