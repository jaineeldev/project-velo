"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";
import { steps, type Step } from "../_lib/data";

// Alternating full-width steps. A continuous vertical line runs down the left
// edge with a single small primary anchor per step. A massive low-opacity
// sans step number sits behind the content as structural typography.
export function HowItWorks() {
  const prefersReduced = useReducedMotion();

  return (
    <section id="how-it-works" className="relative bg-[#0d0d0f]">
      <div
        aria-hidden
        className="absolute bottom-0 left-6 top-0 w-px bg-white/10 sm:left-10"
      />

      <div className="relative mx-auto max-w-7xl px-16 pb-16 pt-32 sm:px-20 sm:pb-24 sm:pt-44">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          How it works
        </p>
        <h2 className="mt-6 max-w-3xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl">
          Approve once. The setup is{" "}
          <span className="text-primary">done.</span>
        </h2>
      </div>

      <div>
        {steps.map((step, i) => (
          <StepSection
            key={step.number}
            step={step}
            isAlt={i % 2 === 1}
            prefersReduced={prefersReduced}
          />
        ))}
      </div>
    </section>
  );
}

function StepSection({
  step,
  isAlt,
  prefersReduced,
}: {
  step: Step;
  isAlt: boolean;
  prefersReduced: boolean | null;
}) {
  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  return (
    <section
      className={cn(
        "relative overflow-hidden border-y border-white/[0.05]",
        isAlt ? "bg-[#111113]" : "bg-[#0d0d0f]",
      )}
    >
      {/* Barely-visible sans step number, sized to fill the right edge. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 select-none -translate-y-1/2 font-extrabold leading-none tracking-[-0.05em] text-white/[0.03] text-[16rem] sm:text-[20rem]"
      >
        {step.number}
      </span>

      {/* Anchor node on the vertical line. No glow. */}
      <span
        aria-hidden
        className="absolute left-6 top-32 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-primary sm:left-10"
      />

      <motion.div
        {...fadeUp}
        viewport={{ once: true, amount: 0.25 }}
        className="relative mx-auto grid w-full max-w-7xl gap-12 px-16 py-32 sm:px-20 sm:py-40 md:grid-cols-2 md:gap-16 lg:gap-24"
      >
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Step {step.number}
          </p>
          <h3 className="mt-5 text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            {step.title}.
          </h3>
          <p className="mt-7 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            {step.description}
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          <StepIllustration kind={step.number} />
        </div>
      </motion.div>
    </section>
  );
}

function StepIllustration({ kind }: { kind: string }) {
  if (kind === "01") return <ProposalBuilderMock />;
  if (kind === "02") return <ClientApprovalMock />;
  return <LiveProjectMock />;
}

// Card shell shared by all three step mocks so they match each other and the
// feature mockups on /features. Slight shadow, soft border, dark interior.
const cardBase =
  "relative w-full max-w-md overflow-hidden rounded-xl border border-white/[0.08] bg-[#141416] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]";

