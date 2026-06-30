"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useReveal } from "./reveal";

const steps: { name: string; detail: string }[] = [
  {
    name: "Proposal approved",
    detail: "Client clicks approve in their secure portal.",
  },
  {
    name: "Project created",
    detail: "A fresh project record opens for the engagement.",
  },
  {
    name: "Milestones copied",
    detail: "Line items become trackable milestones.",
  },
  {
    name: "Deposit invoice generated",
    detail: "Calculated from the approved scope and deposit %.",
  },
  {
    name: "Client notified",
    detail: "Email confirmation with the next step lands in their inbox.",
  },
];

export function AutomationChain() {
  const reveal = useReveal();

  return (
    <section className="border-t border-[#2A2A2A] bg-[#111] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          The chain reaction
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-4 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          The admin happens when
          <br />
          the client says <span className="text-[#22C55E]">yes.</span>
        </motion.h2>
        <motion.p
          {...reveal(0.1)}
          className="mb-16 max-w-xl text-lg leading-relaxed text-[#A0A0A0]"
        >
          One click on the share link kicks off five things. You don&apos;t
          touch any of them.
        </motion.p>

        <motion.div
          {...reveal(0.15)}
          className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center lg:gap-2"
        >
          {steps.map((step, i) => (
            <div
              key={step.name}
              className="flex flex-1 items-center gap-2 lg:contents"
            >
              <article className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-5 transition-all hover:border-[#444]">
                <p className="mb-2 font-mono text-xs text-[#555]">
                  Step {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  {step.name}
                </h3>
                <p className="font-mono text-xs leading-relaxed text-[#555]">
                  {step.detail}
                </p>
              </article>
              {i < steps.length - 1 ? (
                <ChevronRight
                  aria-hidden
                  className="hidden h-5 w-5 shrink-0 text-[#2A2A2A] lg:block"
                  strokeWidth={2}
                />
              ) : null}
            </div>
          ))}
        </motion.div>

        <motion.p
          {...reveal(0.25)}
          className="mt-16 text-center font-mono text-sm italic text-[#555]"
        >
          You did nothing. Velo did everything.
        </motion.p>
      </div>
    </section>
  );
}
