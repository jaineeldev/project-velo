"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";
import { cn, focusRing } from "@/lib/utils";

// The sign-up form re-renders across the email/password and social flows,
// so we persist the consent in sessionStorage: the user clicks the
// checkbox once at the start and isn't kicked back to the gate on
// re-render. The store is per-tab and clears when the tab closes —
// appropriate for a consent gesture that should be re-affirmed in a fresh
// session.
const STORAGE_KEY = "signup-consent";

type Props = {
  // Where Better Auth should land the browser after a *social* sign-up.
  // Used by the client sign-up flow to land on the finalize endpoint that
  // assigns the 'client' role. Forwarded to SignUpForm's
  // `afterSocialSignUp` prop.
  signUpForceRedirectUrl?: string;
};

export function ConsentGate({ signUpForceRedirectUrl }: Props) {
  // null = still reading from sessionStorage on first paint. We hold render
  // until that read completes so we never flash the gate at a returning
  // user mid-flow.
  const [proceeded, setProceeded] = useState<boolean | null>(null);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setProceeded(sessionStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function proceed() {
    if (!agreed) return;
    sessionStorage.setItem(STORAGE_KEY, "true");
    setProceeded(true);
  }

  if (proceeded === null) {
    return <div className="h-[500px]" aria-hidden />;
  }

  if (proceeded) {
    return (
      <>
        <SignUpForm afterSocialSignUp={signUpForceRedirectUrl} />
        <p className="mt-4 max-w-sm text-center text-sm text-muted-foreground">
          By creating an account you agree to our{" "}
          <Link
            href="/terms"
            className={cn("rounded text-primary hover:underline", focusRing)}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className={cn("rounded text-primary hover:underline", focusRing)}
          >
            Privacy Policy
          </Link>
          .
        </p>
      </>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-neutral-300 bg-card p-6 shadow-sm dark:border-neutral-700">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Before you sign up
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review and agree to our terms to continue.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          aria-describedby="consent-text"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border text-primary",
            focusRing,
          )}
        />
        <span id="consent-text" className="leading-relaxed">
          I have read and agree to the{" "}
          <Link
            href="/terms"
            target="_blank"
            className={cn("rounded text-primary hover:underline", focusRing)}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            className={cn("rounded text-primary hover:underline", focusRing)}
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <button
        type="button"
        onClick={proceed}
        disabled={!agreed}
        aria-disabled={!agreed}
        className={cn(
          "w-full rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50",
          focusRing,
        )}
      >
        Continue to sign up
      </button>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className={cn("rounded text-primary hover:underline", focusRing)}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
