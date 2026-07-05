"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn, focusRing } from "@/lib/utils";
import {
  authCardCls,
  authInputCls,
  authLabelCls,
  authPrimaryButtonCls,
  authSecondaryButtonCls,
  looksLikeEmail,
} from "./shared";
import { AuthHeader } from "./chrome";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!looksLikeEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmedEmail,
      { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` },
    );
    setBusy(false);
    if (resetError) {
      setError("Couldn't send that link. Try again in a moment.");
      return;
    }
    // Supabase returns success whether or not the email exists, so we don't
    // leak account existence — always show the same message.
    setSent(true);
  }

  if (sent) {
    return (
      <div className={authCardCls}>
        <AuthHeader
          eyebrow="Check your inbox"
          title="Reset link sent"
          description={
            <>
              If an account exists for{" "}
              <span className="text-foreground">{email.trim()}</span>, we&apos;ve
              sent a link to reset your password.
            </>
          }
        />
        <Link href="/sign-in" className={authSecondaryButtonCls}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={authCardCls}>
      <AuthHeader
        eyebrow="Reset password"
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to reset it."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className={authLabelCls}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputCls}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={authPrimaryButtonCls}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Send reset link
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link
          href="/sign-in"
          className={cn(
            "rounded-sm font-medium text-primary hover:underline",
            focusRing,
          )}
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
