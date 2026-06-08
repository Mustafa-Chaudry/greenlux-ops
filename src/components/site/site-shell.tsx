import { MessageCircle } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getWhatsAppHref } from "@/lib/site/config";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-ivory">
      <SiteHeader />
      {children}
      <SiteFooter />
      <a
        href={getWhatsAppHref()}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-[#25d366] p-3.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#22c55e] hover:shadow-xl sm:px-5"
        aria-label="Chat with GreenLux on WhatsApp"
      >
        <MessageCircle className="h-5 w-5 flex-none" aria-hidden="true" />
        <span className="hidden sm:block">WhatsApp</span>
      </a>
    </div>
  );
}
