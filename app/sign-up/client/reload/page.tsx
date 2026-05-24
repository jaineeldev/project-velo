"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@clerk/nextjs";

// Closes the JWT-refresh window after /api/sign-up/client/finalize writes
// publicMetadata.role='client'. Without this hop the browser still
// carries the pre-finalize cookie for ~60s, during which the middleware
// can't see the role and the user falls through to the agency
// onboarding flow.
//
// session.reload() pulls fresh session state from Clerk and updates the
// __session cookie with the JWT that includes the new claim, so the
// very next request the browser makes (the router.replace below) sends
// a cookie the middleware can read correctly.
//
// `next` is validated to a known-safe prefix — anyone could hit this
// page directly with a hand-crafted `next`, so we don't blindly trust
// the value as a redirect target.
const SAFE_NEXT_PREFIXES = ["/share/proposal/", "/share/project/"] as const;

function pickSafeNext(raw: string | null): string {
  if (!raw) return "/client/dashboard";
  if (SAFE_NEXT_PREFIXES.some((p) => raw.startsWith(p))) return raw;
  return "/client/dashboard";
}

export default function ClientSignUpReloadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, session } = useSession();
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const next = pickSafeNext(searchParams.get("next"));

    // No session means the user isn't signed in. Shouldn't happen on
    // this route in practice (finalize would have bounced them), but
    // fall through to the next URL anyway rather than spinning forever.
    if (!session) {
      router.replace(next);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await session.reload();
      } catch {
        // Reload failed (network blip, etc). The server-side onboarding
        // guard in app/onboarding/page.tsx is the safety net for the
        // client-falls-into-agency-onboarding case, so we still
        // navigate rather than blocking the user here.
        if (!cancelled) setErrored(true);
      }
      if (!cancelled) router.replace(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, session, searchParams, router]);

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="px-6 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]" />
          </span>
          <span className="font-mono text-[13px] uppercase tracking-[0.22em] text-foreground">
            Velo
          </span>
        </div>
      </header>

      <div
        className="flex flex-1 flex-col items-center justify-center px-6 pb-12"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm text-muted-foreground">
          {errored ? "Taking you to your proposal…" : "Finishing setup…"}
        </p>
      </div>
    </main>
  );
}
