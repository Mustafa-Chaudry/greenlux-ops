import { faqs } from "@/lib/site/content";
import { MobileCarousel } from "@/components/site/mobile-carousel";

type FAQSectionProps = {
  limit?: number;
};

export function FAQSection({ limit }: FAQSectionProps) {
  const visibleFaqs = typeof limit === "number" ? faqs.slice(0, limit) : faqs;
  const faqItems = visibleFaqs.map((faq) => (
    <details key={faq.question} className="group rounded-lg border border-brand-sage bg-white p-5 shadow-sm">
      <summary className="cursor-pointer list-none font-semibold text-brand-deep">
        <span className="flex items-center justify-between gap-4">
          {faq.question}
          <span className="text-xl leading-none text-brand-fresh group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
    </details>
  ));

  return (
    <>
      <MobileCarousel ariaLabel="Frequently asked questions">{faqItems}</MobileCarousel>
      <div className="hidden space-y-3 md:block">{faqItems}</div>
    </>
  );
}
