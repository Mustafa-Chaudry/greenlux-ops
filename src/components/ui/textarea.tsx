import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-brand-sage bg-white px-3 py-2 text-sm text-brand-charcoal shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-brand-fresh focus:ring-2 focus:ring-brand-sage disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };

