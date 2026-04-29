import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("space-y-3", align === "center" && "mx-auto max-w-3xl text-center", className)}>
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-fresh">{eyebrow}</p> : null}
      <h2 className="font-serif text-3xl font-semibold leading-tight text-brand-deep sm:text-4xl">{title}</h2>
      {description ? <p className="text-base leading-7 text-slate-700">{description}</p> : null}
    </div>
  );
}
