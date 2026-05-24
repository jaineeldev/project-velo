"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { staggerVariants } from "../_lib/animation";
import { faqs, type Faq } from "../_lib/data";

// Typography-led accordion. Used on /pricing with the full FAQ set, and on
// the homepage with a tighter 4-question subset and a custom heading.
export function FaqSection({
  id,
  items = faqs,
  eyebrow = "Common questions",
  heading,
  footer,
  tight = false,
}: {
  id?: string;
  items?: Faq[];
  eyebrow?: string;
  heading?: ReactNode;
  footer?: ReactNode;
  // tight reduces vertical padding for use as a homepage subsection rather
  // than the full pricing-page FAQ.
  tight?: boolean;
} = {}) {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.06);
  const resolvedHeading = heading ?? (
    <>
      Frequently <span className="text-primary">asked.</span>
    </>
  );

  return (
    <section
      id={id}
      className="relative border-t border-white/[0.06] bg-[#0d0d0f]"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className={cn(
          "mx-auto max-w-4xl px-6 sm:px-10",
          tight ? "pb-16 pt-32" : "py-32 sm:py-40",
        )}
      >
        <motion.p
          variants={item}
          className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40"
        >
          {eyebrow}
        </motion.p>
        <motion.h2
          variants={item}
          className="mt-6 text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl"
        >
          {resolvedHeading}
        </motion.h2>

        <div className={cn(tight ? "mt-12" : "mt-16")}>
          {items.map((faq) => (
            <motion.div key={faq.q} variants={item}>
              <details className="group border-t border-white/10 py-7 first:border-t-0 last:border-b">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm text-left text-lg font-semibold text-white [&::-webkit-details-marker]:hidden sm:text-xl",
                    focusRing,
                  )}
                >
                  <span>{faq.q}</span>
                  <span className="relative h-4 w-4 shrink-0 text-white/50 transition-colors group-open:text-white">
                    <Plus
                      aria-hidden
                      className="absolute inset-0 h-4 w-4 transition-transform duration-300 group-open:rotate-45"
                      strokeWidth={1.75}
                    />
                  </span>
                </summary>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60">
                  {faq.a}
                </p>
              </details>
            </motion.div>
          ))}
        </div>

        {footer ? (
          <motion.div variants={item} className="mt-8 text-center">
            {footer}
          </motion.div>
        ) : null}
      </motion.div>
    </section>
  );
}
