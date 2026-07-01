"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT, focusRing } from "../_lib/shared";

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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-6 pb-0 pt-14 text-center">
      <div className="relative flex w-full flex-1 flex-col items-center justify-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center py-16">
        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0)}
          className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]"
        >
          Early access · Australian freelance developers
        </motion.p>

        <motion.h1
          initial={prefersReduced ? false : "hidden"}
          animate="visible"
          variants={
            prefersReduced
              ? undefined
              : {
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
                }
          }
          style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
          className="mb-6 font-display font-black leading-[0.88] tracking-[-0.045em] text-white"
        >
          {[
            ["One", "place."],
            ["Every", "project."],
            ["Start", "to", { word: "paid.", accent: true }],
          ].map((line, lineIdx) => (
            <span key={lineIdx} className="block">
              {(line as Array<string | { word: string; accent?: boolean }>).map(
                (token, i) => {
                  const word = typeof token === "string" ? token : token.word;
                  const accent =
                    typeof token === "object" && token.accent === true;
                  return (
                    <span
                      key={`${lineIdx}-${i}`}
                      className="inline-block overflow-hidden align-bottom"
                    >
                      <motion.span
                        className={`inline-block ${accent ? "text-[#4F7EF7]" : ""}`}
                        variants={
                          prefersReduced
                            ? undefined
                            : {
                                hidden: { y: "110%", opacity: 0 },
                                visible: {
                                  y: 0,
                                  opacity: 1,
                                  transition: { duration: 0.7, ease: EASE_OUT },
                                },
                              }
                        }
                      >
                        {word}
                      </motion.span>
                      {i < line.length - 1 ? " " : null}
                    </span>
                  );
                },
              )}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.12)}
          className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-[#A0A0A0]"
        >
          Velo is the one place a freelance developer sends proposals, gets
          client approval, and runs the project, without rebuilding the same
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
            className={`inline-flex items-center justify-center rounded-xl bg-[#4F7EF7] px-8 py-3.5 text-base font-bold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing}`}
          >
            Join the waitlist
          </Link>
          <Link
            href="#workflow"
            className={`group inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2A2A2A] px-8 py-3.5 text-base font-medium text-[#A0A0A0] transition-all duration-200 hover:border-[#444] hover:text-white motion-safe:hover:-translate-y-0.5 ${focusRing}`}
          >
            See how it works
            <span aria-hidden className="inline-block transition-transform duration-200 motion-safe:group-hover:translate-y-0.5">
              ↓
            </span>
          </Link>
        </motion.div>

        <motion.p
          initial={initial}
          animate={{ opacity: 1, y: 0 }}
          transition={transition(0.28)}
          className="mt-4 font-mono text-xs text-[#555]"
        >
          Waitlist only for now · Public beta coming
        </motion.p>
      </div>
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
