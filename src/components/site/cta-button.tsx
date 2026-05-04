import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CTAButtonProps = {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  showArrow?: boolean;
  whatsapp?: boolean;
  className?: string;
} & Pick<ButtonProps, "variant" | "size">;

export function CTAButton({
  href,
  children,
  external = false,
  showArrow = false,
  whatsapp = false,
  className,
  variant,
  size = "lg",
}: CTAButtonProps) {
  const externalProps = external ? { target: "_blank", rel: "noreferrer" } : {};
  const Icon = whatsapp ? MessageCircle : ArrowRight;

  return (
    <Button asChild variant={variant} size={size} className={cn("min-w-0 rounded-full", className)}>
      <Link href={href} {...externalProps}>
        {whatsapp || showArrow ? <Icon className="h-4 w-4 flex-none" aria-hidden="true" /> : null}
        <span className="truncate">{children}</span>
      </Link>
    </Button>
  );
}
