import Link from "next/link";
import { Menu, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { Button } from "@/components/ui/button";
import { getWhatsAppHref, siteConfig } from "@/lib/site/config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-deep/10 bg-brand-ivory/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-2xl font-semibold leading-6 text-brand-deep">
            {siteConfig.name}
          </span>
          <span className="hidden text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold sm:block">
            Quiet, clean stays
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full border border-brand-deep/10 bg-white/70 p-1 shadow-sm md:flex"
          aria-label="Primary navigation"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-sage/70 hover:text-brand-deep"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation links">
            <Link href="#mobile-nav">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <CTAButton
            href={siteConfig.onlineCheckInHref}
            variant="outline"
            size="sm"
            className="hidden border-brand-deep/20 bg-white/75 sm:inline-flex"
          >
            Check-in
          </CTAButton>
          <CTAButton
            href={getWhatsAppHref()}
            external
            whatsapp
            size="sm"
            className="hidden bg-brand-deep text-white hover:bg-brand-fresh sm:inline-flex"
          >
            WhatsApp
          </CTAButton>
          <Button asChild size="sm" className="rounded-full sm:hidden" aria-label="Book on WhatsApp">
            <Link href={getWhatsAppHref()} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <nav id="mobile-nav" className="border-t border-brand-deep/10 px-4 py-2 md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-brand-deep"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={siteConfig.onlineCheckInHref}
            className="whitespace-nowrap rounded-full bg-brand-deep px-4 py-2 text-sm font-semibold text-white"
          >
            Online check-in
          </Link>
        </div>
      </nav>
    </header>
  );
}
