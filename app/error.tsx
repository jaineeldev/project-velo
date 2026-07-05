"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";

// Route-tree error boundary. Catches any unhandled error thrown while
// rendering a route segment. `reset()` re-attempts rendering, which is the
// right move for transient issues (network blips, Neon cold-start hiccups);
// for hard failures the user can navigate away. We surface `error.digest`
// when it's present so server-logged errors can be correlated with what the
// user saw.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
          <Link
            href="/"
            aria-label="Velo home"
            className={cn("rounded-sm font-display text-lg font-black tracking-tight text-foreground", focusRing)}
          >
            Velo
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle aria-hidden className="h-6 w-6 text-destructive" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Something went wrong
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            We hit an unexpected error
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The error has been logged. You can try again, or head back to the
            dashboard.
          </p>

          {error.digest && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className={cn(
                "rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                focusRing,
              )}
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className={cn(
                "rounded-md border border-border px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                focusRing,
              )}
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
