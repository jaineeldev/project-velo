"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth-client";
import { cn, focusRing } from "@/lib/utils";
import { authCardCls, authPrimaryButtonCls } from "./shared";

type Props = {
  email?: string;
};

// Reached after sign-up when "Confirm email" blocks session creation (see
// SignUpForm). The actual confirmation link is handled entirely by
// app/auth/callback/route.ts — this page never processes a token itself, it
// just holds the user and offers a resend.
export function VerifyEmailView({ email }: Props) {
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleResend() {
    if (!email) return;
    setError(null);
    setBusy(true);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/signing-in`,
      },
    });
    setBusy(false);
    if (resendError) {
      setError("Couldn't resend that email. Try again in a moment.");
      return;
    }
    setResent(true);
  }

  return (
    <div className={authCardCls}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Confirm your email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {email ? (
            <>
              We sent a verification link to{" "}
              <span className="text-foreground">{email}</span>. Click it to activate
              your account.
            </>
          ) : (
            "We sent a verification link to your email. Click it to activate your account."
          )}
        </p>
      </div>

      {email && (
        <button
          type="button"
          onClick={handleResend}
          disabled={busy || resent}
          className={cn(authPrimaryButtonCls, focusRing)}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {resent ? "Email sent" : "Resend email"}
        </button>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/sign-in" className={cn("rounded text-primary hover:underline", focusRing)}>
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
