"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { exceptionReasonOptions, type ExceptionReason } from "@/lib/check-in/options";

type ExceptionCheckinButtonProps = {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  returnTo?: string;
};

export function ExceptionCheckinButton({ id, action, returnTo }: ExceptionCheckinButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ExceptionReason | "">("");

  return (
    <>
      <Button type="button" variant="outline" className="w-full" onClick={() => setOpen(true)}>
        <TriangleAlert className="h-4 w-4" aria-hidden="true" />
        Check-in with Exception
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4" role="presentation">
          <div
            className="w-full max-w-md rounded-xl border border-brand-sage bg-white p-5 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exception-checkin-title"
          >
            <h2 id="exception-checkin-title" className="font-serif text-2xl font-semibold text-brand-deep">
              Select reason for exception
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The guest can still be checked in, but the record will be marked as an issue until verification is complete.
            </p>

            <form action={action} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="checked_in" />
              {returnTo ? <input type="hidden" name="return_to" value={returnTo} /> : null}
              <Select
                name="exception_reason"
                required
                value={reason}
                onChange={(event) => setReason(event.target.value as ExceptionReason)}
                aria-label="Exception reason"
              >
                <option value="">Choose reason</option>
                {exceptionReasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!reason}>
                  Continue check-in
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
