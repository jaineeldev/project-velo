"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  FileText,
  Mail,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";

// Visible length of one demo cycle. The wrapper plays a 0.4s exit fade on top
// of this, so a full loop (visible + reset) is ~7.4s.
const CYCLE_MS = 7000;

// Stage cues, in seconds from the cycle's mount. Every animated child uses
// these so the orchestration lives in one place.
const T = {
  item1: 0.3,
  item2: 0.6,
  item3: 0.9,
  totals: 1.3,
  sendPulse: 2.2,
  emailIn: 2.6,
  statusMorph: 3.7,
  approvalIn: 4.0,
  sendOut: 4.05,
  projectIn: 5.0,
  invoiceIn: 5.25,
} as const;

// Homepage hero. Bold typographic statement up top, a live proposal demo
// underneath that autoplays the full proposal → approval → project + invoice
// lifecycle on a continuous loop.
export function Hero() {
  const prefersReduced = useReducedMotion();
  const [cycle, setCycle] = useState(0);

  // Re-arm the timer per cycle so each loop gets the full window even after
  // AnimatePresence's exit-then-mount gap.
  useEffect(() => {
    if (prefersReduced) return;
    const id = window.setTimeout(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [cycle, prefersReduced]);

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden bg-[#0d0d0f]">
      {/* Signature dual-tone aurora. Blue (sent) bleeds into emerald
          (approved), echoing the product story. Same backdrop recurs on the
          pricing teaser and FinalCTA so the eye learns it as the brand. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(75% 45% at 50% 28%, rgba(37,99,235,0.10), transparent 65%)",
            "radial-gradient(55% 40% at 72% 64%, rgba(16,185,129,0.06), transparent 70%)",
          ].join(", "),
        }}
      />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-28">
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Proposal to invoice, for freelance devs
          </span>
          <h1 className="mt-8 max-w-5xl text-balance text-7xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white md:text-8xl lg:text-[6.5rem]">
            <span className="block">Ship code,</span>
            <span className="mt-1 block">
              not <span className="text-blue-500">spreadsheets.</span>
            </span>
          </h1>

          <p className="mt-10 max-w-xl text-lg text-white/70">
            Send proposals, get approved online, and auto-generate the project
            and deposit invoice the moment a client signs. One tool, not five.
          </p>

          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link
              href="/sign-up"
              className={cn(
                "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
                focusRing,
              )}
            >
              Start free trial
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                "inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-transparent px-7 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]",
                focusRing,
              )}
            >
              See how it works
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-1 items-center justify-center sm:mt-20">
          <DemoFrame cycle={cycle} prefersReduced={!!prefersReduced} />
        </div>
      </div>
    </section>
  );
}

function DemoFrame({
  cycle,
  prefersReduced,
}: {
  cycle: number;
  prefersReduced: boolean;
}) {
  return (
    <div aria-hidden className="w-full max-w-xl sm:max-w-4xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={cycle}
          exit={
            prefersReduced
              ? undefined
              : { opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }
          }
        >
          <Demo prefersReduced={prefersReduced} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Demo({ prefersReduced }: { prefersReduced: boolean }) {
  const reveal = (delay: number) =>
    prefersReduced
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
        }
      : {
          initial: { opacity: 0, y: 6 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: EASE_OUT },
        };

  const lineItems = [
    { label: "Discovery & wireframes", value: "AU$2,400", delay: T.item1 },
    { label: "Visual design", value: "AU$4,800", delay: T.item2 },
    { label: "Development", value: "AU$8,000", delay: T.item3 },
  ];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#141416] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-8 sm:py-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
              Proposal · Acme Studio
            </p>
            <h3 className="mt-3 text-xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-2xl">
              Website Redesign
            </h3>
          </div>
          <StatusBadge prefersReduced={prefersReduced} />
        </div>

        <div className="space-y-3 px-6 py-6 sm:px-8 sm:py-7">
          {lineItems.map(({ label, value, delay }) => (
            <motion.div
              key={label}
              {...reveal(delay)}
              className="flex items-center justify-between text-sm text-white/80"
            >
              <span>{label}</span>
              <span className="font-semibold tabular-nums text-white">
                {value}
              </span>
            </motion.div>
          ))}
        </div>

        <div className="space-y-2 border-t border-white/[0.06] px-6 py-5 text-sm sm:px-8 sm:py-6">
          <motion.div
            {...reveal(T.totals)}
            className="flex items-center justify-between text-white/55"
          >
            <span>Subtotal</span>
            <CountUp
              to={15200}
              delay={T.totals}
              prefersReduced={prefersReduced}
            />
          </motion.div>
          <motion.div
            {...reveal(T.totals + 0.15)}
            className="flex items-center justify-between text-white/55"
          >
            <span>GST (10%)</span>
            <CountUp
              to={1520}
              delay={T.totals + 0.15}
              prefersReduced={prefersReduced}
            />
          </motion.div>
          <motion.div
            {...reveal(T.totals + 0.3)}
            className="flex items-baseline justify-between pt-2"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              Total
            </span>
            <CountUp
              to={16720}
              delay={T.totals + 0.3}
              prefersReduced={prefersReduced}
              big
            />
          </motion.div>
        </div>

        <div className="grid border-t border-white/[0.06] px-6 py-5 sm:px-8 sm:py-6">
          <div className="col-start-1 row-start-1 flex justify-end">
            <SendButton prefersReduced={prefersReduced} />
          </div>
          <div className="col-start-1 row-start-1 flex items-center justify-end">
            <ApprovalText prefersReduced={prefersReduced} />
          </div>
        </div>
      </div>

      <EmailNotification prefersReduced={prefersReduced} />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <SecondaryCard
          delay={T.projectIn}
          prefersReduced={prefersReduced}
          icon={FileText}
          eyebrow="Project created"
          title="Website Redesign"
          detail="3 milestones · kicked off today"
        />
        <SecondaryCard
          delay={T.invoiceIn}
          prefersReduced={prefersReduced}
          icon={Receipt}
          eyebrow="Invoice ready"
          title="Deposit invoice"
          detail="AU$5,040 · 33% upfront"
        />
      </div>
    </div>
  );
}

function CountUp({
  to,
  delay,
  prefersReduced,
  big = false,
}: {
  to: number;
  delay: number;
  prefersReduced: boolean;
  big?: boolean;
}) {
  const value = useMotionValue(prefersReduced ? to : 0);
  const display = useTransform(
    value,
    (v) => `AU$${Math.round(v).toLocaleString()}`,
  );

  useEffect(() => {
    if (prefersReduced) {
      value.set(to);
      return;
    }
    value.set(0);
    const controls = animate(value, to, {
      delay,
      duration: 0.7,
      ease: EASE_OUT,
    });
    return () => controls.stop();
  }, [to, delay, prefersReduced, value]);

  return (
    <motion.span
      className={cn(
        "font-semibold tabular-nums text-white",
        big && "text-xl font-bold tracking-tight sm:text-2xl",
      )}
    >
      {display}
    </motion.span>
  );
}

function StatusBadge({ prefersReduced }: { prefersReduced: boolean }) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.02em]";

  if (prefersReduced) {
    return (
      <span className={cn(base, "bg-emerald-500/15 text-emerald-400")}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Approved
      </span>
    );
  }

  return (
    <span className="relative inline-grid shrink-0">
      <motion.span
        className={cn(
          base,
          "col-start-1 row-start-1 bg-white/[0.06] text-white/60",
        )}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: T.statusMorph, duration: 0.5, ease: "easeOut" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/35" />
        Draft
      </motion.span>
      <motion.span
        className={cn(
          base,
          "col-start-1 row-start-1 bg-emerald-500/15 text-emerald-400",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: T.statusMorph, duration: 0.5, ease: "easeOut" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Approved
      </motion.span>
    </span>
  );
}

function SendButton({ prefersReduced }: { prefersReduced: boolean }) {
  if (prefersReduced) return null;
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: T.sendOut, duration: 0.4, ease: "easeOut" }}
    >
      <motion.span
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ delay: T.sendPulse, duration: 0.55, ease: "easeOut" }}
      >
        Send to client
      </motion.span>
    </motion.div>
  );
}

function ApprovalText({ prefersReduced }: { prefersReduced: boolean }) {
  if (prefersReduced) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-emerald-400">
          <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="font-medium text-white/80">
          Approved by Sarah Chen
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-2 text-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: T.approvalIn, duration: 0.5, ease: EASE_OUT }}
    >
      <motion.span
        className="text-emerald-400"
        initial={{ scale: 0, rotate: -25 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: T.approvalIn + 0.05,
          duration: 0.55,
          ease: [0.34, 1.3, 0.64, 1],
        }}
      >
        <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
      </motion.span>
      <span className="font-medium text-white/80">
        Approved by Sarah Chen
      </span>
    </motion.div>
  );
}

function EmailNotification({
  prefersReduced,
}: {
  prefersReduced: boolean;
}) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { delay: T.emailIn, duration: 0.55, ease: EASE_OUT }
      }
      className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-[#141416] px-4 py-3 shadow-xl"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
        <Mail aria-hidden className="h-3.5 w-3.5" strokeWidth={2.25} />
      </span>
      <p className="text-sm text-white/70">
        Proposal sent to{" "}
        <span className="font-semibold text-white">
          sarah@acmestudio.com
        </span>
      </p>
    </motion.div>
  );
}

function SecondaryCard({
  delay,
  prefersReduced,
  icon: Icon,
  eyebrow,
  title,
  detail,
}: {
  delay: number;
  prefersReduced: boolean;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReduced
          ? { duration: 0 }
          : { delay, duration: 0.6, ease: EASE_OUT }
      }
      className="rounded-xl border border-white/[0.08] bg-[#141416] p-5 shadow-2xl sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Icon aria-hidden className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {eyebrow}
        </p>
      </div>
      <p className="mt-4 text-base font-bold text-white">{title}</p>
      <p className="mt-1 text-sm text-white/60">{detail}</p>
    </motion.div>
  );
}
