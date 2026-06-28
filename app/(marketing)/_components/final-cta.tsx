"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "../_lib/shared";

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
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.5, ease: EASE_OUT },
      };

  const resolvedHeading =
    heading ?? (
      <>
        Ready to send your first{" "}
        <span className="text-[#4F7EF7]">proposal?</span>
      </>
    );
  const resolvedBody = body ?? "14-day free trial. No credit card required.";
  const resolvedSubtle =
    subtle ?? "Early beta. Things will break. Send feedback when they do.";
  const resolvedPrimary = primaryCta ?? {
    label: "Join the waitlist",
    href: "/waitlist",
  };

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A]">
      <motion.div
        {...fadeUp}
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-3xl px-6 py-32 text-center"
      >
        {eyebrow ? (
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
            {eyebrow}
          </p>
        ) : null}
        <h2
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          className="font-display font-black leading-[0.88] tracking-[-0.04em] text-white"
        >
          {resolvedHeading}
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
          {resolvedBody}
        </p>
        {resolvedSubtle ? (
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#555]">
            {resolvedSubtle}
          </p>
        ) : null}
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href={resolvedPrimary.href}
            className="inline-flex items-center justify-center rounded-xl bg-[#4F7EF7] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#3B6AE8]"
          >
            {resolvedPrimary.label}
          </Link>
          {secondaryCta ? (
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] px-8 py-3.5 text-base font-medium text-[#A0A0A0] transition-all hover:border-[#444] hover:text-white"
            >
              {secondaryCta.label}
            </Link>
          ) : null}
        </div>
      </motion.div>
    </section>
  );
}
