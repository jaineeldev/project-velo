"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useReveal } from "./reveal";

const oldStack = [
  "Google Docs",
  "Email threads",
  "Spreadsheets",
  "Trello",
  "Xero / manual invoices",
];

type Pill = { label: string; tone: "draft" | "active" | "done" };
const projectPills: Pill[] = [
  { label: "Approved", tone: "done" },
  { label: "Deposit paid", tone: "done" },
  { label: "In progress", tone: "active" },
  { label: "Final invoice", tone: "draft" },
  { label: "Paid", tone: "draft" },
];

const PILL_CLASS: Record<Pill["tone"], string> = {
  draft: "bg-[#2A2A2A] text-[#A0A0A0]",
  active: "bg-blue-950 text-blue-400 border border-blue-800",
  done: "bg-green-950 text-green-400",
};

export function ReplaceWithVelo() {
  const reveal = useReveal();

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          The status quo
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-16 max-w-4xl font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          Stop rebuilding the same project
          <br />
          in five different <span className="text-[#4F7EF7]">tools.</span>
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.article
            {...reveal(0.1)}
            className="rounded-xl border border-[#2A2A2A] bg-[#111] p-8 transition-all hover:border-[#444] hover:bg-[#151515]"
          >
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-[#555]">
              Without Velo
            </p>
            <ul className="space-y-3">
              {oldStack.map((tool) => (
                <li
                  key={tool}
                  className="flex items-center gap-3 border-b border-[#2A2A2A] pb-3 last:border-b-0 last:pb-0"
                >
                  <X
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-red-500"
                    strokeWidth={2.5}
                  />
                  <span className="font-mono text-sm text-[#A0A0A0] line-through decoration-[#444]">
                    {tool}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-xs italic text-[#555]">
              Five versions of the same project. None of them talk to each
              other.
            </p>
          </motion.article>

          <motion.article
            {...reveal(0.18)}
            className="rounded-xl border border-[#2A2A2A] bg-[#111] p-8 transition-all hover:border-[#444] hover:bg-[#151515]"
          >
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-[#555]">
              With Velo
            </p>
            <div className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Northstar Website Redesign
                  </h3>
                  <p className="mt-0.5 font-mono text-xs text-[#A0A0A0]">
                    northstar.com.au
                  </p>
                </div>
                <p className="font-mono text-sm font-bold text-[#4F7EF7]">
                  A$8,400
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                {projectPills.map((pill, i) => (
                  <span key={pill.label} className="flex items-center gap-1.5">
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        PILL_CLASS[pill.tone]
                      }`}
                    >
                      {pill.label}
                    </span>
                    {i < projectPills.length - 1 ? (
                      <span aria-hidden className="h-px w-3 bg-[#2A2A2A]" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-6 font-mono text-xs italic text-[#555]">
              One record. Every stage. Nothing duplicated.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
