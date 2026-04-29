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
  { href: "/auth/sign-in", label: "Guest Check-In" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-brand-sage/80 bg-brand-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <Link href="/" className="font-serif text-2xl font-semibold">
            {siteConfig.name}
          </Link>
          <p className="max-w-md text-sm leading-6 text-white/75">
            Clean, secure, family-friendly serviced rooms and apartments for Rawalpindi and Islamabad visits.
          </p>
          <CTAButton href={getWhatsAppHref()} external whatsapp variant="secondary" size="default">
            Check availability
          </CTAButton>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase text-brand-gold">Explore</h2>
          <div className="mt-4 grid gap-2">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-white/75 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase text-brand-gold">Contact</h2>
          <div className="mt-4 space-y-3 text-sm text-white/75">
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
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}

