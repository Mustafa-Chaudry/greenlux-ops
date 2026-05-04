import Image from "next/image";
import { BedDouble, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

const realnessStrip = [
  { label: "Westridge, Rawalpindi", icon: MapPin },
  { label: "Rooms, studios, apartments", icon: BedDouble },
  { label: "WhatsApp-first booking", icon: MessageCircle },
  { label: "Online check-in after confirmation", icon: ShieldCheck },
];

export function Hero() {
  return (
    <section className="relative isolate min-h-[720px] overflow-hidden bg-[#031f18] text-white sm:min-h-[780px]">
      <Image
        src="/greenlux/property/hero-terrace.jpg"
        alt="GreenLux Residency private terrace seating and serviced accommodation exterior"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(3,31,24,0.82)_0%,rgba(3,31,24,0.68)_42%,rgba(3,31,24,0.22)_78%,rgba(3,31,24,0.10)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(201,162,39,0.12),transparent_28rem)]" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-brand-ivory to-transparent" />

      <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-20 sm:min-h-[780px] sm:px-6 lg:px-8">
        <div className="max-w-4xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-brand-gold">
            {siteConfig.tagline}
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[0.98] sm:text-6xl lg:text-7xl">
            Quiet, clean stays in Rawalpindi, managed from booking to arrival.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 sm:text-xl sm:leading-9">
            Choose a room, studio, or apartment. Message us on WhatsApp for availability, then complete online check-in
            before you arrive.
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
          <div className="mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {realnessStrip.map((item) => (
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
