import Link from "next/link";
import type * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminTone = "neutral" | "success" | "warning" | "danger" | "info" | "blue";

const surfaceToneClassNames: Record<AdminTone, string> = {
  neutral: "border-brand-sage bg-white",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50",
  danger: "border-red-200 bg-red-50",
  info: "border-brand-sage bg-brand-ivory",
  blue: "border-sky-200 bg-sky-50",
};

const textToneClassNames: Record<AdminTone, string> = {
  neutral: "text-slate-600",
  success: "text-emerald-700",
  warning: "text-amber-800",
  danger: "text-red-700",
  info: "text-brand-deep",
  blue: "text-sky-700",
};

export function AdminPageShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={cn("min-h-screen px-4 py-6 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">{children}</div>
    </main>
  );
}

export function AdminHero({
  eyebrow,
  title,
  description,
  status,
  statusTone = "neutral",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  status?: string;
  statusTone?: AdminTone;
  children?: React.ReactNode;
}) {
  return (
    <header className="overflow-hidden rounded-xl border border-brand-sage bg-white shadow-sm">
      <div className="grid gap-4 border-b border-brand-sage bg-brand-deep px-5 py-5 text-white lg:grid-cols-[1fr_auto] lg:items-end sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-gold">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80">{description}</p>
        </div>
        {status ? (
          <Badge tone={statusTone} className="w-fit border-white/20 bg-white/10 text-white">
            {status}
          </Badge>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2 bg-white/95 p-4 sm:p-5">{children}</div> : null}
    </header>
  );
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-brand-sage bg-white shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b border-brand-sage/80 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-deep">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function AdminMetricTile({
  label,
  value,
  detail,
  href,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  href?: string;
  tone?: AdminTone;
  icon?: LucideIcon;
}) {
  const content = (
    <div className={cn("h-full rounded-lg border p-4", surfaceToneClassNames[tone])}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">{label}</p>
        {Icon ? <Icon className={cn("h-4 w-4", textToneClassNames[tone])} aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold leading-none text-brand-deep">{value}</p>
      {detail ? <p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p> : null}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block h-full transition hover:-translate-y-0.5 hover:shadow-soft">
      {content}
    </Link>
  );
}

export function AdminActionRow({
  title,
  detail,
  href,
  tone = "neutral",
  meta,
  icon: Icon,
  actionLabel = "Open",
}: {
  title: string;
  detail: string;
  href: string;
  tone?: AdminTone;
  meta?: string;
  icon?: LucideIcon;
  actionLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-lg border p-4 transition hover:-translate-y-0.5 hover:shadow-soft",
        surfaceToneClassNames[tone],
      )}
    >
      <div className="flex gap-3">
        {Icon ? (
          <span className={cn("mt-0.5 rounded-lg bg-white/75 p-2", textToneClassNames[tone])}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-semibold text-brand-deep">{title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-700">{detail}</p>
              {meta ? <p className="mt-1 text-xs leading-5 text-slate-500">{meta}</p> : null}
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-deep">
              {actionLabel}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function AdminEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{detail}</p>
    </div>
  );
}

export function AdminQuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <Button asChild variant="outline" className="h-auto justify-start px-3 py-3">
      <Link href={href}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
