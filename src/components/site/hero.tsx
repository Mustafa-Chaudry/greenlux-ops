import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

const heroTrust = [
  { label: "Clean rooms", icon: Sparkles },
  { label: "Secure stay", icon: ShieldCheck },
  { label: "Family-friendly", icon: UsersRound },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-deep text-white">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=82"
          alt="Premium serviced apartment lounge with warm hospitality lighting"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/88 to-brand-deep/35" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-ivory to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pt-24">
        <div className="flex max-w-3xl flex-col justify-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-brand-gold">
            {siteConfig.tagline}
          </p>
          <h1 className="font-serif text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Clean, secure serviced stays with home-like privacy.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
            Boutique rooms, studios, and apartments for families, business visitors, overseas Pakistanis,
            medical trips, weddings, tourism, and longer stays across Rawalpindi and Islamabad.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary">
              Book on WhatsApp
            </CTAButton>
            <CTAButton href="/rooms" variant="outline" showArrow className="border-white/40 bg-white/10 text-white hover:bg-white/18">
              View Rooms
            </CTAButton>
            <CTAButton href="/auth/sign-in" variant="ghost" showArrow className="bg-white/10 text-white hover:bg-white/18">
              Guest Check-In
            </CTAButton>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {heroTrust.map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-3 backdrop-blur">
                <item.icon className="h-4 w-4 text-brand-gold" aria-hidden="true" />
                <span className="text-sm font-medium text-white/90">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-end">
          <div className="w-full max-w-md rounded-xl border border-white/18 bg-white/12 p-4 shadow-soft backdrop-blur-md">
            <div className="rounded-lg bg-brand-ivory p-5 text-brand-charcoal">
              <div className="flex items-center justify-between gap-4 border-b border-brand-sage pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-fresh">Availability</p>
                  <p className="mt-1 font-serif text-2xl font-semibold text-brand-deep">WhatsApp-first booking</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-brand-fresh" aria-hidden="true" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-700">
                <p>Share dates, guests, room preference, and arrival time.</p>
                <p>Management confirms availability, rate, and check-in steps.</p>
                <p>Guests complete secure verification before arrival.</p>
              </div>
              <Link
                href="/privacy"
                className="mt-5 inline-flex text-sm font-semibold text-brand-deep underline decoration-brand-gold underline-offset-4"
              >
                How guest data is protected
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

