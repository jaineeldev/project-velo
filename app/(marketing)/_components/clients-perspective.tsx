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

// Icon keys → lucide components. Resolved inside the client component so the
// page server file can pass a plain string across the RSC boundary instead of
// a function reference (which RSC refuses to serialise).
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

// Alternating two-column section used on the /clients page. Mirrors the
// FeatureRow rhythm (eyebrow + hairline + icon + headline + body) but accepts
// an arbitrary mockup as the right-hand element so each row can show a
// purpose-built piece of client UI instead of one of the eight feature mocks.
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
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  const isDark = tone === "dark";
  const titleClass = isDark ? "text-white" : "text-black";
  const bodyClass = isDark ? "text-white/60" : "text-[#666666]";
  const metaClass = isDark ? "text-white/40" : "text-neutral-400";
  const dividerClass = isDark ? "bg-white/15" : "bg-neutral-200";
  const borderClass = isDark ? "border-white/[0.06]" : "border-gray-100";

  return (
    <motion.div
      {...fadeUp}
      viewport={{ once: true, amount: 0.25 }}
      className={cn("border-b first:border-t", borderClass)}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-24 md:grid-cols-2 md:gap-16 lg:gap-28">
        <div
          className={cn(
            "flex flex-col justify-center",
            flipped ? "md:order-2" : "md:order-1",
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.28em] tabular-nums",
                metaClass,
              )}
            >
              {String(index).padStart(2, "0")}
            </span>
            <span className={cn("h-px w-12", dividerClass)} />
            <Icon aria-hidden className="h-4 w-4 text-primary" strokeWidth={2} />
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.22em]",
                metaClass,
              )}
            >
              {eyebrow}
            </span>
          </div>
          <h3
            className={cn(
              "mt-8 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-6xl",
              titleClass,
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              "mt-7 max-w-md text-base leading-relaxed sm:text-lg",
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
// Mockups
// =============================================================================
//
// Each mockup is a tight slice of what the client themselves would see in
// Velo. Same shell idiom as feature-mockup.tsx (rounded-2xl card, hairline
// border, soft shadow) so the /clients page reads as part of the same product
// surface, not a different design system.

const lightShell =
  "relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md";
const darkShell =
  "relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141416] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]";

// ---------------------------------------------------------------------------
// 1. Proposal share page (light)
// ---------------------------------------------------------------------------
// A faithful slice of velo.app/p/<token>. Wrapped in light browser chrome so
// the visitor immediately reads it as "this is what shows up in my client's
// browser." Bigger than the other mocks since it carries Section 1.
export function ProposalSharePageMock() {
  return (
    <div className={lightShell}>
      <BrowserChrome tone="light" url="velo.app/p/ironbark-redesign-2026" />

      <div className="px-6 pb-7 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              For Tom Barrett, tom@ironbarkdigital.com.au
            </p>
            <h4 className="mt-2 text-xl font-bold leading-tight tracking-[-0.02em] text-black sm:text-2xl">
              Website Redesign proposal
            </h4>
            <p className="mt-1 text-xs text-neutral-500">
              From Jaineel, sent 2 days ago
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Awaiting you
          </span>
        </div>

        <div className="mt-5 space-y-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5">
          {[
            { label: "Discovery & wireframes", value: "A$2,400" },
            { label: "Visual design", value: "A$4,800" },
            { label: "Development", value: "A$8,000" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-3 text-xs"
            >
              <span className="text-neutral-700">{label}</span>
              <span className="shrink-0 font-semibold tabular-nums text-black">
                {value}
              </span>
            </div>
          ))}
          <div className="mt-1 space-y-1 border-t border-gray-200/80 pt-2 text-[11px]">
            <div className="flex items-baseline justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="tabular-nums">A$15,200</span>
            </div>
            <div className="flex items-baseline justify-between text-neutral-500">
              <span>GST (10%)</span>
              <span className="tabular-nums">A$1,520</span>
            </div>
            <div className="flex items-baseline justify-between pt-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Total inc. GST
              </span>
              <span className="text-lg font-bold tabular-nums tracking-tight text-black">
                A$16,720
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_1.4fr] gap-2.5">
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-neutral-700"
            tabIndex={-1}
          >
            Request changes
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white"
            tabIndex={-1}
          >
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
            Approve proposal
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] text-neutral-400">
          No payment details required to approve
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. Approval confirmation (dark)
// ---------------------------------------------------------------------------
// What the client sees the instant they click Approve. Single green node up
// top to mark the moment, a verified-by panel below to show the audit detail
// gets recorded (timestamp + verified email) without saying "audit trail" in
// marketing voice.
export function ApprovalConfirmationMock() {
  return (
    <div className={cn(darkShell, "mx-auto max-w-sm p-8 sm:p-10")}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2
            aria-hidden
            className="h-7 w-7 text-emerald-400"
            strokeWidth={2}
          />
        </span>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
          Proposal approved
        </p>
        <h4 className="mt-2 text-xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-2xl">
          Website Redesign
        </h4>
        <p className="mt-1 text-xs text-white/55">
          Ironbark Digital, A$16,720 inc. GST
        </p>
      </div>

      <div className="mt-7 space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-white/45">Approved by</span>
          <span className="shrink-0 font-semibold text-white">
            Tom Barrett
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-white/45">Verified email</span>
          <span className="shrink-0 font-mono text-[11px] text-white/80">
            tom@ironbarkdigital.com.au
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="text-white/45">Timestamp</span>
          <span className="shrink-0 tabular-nums text-white/80">
            26 May 2026, 2:14pm AEST
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/[0.06] px-4 py-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-semibold text-white">Project kicked off</p>
            <p className="mt-0.5 text-[11px] text-white/50">
              Milestones and deposit invoice now in your portal
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. Client dashboard (light)
// ---------------------------------------------------------------------------
// "Your projects" page from the client's portal. Stacked cards, two records:
// one proposal still under review, one active project with milestone progress.
// Tightly scoped so the visual story is "they get one screen, no clutter."
export function ClientDashboardMock() {
  return (
    <div className={cn(lightShell, "p-6 sm:p-7")}>
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase tracking-wider text-primary">
            TB
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Your projects
            </p>
            <p className="mt-0.5 text-sm font-semibold tracking-[-0.01em] text-black">
              Tom Barrett, Ironbark Digital
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
          2 active
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {/* Proposal awaiting client approval */}
        <div className="rounded-xl border border-primary/25 bg-primary/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Proposal
              </p>
              <h5 className="mt-1 text-sm font-bold tracking-[-0.01em] text-black">
                Website Redesign
              </h5>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                From Jaineel, A$16,720
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Review
            </span>
          </div>
        </div>

        {/* Active project with milestone progress */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                Project
              </p>
              <h5 className="mt-1 text-sm font-bold tracking-[-0.01em] text-black">
                Brand Refresh
              </h5>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                2 of 4 milestones, next due Apr 12
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: "50%" }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-semibold tabular-nums text-neutral-500">
              50%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. Payment pending (dark)
// ---------------------------------------------------------------------------
// The thing the client sees on their dashboard when there is money due. Amber
// status pill, deposit row spelled out, remaining schedule below. The amber
// is deliberate: it is the same warning hue used in the app's invoicing UI.
export function PaymentPendingProjectMock() {
  return (
    <div className={cn(darkShell, "p-6 sm:p-7")}>
      <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Project, Ironbark Digital
          </p>
          <h4 className="mt-1.5 text-sm font-bold tracking-[-0.01em] text-white">
            Website Redesign
          </h4>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Deposit payment pending
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
              Deposit due
            </p>
            <p className="mt-1 text-xs text-white/55">
              Bank transfer, INV-2026-018
            </p>
          </div>
          <p className="text-2xl font-bold tabular-nums tracking-tight text-white">
            A$5,040
          </p>
        </div>
        <p className="mt-3 border-t border-amber-500/15 pt-3 text-[11px] text-white/55">
          Due by 2 Jun 2026, 33% upfront before work begins
        </p>
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-white/55">
          <span>Remaining on milestones</span>
          <span className="tabular-nums">A$11,680</span>
        </div>
        <div className="flex items-center justify-between text-white/55">
          <span>Total project value</span>
          <span className="tabular-nums">A$16,720</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared: a tiny browser chrome strip. Two tone variants so the share-page
// mock can sit on a light section without inheriting the dark-mode chrome
// used elsewhere in how-it-works.
// ---------------------------------------------------------------------------
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
        "flex items-center gap-3 border-b px-4 py-3",
        isDark
          ? "border-white/[0.06] bg-white/[0.02]"
          : "border-gray-100 bg-gray-50/80",
      )}
    >
      <div className="flex gap-1.5">
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isDark ? "bg-white/15" : "bg-gray-300",
          )}
        />
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isDark ? "bg-white/15" : "bg-gray-300",
          )}
        />
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isDark ? "bg-white/15" : "bg-gray-300",
          )}
        />
      </div>
      <div
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-1 text-[11px]",
          isDark
            ? "border-white/[0.05] bg-black/40 text-white/45"
            : "border-gray-200 bg-white text-neutral-500",
        )}
      >
        <Lock aria-hidden className="h-3 w-3" strokeWidth={2.25} />
        {url}
      </div>
      <span
        className={cn(
          "hidden h-5 w-5 items-center justify-center rounded-md sm:flex",
          isDark ? "text-white/40" : "text-neutral-400",
        )}
      >
        <Mail aria-hidden className="h-3 w-3" strokeWidth={2} />
      </span>
    </div>
  );
}
