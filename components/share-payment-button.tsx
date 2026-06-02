"use client";

import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { createInvoiceCheckoutSession } from "@/app/share/project/[token]/actions";

type Props = {
  label: string;
  amount: string;
  size?: "sm" | "md";
  token: string;
  invoiceId: string;
};

// Client-side wrapper that calls the server action, gets a Stripe-hosted
// Checkout URL, and navigates the browser to it. Stripe handles the rest
// (card collection, success/cancel redirects) and our webhook flips the
// invoice to paid before the user lands back on the share page.

export function SharePaymentButton({
  label,
  amount,
  size = "md",
  token,
  invoiceId,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onPay() {
    setError(null);
    startTransition(async () => {
      try {
        const { url } = await createInvoiceCheckoutSession(token, invoiceId);
        window.location.href = url;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not start checkout. Please try again.",
        );
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onPay}
        disabled={pending}
        aria-label={`${label} ${amount}`}
        className={cn(
          "inline-flex items-center gap-2 rounded-md bg-primary font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60",
          size === "md" ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs",
          focusRing,
        )}
      >
        <span>{pending ? "Opening secure checkout." : label}</span>
        {pending ? null : (
          <>
            <span className="font-mono tabular-nums">{amount}</span>
            <ArrowRight
              aria-hidden
              className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"}
            />
          </>
        )}
      </button>
      {error ? (
        <p
          className={cn(
            "mt-2 text-destructive",
            size === "md" ? "text-xs" : "text-[11px]",
          )}
        >
          {error}
        </p>
      ) : (
        <p
          className={cn(
            "mt-2 text-muted-foreground",
            size === "md" ? "text-xs" : "text-[11px]",
          )}
        >
          Payments are processed securely by Stripe. Card details never touch
          Velo&apos;s servers.
        </p>
      )}
    </div>
  );
}
