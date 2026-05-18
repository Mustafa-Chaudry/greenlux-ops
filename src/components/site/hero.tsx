"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BedDouble, MessageCircle, ShieldCheck } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

const trustBullets = [
  { label: "Reply within minutes", icon: MessageCircle },
  { label: "Direct pricing (no platform fees)", icon: ShieldCheck },
  { label: "Room suggestions based on your stay", icon: BedDouble },
];

const backgroundImages = [
  { src: "/greenlux/property/hero-terrace.jpg", alt: "GreenLux Residency main terrace" },
  { src: "/greenlux/rooms/studio-2-1.jpg", alt: "GreenLux Residency studio apartment" },
  { src: "/greenlux/rooms/apartment-4-1.jpg", alt: "GreenLux Residency 1-bed apartment" },
  { src: "/greenlux/property/GLR%20Building.png", alt: "GreenLux Residency building exterior" },
  { src: "/greenlux/property/hero-terrace.jpg", alt: "GreenLux Residency private terrace seating and serviced accommodation exterior" },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-[#031f18] text-white sm:min-h-[780px]">
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={`${img.src}-${index}`}
            className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-brand-ivory to-transparent" />

      <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-20 sm:min-h-[780px] sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-brand-gold">
            {siteConfig.tagline}
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
            Thoughtfully managed stays in Rawalpindi — designed for calm, privacy, and control.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl sm:leading-9">
            Chosen by overseas families, international visitors, and short-stay guests who want a clean, quiet base with
            direct support — without the uncertainty of typical rentals.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <CTAButton
              href={getWhatsAppHref()}
              external
              whatsapp
              variant="secondary"
              className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]"
            >
              Check availability on WhatsApp
            </CTAButton>
            <CTAButton
              href="/rooms"
              variant="outline"
              showArrow
              className="border-white/35 bg-white/10 text-white hover:bg-white/20"
            >
              View rooms
            </CTAButton>
            <CTAButton
              href={siteConfig.onlineCheckInHref}
              variant="ghost"
              showArrow
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Already booked? Complete online check-in
            </CTAButton>
          </div>
          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {trustBullets.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/18 bg-white/12 px-4 py-3 backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 flex-none text-brand-gold" aria-hidden="true" />
                <span className="text-sm font-semibold leading-5 text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
