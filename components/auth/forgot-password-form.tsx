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
  looksLikeEmail,
} from "./shared";

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
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists for <span className="text-foreground">{email.trim()}</span>,
            we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Link
          href="/sign-in"
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted",
            focusRing,
          )}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className={authCardCls}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

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
          className={cn(authPrimaryButtonCls, focusRing)}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          Send reset link
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/sign-in" className={cn("rounded text-primary hover:underline", focusRing)}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
