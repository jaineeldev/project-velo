"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { generateFinalInvoice } from "../actions";

type Props = {
  projectId: string;
  remainingAmount: number;
};

const currencyFmt = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

export function GenerateFinalInvoiceButton({ projectId, remainingAmount }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const invoiceId = await generateFinalInvoice(projectId);
        router.push(`/dashboard/invoices/${invoiceId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate invoice");
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
        {isPending
          ? "Generating…"
          : `Generate final invoice (${currencyFmt.format(remainingAmount)})`}
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
