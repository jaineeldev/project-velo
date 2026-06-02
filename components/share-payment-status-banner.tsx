"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

type Variant = "received" | "confirming" | "cancelled";

type Props = {
  variant: Variant;
  amount?: string;
};

// Three states shown after Stripe redirects the client back to the project
// share page:
//
// - received  : ?paid=<id> AND invoice has flipped to status='paid' in DB
// - confirming: ?paid=<id> AND invoice is still 'unpaid' (webhook race)
// - cancelled : ?cancelled=1 (user backed out of Checkout)
//
// In the confirming state we trigger a one-shot router.refresh() after a
// short delay so the server re-queries the invoice and (assuming the
// webhook has now landed) the banner swaps to "received" without the user
// having to hit reload.

const REFRESH_DELAY_MS = 1800;

export function SharePaymentStatusBanner({ variant, amount }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (variant !== "confirming") return;
    const t = setTimeout(() => router.refresh(), REFRESH_DELAY_MS);
    return () => clearTimeout(t);
  }, [variant, router]);

  if (variant === "received") {
    return (
      <div
        role="status"
        className="mb-8 flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 px-4 py-3"
      >
        <CheckCircle2
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-success"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Payment received{amount ? ` (${amount})` : ""}.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Thanks. We&apos;ll be in touch about next steps.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "confirming") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mb-8 flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3"
      >
        <Clock
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-muted-foreground"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Confirming your payment.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            This usually takes a couple of seconds. The page will update
            automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="mb-8 flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3"
    >
      <XCircle
        aria-hidden
        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Payment cancelled.</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          No charge was made. Click Pay again when you&apos;re ready.
        </p>
      </div>
    </div>
  );
}
