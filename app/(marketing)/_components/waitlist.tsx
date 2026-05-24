"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";
import { submitWaitlist } from "@/app/waitlist-action";

// Quiet waitlist form. Used on /about under the early-beta note. Posts to the
// existing server action.
export function Waitlist() {
  const prefersReduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Drop your email and we'll let you know.");
      return;
    }

    startTransition(async () => {
      try {
        await submitWaitlist({ email: trimmed });
        setSent(true);
        setEmail("");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Couldn't save your spot. Try again in a moment.",
        );
      }
    });
  }

  return (
    <motion.div
      {...fadeUp}
      viewport={{ once: true, amount: 0.3 }}
      className="text-left"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
        Get notified
      </p>
      <h3 className="mt-6 text-balance text-4xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-5xl">
        Get pinged when the rough bits get{" "}
        <span className="text-primary">smooth.</span>
      </h3>
      <p className="mt-5 max-w-md text-base leading-relaxed text-white/60">
        One email when something material ships: Stripe payments, CRM,
        team accounts. No marketing, no calendar invites.
      </p>

      {sent ? (
        <div
          role="status"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
        >
          <CheckCircle2 aria-hidden className="h-4 w-4 text-primary" />
          You&apos;re on the list. Talk soon.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            id="waitlist-email"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className={cn(
              "h-11 flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm text-white placeholder:text-white/40 transition-colors focus:border-white/40 focus:outline-none disabled:opacity-50",
              focusRing,
            )}
          />
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60",
              focusRing,
            )}
          >
            {isPending ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
