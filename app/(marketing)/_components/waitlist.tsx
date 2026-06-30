"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";
import { submitWaitlist } from "@/app/waitlist-action";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Waitlist() {
  const prefersReduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const trimmed = email.trim();
  const looksValid = useMemo(() => EMAIL_RE.test(trimmed), [trimmed]);
  const showInlineHint = touched && trimmed.length > 0 && !looksValid;

  useEffect(() => {
    if (looksValid) setError(null);
  }, [looksValid]);

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT },
      };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!trimmed) {
      setError("Drop your email and I'll let you know.");
      return;
    }
    if (!looksValid) {
      setError("That doesn't look like a valid email address.");
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
      className="rounded-xl border border-[#2A2A2A] bg-[#111] p-8 text-center sm:p-10"
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
        Get notified
      </p>
      <h3 className="font-display text-3xl font-black leading-[0.95] tracking-tight text-white sm:text-4xl">
        Stay in the <span className="text-[#4F7EF7]">loop.</span>
      </h3>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#A0A0A0]">
        One email when something material ships: CRM, team accounts, public
        API. No marketing, no calendar invites.
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            role="status"
            className="mx-auto mt-8 max-w-md"
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReduced ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <div className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm font-medium text-white">
              <motion.span
                initial={prefersReduced ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.05,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                className="inline-flex"
              >
                <CheckCircle2
                  aria-hidden
                  className="h-4 w-4 text-[#22C55E]"
                  strokeWidth={2}
                />
              </motion.span>
              You&apos;re on the list.
            </div>
            <p className="mt-4 text-sm text-[#A0A0A0]">
              I&apos;ll email when public sign-up opens. If you don&apos;t see
              a confirmation in a minute, peek in spam.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            className="mx-auto mt-8 max-w-md"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address
              </label>
              <input
                id="waitlist-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => setTouched(true)}
                aria-invalid={showInlineHint || Boolean(error)}
                aria-describedby={
                  error
                    ? "waitlist-error"
                    : showInlineHint
                      ? "waitlist-hint"
                      : undefined
                }
                disabled={isPending}
                className={`h-12 flex-1 rounded-lg border bg-[#0A0A0A] px-4 text-sm font-medium text-white placeholder:text-[#555] transition-colors duration-150 focus:outline-none disabled:opacity-50 ${
                  showInlineHint || error
                    ? "border-[#EF4444] focus:border-[#EF4444]"
                    : "border-[#2A2A2A] focus:border-[#4F7EF7]"
                }`}
              />
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#4F7EF7] px-6 text-sm font-bold text-white transition-all duration-200 hover:bg-[#3B6AE8] disabled:cursor-not-allowed disabled:opacity-60 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]"
              >
                {isPending ? (
                  <>
                    <Loader2
                      aria-hidden
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2.5}
                    />
                    Saving
                  </>
                ) : (
                  "Save my spot"
                )}
              </button>
            </div>
            <div className="min-h-[1.5rem] text-left">
              <AnimatePresence initial={false} mode="wait">
                {error ? (
                  <motion.p
                    key="error"
                    id="waitlist-error"
                    role="alert"
                    initial={prefersReduced ? false : { opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -2 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="mt-2 text-sm font-medium text-[#EF4444]"
                  >
                    {error}
                  </motion.p>
                ) : showInlineHint ? (
                  <motion.p
                    key="hint"
                    id="waitlist-hint"
                    initial={prefersReduced ? false : { opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={prefersReduced ? undefined : { opacity: 0, y: -2 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    className="mt-2 text-sm font-medium text-[#A0A0A0]"
                  >
                    That doesn&apos;t look like a complete email yet.
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
