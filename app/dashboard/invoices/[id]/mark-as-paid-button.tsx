"use client";

import { useState, useTransition } from "react";
import { cn, focusRing } from "@/lib/utils";
import { markInvoiceAsPaid } from "../actions";

export function MarkAsPaidButton({ invoiceId }: { invoiceId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await markInvoiceAsPaid(invoiceId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Update failed");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-busy={isPending}
        className={cn(
          "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50",
          focusRing,
        )}
      >
        {isPending ? "Marking…" : "Mark as paid"}
      </button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
