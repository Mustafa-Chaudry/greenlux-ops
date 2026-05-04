import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

const footerLinks = [
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: siteConfig.onlineCheckInHref, label: "Online check-in" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-gold/20 bg-[#05281f] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.25fr_0.75fr_0.9fr] lg:px-8">
        <div className="space-y-5">
          <Link href="/" className="font-serif text-3xl font-semibold">
            {siteConfig.name}
          </Link>
          <p className="max-w-md text-sm leading-7 text-white/70">
            Boutique serviced accommodation for families, business travellers, short stays, and repeat direct bookings
            across Rawalpindi and Islamabad.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" size="default" className="bg-brand-gold text-brand-deep hover:bg-[#d9b96d]">
              Book on WhatsApp
            </CTAButton>
            <CTAButton href={siteConfig.onlineCheckInHref} variant="outline" size="default" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              Online check-in
            </CTAButton>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Explore</h2>
          <div className="mt-4 grid gap-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/70 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-gold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-brand-gold" aria-hidden="true" />
              {siteConfig.location}
            </p>
            <a href={siteConfig.phoneHref} className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 text-brand-gold" aria-hidden="true" />
              {siteConfig.phoneDisplay}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4 text-brand-gold" aria-hidden="true" />
              {siteConfig.email}
            </a>
            <a href={getWhatsAppHref()} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white">
              <MessageCircle className="h-4 w-4 text-brand-gold" aria-hidden="true" />
              WhatsApp reservations
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        &copy; {new Date().getFullYear()} {siteConfig.name}. Public bookings are confirmed directly by management.
      </div>
    </footer>
  );
}