// Step 1: a proposal builder slice. Title field, three editable line items,
// totals, a primary Send action. The intent is "this is the screen you'll
// actually be working in."
function ProposalBuilderMock() {
  return (
    <div className={cn(cardBase, "p-6 sm:p-7")}>
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            New proposal · Acme Studio
          </p>
          <h4 className="mt-2 text-base font-bold tracking-[-0.02em] text-white sm:text-lg">
            Website Redesign
          </h4>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          Draft
        </span>
      </div>

      <div className="mt-4 space-y-2.5 text-sm">
        {[
          { label: "Discovery & wireframes", value: "A$2,400" },
          { label: "Visual design", value: "A$4,800" },
          { label: "Development", value: "A$8,000" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-3 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-white/80"
          >
            <span className="truncate">{label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-white">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-3 text-xs">
        <div className="flex items-baseline justify-between text-white/55">
          <span>Subtotal</span>
          <span className="tabular-nums">A$15,200</span>
        </div>
        <div className="flex items-baseline justify-between text-white/55">
          <span>GST (10%)</span>
          <span className="tabular-nums">A$1,520</span>
        </div>
        <div className="flex items-baseline justify-between pt-1.5 text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
            Total
          </span>
          <span className="text-lg font-bold tabular-nums tracking-tight">
            A$16,720
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end border-t border-white/[0.06] pt-4">
        <span className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)]">
          <Send aria-hidden className="h-3 w-3" strokeWidth={2.25} />
          Send to client
        </span>
      </div>
    </div>
  );
}

// Step 2: the client-facing approval view. Wrapped in a fake browser chrome
// because the whole point is that this is the URL the client opens. The
// most important mockup on the marketing site since it answers the
// freelancer's biggest fear: "what does my client actually see?"
function ClientApprovalMock() {
  return (
    <div className={cardBase}>
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-white/[0.05] bg-black/40 px-3 py-1 text-[11px] text-white/45">
          <Lock aria-hidden className="h-3 w-3" strokeWidth={2.25} />
          velo.app/p/acme-redesign
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          For Sarah Chen · sarah@acmestudio.com
        </p>
        <h4 className="mt-2 text-lg font-bold leading-tight tracking-[-0.02em] text-white sm:text-xl">
          Website Redesign proposal
        </h4>
        <p className="mt-1 text-xs text-white/55">
          From Jaineel · sent 2 days ago
        </p>

        <div className="mt-5 space-y-1.5 border-y border-white/[0.06] py-4 text-xs">
          <div className="flex items-baseline justify-between text-white/70">
            <span>Discovery & wireframes</span>
            <span className="tabular-nums">A$2,400</span>
          </div>
          <div className="flex items-baseline justify-between text-white/70">
            <span>Visual design</span>
            <span className="tabular-nums">A$4,800</span>
          </div>
          <div className="flex items-baseline justify-between text-white/70">
            <span>Development</span>
            <span className="tabular-nums">A$8,000</span>
          </div>
          <div className="flex items-baseline justify-between pt-2 text-white">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
              Total inc. GST
            </span>
            <span className="text-base font-bold tabular-nums">A$16,720</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1.4fr] gap-2.5">
          <button
            type="button"
            className="rounded-md border border-white/15 bg-transparent px-3 py-2.5 text-xs font-semibold text-white/75"
          >
            Request changes
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.55)]"
          >
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
            Approve proposal
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-white/40">
          Logged into a free Velo client account · approval timestamped
        </p>
      </div>
    </div>
  );
}

// Step 3: the autogenerated project + invoice stack. Two mini cards inside
// the same shell so the visual story is "approval becomes two new records,
// instantly."
function LiveProjectMock() {
  const milestones = [
    { label: "Discovery & wireframes", done: true },
    { label: "Visual design", done: true },
    { label: "Development", done: false },
    { label: "QA & launch", done: false },
  ];
  return (
    <div className={cn(cardBase, "p-5 sm:p-6")}>
      <div className="space-y-4">
        {/* Project card */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Project · Acme Studio
              </p>
              <h4 className="mt-1 text-sm font-bold tracking-[-0.01em] text-white">
                Website Redesign
              </h4>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {milestones.map(({ label, done }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 text-xs"
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                    done
                      ? "bg-emerald-500/90"
                      : "border border-white/20",
                  )}
                >
                  {done ? (
                    <Check
                      className="h-2 w-2 text-white"
                      strokeWidth={3.5}
                    />
                  ) : null}
                </span>
                <span
                  className={cn(
                    "flex-1 truncate",
                    done ? "text-white/45" : "text-white/75",
                  )}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-white/40">
            2 of 4 milestones · created from the proposal
          </p>
        </div>

        {/* Invoice card */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Invoice · INV-2026-018
              </p>
              <h4 className="mt-1 text-sm font-bold tracking-[-0.01em] text-white">
                Deposit · 33%
              </h4>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Sent
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-white">
              A$5,040
            </p>
            <span className="text-[10px] text-white/45">
              auto-generated · ready to send
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
