"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";

type Status =
  | "draft"
  | "sent"
  | "approved"
  | "deposit-paid"
  | "in-progress"
  | "final-invoice"
  | "paid";

type Stage = {
  number: string;
  status: Status;
  statusLabel: string;
  name: string;
  description: string;
  amount?: string;
  active?: boolean;
};

const stages: Stage[] = [
  {
    number: "01",
    status: "draft",
    statusLabel: "Draft",
    name: "Proposal drafted",
    description:
      "You write the scope, line items, deposit %, and GST in one place.",
  },
  {
    number: "02",
    status: "sent",
    statusLabel: "Sent",
    name: "Proposal sent",
    description:
      "Client gets a clean share link and an email. No login wall.",
    amount: "A$8,400",
  },
  {
    number: "03",
    status: "approved",
    statusLabel: "Approved",
    name: "Client approves",
    description:
      "One click. Timestamped against a verified email address.",
    amount: "A$8,400",
  },
  {
    number: "04",
    status: "deposit-paid",
    statusLabel: "Deposit paid",
    name: "Deposit invoice paid",
    description:
      "Deposit invoice is generated automatically. Client pays through Stripe.",
    amount: "A$2,520",
  },
  {
    number: "05",
    status: "in-progress",
    statusLabel: "In progress",
    name: "Project running",
    description:
      "Milestones, time entries, deliverables. Client tracks progress in their portal.",
    amount: "3 / 5 milestones",
    active: true,
  },
  {
    number: "06",
    status: "final-invoice",
    statusLabel: "Final invoice",
    name: "Final invoice issued",
    description:
      "Final invoice generated from the approved scope, minus the deposit.",
    amount: "A$5,880",
  },
  {
    number: "07",
    status: "paid",
    statusLabel: "Paid",
    name: "Project paid",
    description:
      "Final payment received. Project closed. Records archived.",
    amount: "A$8,400",
  },
];

const STATUS_CLASS: Record<Status, string> = {
  draft: "bg-[#2A2A2A] text-[#A0A0A0]",
  sent: "bg-blue-950 text-blue-400",
  approved: "bg-green-950 text-green-400",
  "deposit-paid": "bg-green-950 text-green-400",
  "in-progress": "bg-blue-950 text-blue-400 border border-blue-800",
  "final-invoice": "bg-amber-950 text-amber-400",
  paid: "bg-green-950 text-green-400",
};

// Width of one card (min-w-[260px]) + the gap-4 (16px) between cards.
const SCROLL_STEP = 276;

export function HowItWorks() {
  const prefersReduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const reveal = (delay = 0) => ({
    initial: prefersReduced ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: prefersReduced
      ? { duration: 0 }
      : { duration: 0.5, ease: EASE_OUT, delay },
  });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  function scrollBy(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }

  return (
    <section
      id="workflow"
      className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          The workflow
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-4 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          One project.
          <br />
          One source of <span className="text-[#4F7EF7]">truth.</span>
        </motion.h2>
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <motion.p
            {...reveal(0.1)}
            className="max-w-xl text-lg leading-relaxed text-[#A0A0A0]"
          >
            Follow the{" "}
            <span className="text-white">Northstar Website Redesign</span> —{" "}
            <span className="font-mono text-[#4F7EF7]">A$8,400</span> — from
            first proposal to final payment.
          </motion.p>

          <motion.div
            {...reveal(0.15)}
            className="hidden shrink-0 items-center gap-2 sm:flex"
          >
            <button
              type="button"
              aria-label="Scroll workflow left"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111] text-[#A0A0A0] transition-all hover:border-[#444] hover:bg-[#1A1A1A] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#2A2A2A] disabled:hover:bg-[#111] disabled:hover:text-[#A0A0A0]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              aria-label="Scroll workflow right"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111] text-[#A0A0A0] transition-all hover:border-[#444] hover:bg-[#1A1A1A] hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[#2A2A2A] disabled:hover:bg-[#111] disabled:hover:text-[#A0A0A0]"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </motion.div>
        </div>

        <motion.div {...reveal(0.18)} className="relative">
          <div
            ref={scrollRef}
            className="workflow-scroll -mx-6 overflow-x-auto scroll-smooth px-6"
          >
            <div className="flex gap-4">
              {stages.map((stage) => (
                <article
                  key={stage.number}
                  className={`min-w-[260px] rounded-xl bg-[#111] p-6 transition-all ${
                    stage.active
                      ? "border-2 border-[#4F7EF7] active-pulse"
                      : "border border-[#2A2A2A] hover:border-[#444] hover:bg-[#151515]"
                  }`}
                >
                  <header className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#555]">
                      {stage.number}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                        STATUS_CLASS[stage.status]
                      }`}
                    >
                      {stage.statusLabel}
                    </span>
                  </header>
                  <h3 className="mt-4 mb-2 text-base font-bold text-white">
                    {stage.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#A0A0A0]">
                    {stage.description}
                  </p>
                  {stage.amount ? (
                    <p className="mt-3 font-mono text-sm font-bold text-[#4F7EF7]">
                      {stage.amount}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

        </motion.div>

        <p className="mt-6 font-mono text-xs text-[#555] sm:hidden">
          scroll to follow the project →
        </p>
      </div>
      <style jsx>{`
        :global(.workflow-scroll) {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 32px,
            black calc(100% - 32px),
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            black 32px,
            black calc(100% - 32px),
            transparent
          );
        }
        :global(.workflow-scroll)::-webkit-scrollbar {
          display: none;
        }
        :global(.active-pulse) {
          animation: workflow-card-pulse 2s ease-in-out infinite;
        }
        @keyframes workflow-card-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(79, 126, 247, 0);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(79, 126, 247, 0.18);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          :global(.active-pulse) {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
