"use client";

import { useCallback, useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ label = "Print summary", autoPrint = false }: { label?: string; autoPrint?: boolean }) {
  const printWhenReady = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => window.print(), 100);
    });
  }, []);

  useEffect(() => {
    if (!autoPrint) {
      return;
    }

    const timeout = window.setTimeout(printWhenReady, 350);
    return () => window.clearTimeout(timeout);
  }, [autoPrint, printWhenReady]);

  return (
    <Button type="button" variant="outline" onClick={printWhenReady}>
      <Printer className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
