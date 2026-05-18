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
  metadataBase: new URL("https://greenluxresidency.com"),
  title: {
    default: "Thoughtfully managed stays in Rawalpindi — designed for calm, privacy, and control.",
    template: "%s | GreenLux Residency",
  },
  description:
    "Chosen by overseas families, international visitors, and short-stay guests who want a clean, quiet base with direct support — without the uncertainty of typical rentals.",
  openGraph: {
    title: "Thoughtfully managed stays in Rawalpindi — designed for calm, privacy, and control.",
    description:
      "Chosen by overseas families, international visitors, and short-stay guests who want a clean, quiet base with direct support — without the uncertainty of typical rentals.",
    type: "website",
    siteName: "GreenLux Residency",
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
    title: "Thoughtfully managed stays in Rawalpindi — designed for calm, privacy, and control.",
    description:
      "Chosen by overseas families, international visitors, and short-stay guests who want a clean, quiet base with direct support — without the uncertainty of typical rentals.",
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
