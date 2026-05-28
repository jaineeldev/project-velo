"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";

// Typography-led closing CTA. The heading accepts ReactNode so callers can
// emphasise one word with text-primary.
export function FinalCTA({
  eyebrow,
  heading,
  body,
  subtle,
  primaryCta,
  secondaryCta,
}: {
  eyebrow?: string;
  heading?: React.ReactNode;
  body?: string;
  subtle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  const prefersReduced = useReducedMotion();

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  const resolvedHeading =
    heading ??
    (
      <>
        Ready to send your first{" "}
        <span className="text-primary">proposal?</span>
      </>
    );
  const resolvedBody =
    body ?? "14-day free trial. No credit card required.";
  const resolvedSubtle =
    subtle ?? "Early beta. Things will break. Send feedback when they do.";
  const resolvedPrimary = primaryCta ?? {
    label: "Join the waitlist",
    href: "/waitlist",
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <motion.div
        {...fadeUp}
        viewport={{ once: true, amount: 0.3 }}
        className="relative mx-auto max-w-5xl px-6 pb-32 pt-20 text-center sm:px-10 sm:pb-44 sm:pt-28"
      >
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={cn(
            "text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl",
            eyebrow ? "mt-6" : "",
          )}
        >
          {resolvedHeading}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-base text-white/60 sm:text-lg">
          {resolvedBody}
        </p>
        {resolvedSubtle ? (
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/60">
            {resolvedSubtle}
          </p>
        ) : null}
        <div className="mt-12 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href={resolvedPrimary.href}
            className={cn(
              "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
              focusRing,
            )}
          >
            {resolvedPrimary.label}
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-transparent px-8 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]",
                focusRing,
              )}
            >
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
