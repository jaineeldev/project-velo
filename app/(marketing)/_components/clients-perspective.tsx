"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  Lock,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "../_lib/shared";

export type ClientPerspectiveIconKey =
  | "mail"
  | "approve"
  | "dashboard"
  | "payment";

const iconMap = {
  mail: Mail,
  approve: CheckCircle2,
  dashboard: LayoutDashboard,
  payment: CreditCard,
} as const;

export function ClientPerspectiveRow({
  eyebrow,
  iconKey,
  index,
  title,
  body,
  mockup,
  flipped,
  tone,
}: {
  eyebrow: string;
  iconKey: ClientPerspectiveIconKey;
  index: number;
  title: string;
  body: string;
  mockup: ReactNode;
  flipped: boolean;
  tone: "light" | "dark";
}) {
  const Icon = iconMap[iconKey];
  const prefersReduced = useReducedMotion();

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE_OUT },
      };

  const isDark = tone === "dark";
  const titleClass = isDark ? "text-white" : "text-black";
  const bodyClass = isDark ? "text-white/70" : "text-[#737373]";
  const metaClass = isDark ? "text-white/60" : "text-[#737373]";

  return (
    <motion.div
      {...fadeUp}
      viewport={{ once: true, amount: 0.25 }}
      className={cn(
        "border-b-2 border-black first:border-t-2",
        isDark && "border-b-2 border-white/20 first:border-t-2 first:border-white/20",
      )}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 md:grid-cols-2 md:gap-16 lg:gap-20">
        <div
          className={cn(
            "flex flex-col justify-center",
            flipped ? "md:order-2" : "md:order-1",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "border-2 border-current px-2 py-0.5 font-mono text-xs font-bold uppercase tabular-nums",
                metaClass,
              )}
            >
              {String(index).padStart(2, "0")}
            </span>
            <Icon
              aria-hidden
              className={cn("h-5 w-5", isDark ? "text-white" : "text-blue-600")}
              strokeWidth={2.5}
            />
            <span
              className={cn(
                "font-mono text-xs font-bold uppercase tracking-widest",
                metaClass,
              )}
            >
              {eyebrow}
            </span>
          </div>
          <h3
            className={cn(
              "mt-7 text-balance font-display text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl",
              titleClass,
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-7 max-w-md text-lg leading-relaxed",
              bodyClass,
            )}
          >
            {body}
          </p>
        </div>
        <div className={cn(flipped ? "md:order-1" : "md:order-2")}>
          {mockup}
        </div>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Mockups — brut style, no rounded corners, black borders, offset shadows.
// =============================================================================

const lightShell =
  "relative w-full overflow-hidden border-2 border-black bg-white shadow-brut";
const darkShell =
  "relative w-full overflow-hidden border-2 border-white bg-black shadow-brut-white";

export function ProposalSharePageMock() {
  return (
    <div className={lightShell}>
      <BrowserChrome tone="light" url="velo.app/p/ironbark-redesign-2026" />

      <div className="px-6 pb-7 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
              For Tom Barrett, tom@ironbarkdigital.com.au
            </p>
            <h4 className="mt-2 font-display text-xl font-black leading-tight tracking-[-0.02em] text-black sm:text-2xl">
              Website Redesign proposal
            </h4>
            <p className="mt-1 text-xs text-[#737373]">
              From Jaineel, sent 2 days ago
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center border-2 border-black bg-[#FF90E8] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
            Awaiting you
          </span>
        </div>

        <div className="mt-5 space-y-2 border-2 border-black bg-white px-4 py-3.5">
          {[
            { label: "Discovery & wireframes", value: "A$2,400" },
            { label: "Visual design", value: "A$4,800" },
            { label: "Development", value: "A$8,000" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="text-[#737373]">{label}</span>
              <span className="shrink-0 font-mono font-bold tabular-nums text-black">
                {value}
              </span>
            </div>
          ))}
          <div className="mt-1 space-y-1 border-t-2 border-black pt-2 text-[11px]">
            <div className="flex items-baseline justify-between text-[#737373]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">A$15,200</span>
            </div>
            <div className="flex items-baseline justify-between text-[#737373]">
              <span>GST (10%)</span>
              <span className="font-mono tabular-nums">A$1,520</span>
            </div>
            <div className="flex items-baseline justify-between pt-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                Total inc. GST
              </span>
              <span className="font-mono text-lg font-black tabular-nums text-black">
                A$16,720
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1.4fr] gap-3">
          <button
            type="button"
            className="border-2 border-black bg-white px-3 py-2.5 text-xs font-bold text-black shadow-brut-sm"
            tabIndex={-1}
          >
            Request changes
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 border-2 border-black bg-black px-3 py-2.5 text-xs font-bold text-white shadow-brut-sm"
            tabIndex={-1}
          >
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
            Approve proposal
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-[#737373]">
          No payment details required to approve
        </p>
      </div>
    </div>
  );
}

export function ApprovalConfirmationMock() {
  return (
    <div className={cn(darkShell, "mx-auto max-w-lg p-8 sm:p-10")}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center border-2 border-white bg-white text-black">
          <CheckCircle2
            aria-hidden
            className="h-7 w-7"
            strokeWidth={2.5}
          />
        </span>
        <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          Proposal approved
        </p>
        <h4 className="mt-2 font-display text-xl font-black leading-tight tracking-[-0.02em] text-white sm:text-2xl">
          Website Redesign
        </h4>
        <p className="mt-1 text-xs text-white/60">
          Ironbark Digital, A$16,720 inc. GST
        </p>
      </div>

      <div className="mt-7 space-y-3 border-2 border-white bg-black p-4 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-white/50">Approved by</span>
          <span className="shrink-0 font-bold text-white">Tom Barrett</span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-white/50">Verified email</span>
          <span className="shrink-0 font-mono text-[11px] text-white">
            tom@ironbarkdigital.com.au
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t-2 border-white/40 pt-3">
          <span className="text-white/50">Timestamp</span>
          <span className="shrink-0 font-mono tabular-nums text-white">
            26 May 2026, 2:14pm AEST
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-2 border-white bg-[#FF90E8] px-4 py-3 text-xs text-black">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-white">
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <div>
            <p className="font-bold text-black">Project kicked off</p>
            <p className="mt-0.5 text-[11px] text-black/70">
              Milestones and deposit invoice now in your portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientDashboardMock() {
  return (
    <div className={cn(lightShell, "p-6 sm:p-7")}>
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center border-2 border-black bg-white font-mono text-[10px] font-bold uppercase text-black">
            TB
          </span>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
              Your projects
            </p>
            <p className="mt-0.5 text-sm font-bold tracking-tight text-black">
              Tom Barrett, Ironbark Digital
            </p>
          </div>
        </div>
        <span className="inline-flex items-center border-2 border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
          2 active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="border-2 border-black bg-white p-4 shadow-brut-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                Proposal
              </p>
              <h5 className="mt-1 text-sm font-bold tracking-tight text-black">
                Website Redesign
              </h5>
              <p className="mt-0.5 text-[11px] text-[#737373]">
                From Jaineel, A$16,720
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center border-2 border-black bg-[#FF90E8] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              Review
            </span>
          </div>
        </div>

        <div className="border-2 border-black bg-white p-4 shadow-brut-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#737373]">
                Project
              </p>
              <h5 className="mt-1 text-sm font-bold tracking-tight text-black">
                Brand Refresh
              </h5>
              <p className="mt-0.5 text-[11px] text-[#737373]">
                2 of 4 milestones, next due Apr 12
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center border-2 border-black bg-black px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
              Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 border-2 border-black bg-white">
              <div className="h-full bg-blue-600" style={{ width: "50%" }} />
            </div>
            <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-black">
              50%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentPendingProjectMock() {
  return (
    <div className={cn(darkShell, "p-6 sm:p-7")}>
      <div className="flex items-start justify-between gap-3 border-b-2 border-white/40 pb-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/60">
            Project, Ironbark Digital
          </p>
          <h4 className="mt-1.5 text-sm font-bold tracking-tight text-white">
            Website Redesign
          </h4>
        </div>
        <span className="inline-flex shrink-0 items-center border-2 border-white bg-[#D97706] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          Deposit pending
        </span>
      </div>

      <div className="mt-4 border-2 border-white bg-black p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
              Deposit due
            </p>
            <p className="mt-1 text-xs text-white/60">
              Bank transfer, INV-2026-018
            </p>
          </div>
          <p className="font-mono text-2xl font-black tabular-nums text-white">
            A$5,040
          </p>
        </div>
        <p className="mt-3 border-t-2 border-white/40 pt-3 text-[11px] text-white/60">
          Due by 2 Jun 2026, 33% upfront before work begins
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-white/60">
          <span>Remaining on milestones</span>
          <span className="font-mono tabular-nums">A$11,680</span>
        </div>
        <div className="flex items-center justify-between text-white/60">
          <span>Total project value</span>
          <span className="font-mono tabular-nums">A$16,720</span>
        </div>
      </div>
    </div>
  );
}

function BrowserChrome({
  tone,
  url,
}: {
  tone: "light" | "dark";
  url: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b-2 px-4 py-3",
        isDark ? "border-white bg-black" : "border-black bg-white",
      )}
    >
      <div className="flex gap-1.5">
        <span
          className={cn(
            "h-3 w-3 border-2",
            isDark ? "border-white bg-black" : "border-black bg-white",
          )}
        />
        <span
          className={cn(
            "h-3 w-3 border-2",
            isDark ? "border-white bg-black" : "border-black bg-white",
          )}
        />
        <span
          className={cn(
            "h-3 w-3 border-2",
            isDark ? "border-white bg-black" : "border-black bg-white",
          )}
        />
      </div>
      <div
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 border-2 px-3 py-1 font-mono text-[11px] font-bold",
          isDark
            ? "border-white bg-black text-white"
            : "border-black bg-white text-black",
        )}
      >
        <Lock aria-hidden className="h-3 w-3" strokeWidth={2.5} />
        {url}
      </div>
      <span
        className={cn(
          "hidden h-6 w-6 items-center justify-center border-2 sm:flex",
          isDark
            ? "border-white bg-black text-white"
            : "border-black bg-white text-black",
        )}
      >
        <Mail aria-hidden className="h-3 w-3" strokeWidth={2.5} />
      </span>
    </div>
  );
}
