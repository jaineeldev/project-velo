"use client";

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "../_lib/shared";

export function Reveal({
  children,
  delay = 0,
  className,
  amount = 0.25,
  y = 16,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
  y?: number;
}) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { duration: 0.5, ease: EASE_OUT, delay }
      }
    >
      {children}
    </motion.div>
  );
}

// Same fade-up pattern as <Reveal>, returned as a prop object so it can be
// spread onto an existing motion.* element (motion.h2, motion.p, etc.) without
// adding a wrapping div. Use this when keeping the wrapping element matters
// (typography, list semantics).
export function useReveal() {
  const prefersReduced = useReducedMotion();
  return (delay = 0, y = 16) =>
    ({
      initial: prefersReduced ? (false as const) : { opacity: 0, y },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-80px" } as const,
      transition: prefersReduced
        ? { duration: 0 }
        : { duration: 0.5, ease: EASE_OUT, delay },
    }) as const;
}
