import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, MessageCircle } from "lucide-react";
import { CTAButton } from "@/components/site/cta-button";
import { SectionHeading } from "@/components/site/section-heading";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { getWhatsAppHref } from "@/lib/site/config";
import { getGuideBySlug, guides, type GuideImageCredit } from "@/lib/site/guides";
import { breadcrumbJsonLd, guideJsonLd } from "@/lib/site/seo";

type GuideDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function ImageCredit({ credit }: { credit?: GuideImageCredit }) {
  if (!credit) {
    return null;
  }

  return (
    <p className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold leading-5 text-white backdrop-blur">
      Photo:{" "}
      <a href={credit.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {credit.label}
      </a>{" "}
      /{" "}
      <a href={credit.licenseHref} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        {credit.license}
      </a>
    </p>
  );
}

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuideDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide Not Found",
    };
  }

  return {
    title: guide.title,
    description: guide.description,
    alternates: {
      canonical: guide.href,
    },
    openGraph: {
      title: `${guide.title} | GreenLux Residency`,
      description: guide.description,
      url: guide.href,
      images: [
        {
          url: guide.imageSrc,
          alt: guide.imageAlt,
        },
      ],
    },
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  const relatedGuides = guides.filter((item) => item.slug !== guide.slug).slice(0, 3);

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            guideJsonLd(guide),
            breadcrumbJsonLd([
              { name: "Home", href: "/" },
              { name: "Guides", href: "/guides" },
              { name: guide.title, href: guide.href },
            ]),
          ]),
        }}
      />
      <main>
        <section className="bg-gradient-to-b from-brand-ivory via-white to-brand-ivory px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Button asChild variant="ghost" className="rounded-full text-brand-deep hover:bg-brand-sage/50">
              <Link href="/guides">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to guides
              </Link>
            </Button>

            <div className="mt-8 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-gold">GreenLux local guide</p>
                <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] text-brand-deep sm:text-6xl">
                  {guide.title}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">{guide.description}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <CTAButton
                    href={getWhatsAppHref(
                      `Hi GreenLux Residency, I am planning a stay related to ${guide.shortTitle}. Please suggest the right available stay for my dates.`,
                    )}
                    external
                    whatsapp
                  >
                    Ask for the right stay
                  </CTAButton>
                  <CTAButton href="/rooms" variant="outline" showArrow>
                    Compare rooms
                  </CTAButton>
                </div>
              </div>
              <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-brand-deep/5 shadow-soft">
                <Image
                  src={guide.imageSrc}
                  alt={guide.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
                <ImageCredit credit={guide.imageCredit} />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
          <div className="space-y-8">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="Stay planning"
                title="Start with the visit, then choose the room."
                description="The right GreenLux stay depends on who is travelling, where the day takes you, how much space you need, and what would make arrival feel easier."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {guide.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl bg-brand-ivory p-5">
                    <CheckCircle2 className="h-5 w-5 text-brand-fresh" aria-hidden="true" />
                    <p className="mt-3 text-sm font-semibold leading-6 text-brand-deep">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Good when</p>
                <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-deep">This matches your trip</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{guide.whoItHelps}</p>
              </article>
              <article className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Why GreenLux helps</p>
                <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-deep">Less guessing on arrival</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{guide.whyItMatters}</p>
              </article>
              <article className="rounded-[1.5rem] border border-brand-deep/10 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">Room direction</p>
                <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-deep">Ask before you book</h2>
                <p className="mt-3 text-sm leading-7 text-slate-700">{guide.suggestedRoomType}</p>
              </article>
            </div>

            <article className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <SectionHeading
                eyebrow="How to decide"
                title={`Plan around ${guide.shortTitle}.`}
                description="Arrival time, guest count, luggage, daily movement, and privacy all change which room feels right. Share those details early and GreenLux can guide the choice."
              />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {guide.planningSections.map((section) => (
                  <div key={section.title} className="rounded-2xl bg-brand-ivory p-5">
                    <h2 className="font-serif text-2xl font-semibold leading-tight text-brand-deep">{section.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{section.body}</p>
                  </div>
                ))}
              </div>
            </article>

            {guide.localNotes ? (
              <article className="rounded-[1.75rem] border border-brand-deep/10 bg-brand-ivory p-6 shadow-sm sm:p-8">
                <SectionHeading
                  eyebrow="Before travel"
                  title="Details worth confirming."
                  description="Routes, timings, opening hours, prices, weather, and availability can change. Confirm the details that affect your day before you leave."
                />
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {guide.localNotes.map((note) => (
                    <div key={note.title} className="rounded-2xl bg-white p-5 shadow-sm">
                      <h2 className="font-serif text-2xl font-semibold leading-tight text-brand-deep">{note.title}</h2>
                      <p className="mt-3 text-sm leading-7 text-slate-700">{note.body}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <SectionHeading
                  eyebrow="Before you message"
                  title="Send the details that help us suggest the right stay."
                  description="Dates, guest count, arrival timing, and the reason for the visit help the team recommend a room, studio, or apartment with less back-and-forth."
                />
                <div className="space-y-3">
                  {guide.bookingQuestions.map((question) => (
                    <p key={question} className="flex gap-3 rounded-2xl bg-brand-sage/35 p-4 text-sm font-semibold leading-6 text-brand-deep">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-brand-fresh" aria-hidden="true" />
                      {question}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {guide.supportImageSrc ? (
              <div className="grid gap-5 rounded-[1.75rem] bg-brand-ivory p-5 sm:p-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-deep/5">
                  <Image
                    src={guide.supportImageSrc}
                    alt={guide.supportImageAlt ?? ""}
                    fill
                    sizes="(min-width: 1024px) 34vw, 90vw"
                    className="object-cover"
                  />
                  <ImageCredit credit={guide.supportImageCredit} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">{guide.supportLabel}</p>
                  <h2 className="mt-3 font-serif text-3xl font-semibold text-brand-deep">A local cue for planning.</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    This image gives local context, while timings and availability still need a quick check. Message
                    GreenLux with your dates, guest count, and arrival timing so the team can suggest the right room,
                    studio, or apartment.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-white p-6 shadow-soft">
              <MapPin className="h-6 w-6 text-brand-fresh" aria-hidden="true" />
              <h2 className="mt-4 font-serif text-3xl font-semibold text-brand-deep">Find the stay that fits the visit.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Tell us your dates, guest count, and reason for coming. GreenLux will guide you toward the room, studio,
                or apartment that fits best.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {guide.stayTypes.map((stayType) => (
                  <span key={stayType} className="rounded-full bg-brand-sage/45 px-3 py-1.5 text-xs font-bold text-brand-deep">
                    {stayType}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <CTAButton
                  href={getWhatsAppHref(
                    `Hi GreenLux Residency, I am planning around ${guide.shortTitle} and would like help choosing a stay. My dates are [dates], and we are [guest count] guests.`,
                  )}
                  external
                  whatsapp
                  className="w-full"
                >
                  Ask for a recommendation
                </CTAButton>
                <CTAButton href="/rooms" variant="outline" showArrow className="w-full">
                  View rooms
                </CTAButton>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-brand-deep/10 bg-brand-ivory p-6">
              <MessageCircle className="h-5 w-5 text-brand-fresh" aria-hidden="true" />
              <h2 className="mt-3 font-serif text-2xl font-semibold text-brand-deep">Related guides</h2>
              <div className="mt-4 space-y-3">
                {relatedGuides.map((relatedGuide) => (
                  <Link
                    key={relatedGuide.slug}
                    href={relatedGuide.href}
                    className="block rounded-2xl bg-white px-4 py-3 text-sm font-semibold leading-6 text-brand-deep transition hover:bg-brand-sage/45"
                  >
                    {relatedGuide.title}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </SiteShell>
  );
}
