import * as React from "react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border border-brand-sage bg-white px-3 py-2 text-sm text-brand-charcoal shadow-sm outline-none transition-colors focus:border-brand-fresh focus:ring-2 focus:ring-brand-sage disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Select.displayName = "Select";

export { Select };

