"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "../_lib/shared";

const MARQUEE_ITEMS = [
  "Proposals",
  "Client approval",
  "Project tracking",
  "Milestones",
  "Time logging",
  "Invoicing",
  "PDF export",
  "Client portal",
  "Deliverables",
  "Change requests",
  "Dashboard",
];

export function Hero() {
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? false : { opacity: 0, y: 16 };
  const transition = (delay = 0) =>
    prefersReduced
      ? { duration: 0 }
      : { duration: 0.6, ease: EASE_OUT, delay };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] px-6 pb-0 pt-14 text-center">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-16">
        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0)}
          className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]"
        >
          Early access · Australian freelance developers
        </motion.p>

        <motion.h1
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.05)}
          style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
          className="mb-6 font-display font-black leading-[0.88] tracking-[-0.045em] text-white"
        >
          One place.
          <br />
          Every project.
          <br />
          Start to <span className="text-[#4F7EF7]">paid.</span>
        </motion.h1>

        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.12)}
          className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-[#A0A0A0]"
        >
          Velo is the one place a freelance developer sends proposals, gets
          client approval, and runs the project — without rebuilding the same
          information five times.
        </motion.p>

        <motion.div
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.2)}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/waitlist"
            className="inline-flex items-center justify-center rounded-xl bg-[#4F7EF7] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#3B6AE8]"
          >
            Join the waitlist
          </Link>
          <Link
            href="#workflow"
            className="inline-flex items-center justify-center rounded-xl border border-[#2A2A2A] px-8 py-3.5 text-base font-medium text-[#A0A0A0] transition-all hover:border-[#444] hover:text-white"
          >
            See how it works ↓
          </Link>
        </motion.div>

        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.28)}
          className="mt-4 font-mono text-xs text-[#555]"
        >
          No credit card required · 14-day free trial · 2 projects
        </motion.p>
      </div>

      <div className="w-full overflow-hidden border-t border-[#2A2A2A]">
        <div className="relative py-4">
          <div
            className="flex w-max gap-12 whitespace-nowrap font-mono text-xs uppercase tracking-widest text-[#555]"
            style={{
              animation: prefersReduced
                ? "none"
                : "marquee 60s linear infinite",
            }}
          >
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map(
              (item, i) => (
                <span key={`${item}-${i}`} className="flex items-center gap-12">
                  <span>{item}</span>
                  <span aria-hidden className="text-[#2A2A2A]">
                    ·
                  </span>
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </section>
  );
}
