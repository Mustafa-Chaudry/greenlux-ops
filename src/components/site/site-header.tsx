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
    <header className="sticky top-0 z-40 border-b border-brand-sage/70 bg-brand-ivory/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-xl font-semibold leading-6 text-brand-deep sm:text-2xl">
            {siteConfig.name}
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-brand-fresh sm:block">
            Serviced stays
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-sage/55 hover:text-brand-deep"
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
            href={getWhatsAppHref()}
            external
            whatsapp
            size="sm"
            className="hidden sm:inline-flex"
          >
            Book on WhatsApp
          </CTAButton>
          <Button asChild size="sm" className="sm:hidden" aria-label="Book on WhatsApp">
            <Link href={getWhatsAppHref()} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>

      <nav id="mobile-nav" className="border-t border-brand-sage/60 px-4 py-2 md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-brand-deep"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth/sign-in"
            className="whitespace-nowrap rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-brand-deep"
          >
            Guest Check-In
          </Link>
        </div>
      </nav>
    </header>
  );
}

