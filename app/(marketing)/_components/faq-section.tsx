"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";
import { faqs, type Faq } from "../_lib/data";

export function FaqSection({
  id,
  items = faqs,
  eyebrow = "Common questions",
  heading,
  footer,
  tight = false,
  defaultOpenCount = 0,
}: {
  id?: string;
  items?: Faq[];
  eyebrow?: string;
  heading?: ReactNode;
  footer?: ReactNode;
  tight?: boolean;
  defaultOpenCount?: number;
} = {}) {
  const prefersReduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: prefersReduced ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: prefersReduced
      ? { duration: 0 }
      : { duration: 0.5, ease: EASE_OUT, delay },
  });
  const resolvedHeading = heading ?? (
    <>
      Frequently <span className="text-[#4F7EF7]">asked.</span>
    </>
  );

  return (
    <section
      id={id}
      className="border-t border-[#2A2A2A] bg-[#0A0A0A]"
    >
      <div
        className={`mx-auto max-w-4xl px-6 ${
          tight ? "pb-16 pt-20" : "py-24"
        }`}
      >
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-12 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          {resolvedHeading}
        </motion.h2>

        <div>
          {items.map((faq, i) => (
            <motion.details
              key={faq.q}
              {...reveal(0.06 + i * 0.02)}
              open={i < defaultOpenCount}
              className="group border-t border-[#2A2A2A] py-6 last:border-b last:border-[#2A2A2A]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-base font-semibold tracking-tight text-white [&::-webkit-details-marker]:hidden sm:text-lg">
                <span>{faq.q}</span>
                <Plus
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#A0A0A0] transition-transform duration-200 group-open:rotate-45"
                  strokeWidth={2}
                />
              </summary>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#A0A0A0]">
                {faq.a}
              </p>
            </motion.details>
          ))}
        </div>

        {footer ? (
          <motion.div {...reveal(0.4)} className="mt-8 text-center">
            {footer}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
