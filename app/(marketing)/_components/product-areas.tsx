"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "../_lib/shared";

const outcomes: { n: string; statement: string; detail: string }[] = [
  {
    n: "01",
    statement: "A signed proposal becomes a ready-to-run project.",
    detail:
      "Milestones, deposit invoice, and client portal created the moment your client approves.",
  },
  {
    n: "02",
    statement: "Your client gets their own secure portal.",
    detail:
      "They track progress, view files, and pay invoices without asking you for updates.",
  },
  {
    n: "03",
    statement: "Invoices generate from the approved scope.",
    detail:
      "Deposit on approval. Final on delivery. Amounts calculated automatically from what was agreed.",
  },
  {
    n: "04",
    statement: "Know exactly what needs your attention.",
    detail:
      "Needs attention, waiting on client, payment outstanding — surfaced automatically.",
  },
];

export function ProductAreas() {
  const prefersReduced = useReducedMotion();
  const reveal = (delay = 0) => ({
    initial: prefersReduced ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: prefersReduced
      ? { duration: 0 }
      : { duration: 0.5, ease: EASE_OUT, delay },
  });

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          The outcome
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-16 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          What Velo <span className="text-[#4F7EF7]">actually does.</span>
        </motion.h2>

        <ol>
          {outcomes.map((o, i) => (
            <motion.li
              key={o.n}
              {...reveal(0.08 + i * 0.04)}
              className="flex flex-col items-start gap-6 border-t border-[#2A2A2A] py-10 md:flex-row md:gap-8"
            >
              <span
                aria-hidden
                className="w-full shrink-0 font-mono font-black leading-none text-[#1A1A1A] md:w-32"
                style={{ fontSize: "clamp(3.5rem, 6vw, 5rem)" }}
              >
                {o.n}
              </span>
              <div>
                <p className="max-w-2xl text-2xl font-bold leading-snug text-white md:text-3xl">
                  {o.statement}
                </p>
                <p className="mt-3 max-w-xl text-base leading-relaxed text-[#A0A0A0]">
                  {o.detail}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
