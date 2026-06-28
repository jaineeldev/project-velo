"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";
import { submitWaitlist } from "@/app/waitlist-action";

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
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT },
      };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Drop your email and I'll let you know.");
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

      {sent ? (
        <div role="status" className="mx-auto mt-8 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3 text-sm font-medium text-white">
            <CheckCircle2
              aria-hidden
              className="h-4 w-4 text-[#22C55E]"
              strokeWidth={2}
            />
            You&apos;re on the list.
          </div>
          <p className="mt-4 text-sm text-[#A0A0A0]">
            Check your inbox for a confirmation from{" "}
            <span className="font-mono text-white">onboarding@resend.dev</span>
            . If it&apos;s not there in a minute, peek in spam.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
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
            className="h-12 flex-1 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-4 text-sm font-medium text-white placeholder:text-[#555] focus:border-[#4F7EF7] focus:outline-none focus:ring-2 focus:ring-[#4F7EF7]/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#4F7EF7] px-6 text-sm font-bold text-white transition-colors hover:bg-[#3B6AE8] disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Notify me"}
          </button>
        </form>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-[#EF4444]">
          {error}
        </p>
      ) : null}
    </motion.div>
  );
}
