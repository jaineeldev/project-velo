"use client";

import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
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
        className={buttonVariants({ variant: "primary" })}
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
