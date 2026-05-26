"use client";

import {
  ArrowUpRight,
  Check,
  ExternalLink,
  FileText,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type FeatureMockupKind } from "../_lib/data";

// Each mockup is a tight, recognizable slice of real Velo UI: named clients,
// realistic AU$ figures, structured layout. The intent is that a viewer can
// glance at any of these and immediately understand what the feature is,
// without reading the caption next to it.
export function FeatureMockup({
  kind,
  tone = "light",
}: {
  kind: FeatureMockupKind;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";

  const shell = cn(
    "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border",
    isDark
      ? "border-white/[0.08] bg-[#141416] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)]"
      : "border-gray-200 bg-white shadow-md",
  );

  const c = isDark
    ? {
        text: "text-white",
        textSoft: "text-white/75",
        textMuted: "text-white/55",
        textFaint: "text-white/35",
        divider: "border-white/[0.08]",
        row: "border-white/[0.06]",
        chip: "border-white/[0.08] bg-white/[0.03]",
        chipText: "text-white/75",
        leader: "border-white/15",
        positive: "text-emerald-400",
        positiveBg: "bg-emerald-500/15 text-emerald-400",
        warning: "text-amber-400",
        warningBg: "bg-amber-500/15 text-amber-400",
        primary: "text-primary",
        primaryBg: "bg-primary/15 text-primary",
        primarySolid: "bg-primary text-white",
        ghostBtn:
          "border border-white/15 bg-transparent text-white/80 hover:bg-white/[0.04]",
      }
    : {
        text: "text-black",
        textSoft: "text-neutral-700",
        textMuted: "text-neutral-500",
        textFaint: "text-neutral-400",
        divider: "border-gray-100",
        row: "border-gray-100",
        chip: "border-gray-100 bg-gray-50",
        chipText: "text-neutral-700",
        leader: "border-neutral-300",
        positive: "text-emerald-600",
        positiveBg: "bg-emerald-50 text-emerald-700",
        warning: "text-amber-600",
        warningBg: "bg-amber-50 text-amber-700",
        primary: "text-primary",
        primaryBg: "bg-primary/10 text-primary",
        primarySolid: "bg-primary text-white",
        ghostBtn:
          "border border-gray-200 bg-white text-neutral-700 hover:bg-gray-50",
      };

  if (kind === "proposals") {
    return (
      <div className={cn(shell, "p-6 sm:p-7")}>
        <div className={cn("flex items-start justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Proposal · Ironbark Digital
            </p>
            <h4 className={cn("mt-2 text-lg font-bold tracking-[-0.02em]", c.text)}>
              Website Redesign
            </h4>
          </div>
          <StatusPill tone={tone} variant="primary">Sent</StatusPill>
        </div>

        <div className="mt-4 space-y-2">
          <LineRow tone={tone} label="Discovery & wireframes" value="A$2,400" />
          <LineRow tone={tone} label="Visual design" value="A$4,800" />
          <LineRow tone={tone} label="Development" value="A$8,000" />
        </div>

        <div className={cn("mt-4 space-y-1.5 border-t pt-3 text-xs", c.divider)}>
          <SummaryRow tone={tone} label="Subtotal" value="A$15,200" />
          <SummaryRow tone={tone} label="GST (10%)" value="A$1,520" />
          <div className="flex items-baseline justify-between pt-1">
            <span className={cn("text-[10px] font-semibold uppercase tracking-[0.2em]", c.textMuted)}>
              Total
            </span>
            <span className={cn("text-lg font-bold tabular-nums tracking-tight", c.text)}>
              A$16,720
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "portal") {
    const projects = [
      { name: "Northwind Co.", brief: "Website redesign", status: "Active", progress: 64, accent: true },
      { name: "Bayside Apparel", brief: "Brand refresh", status: "Review", progress: 90, accent: false },
      { name: "Loop Studio", brief: "Mobile app", status: "Live", progress: 100, accent: false },
    ];
    return (
      <div className={cn(shell, "p-6 sm:p-7")}>
        <div className={cn("flex items-center justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Client portal
            </p>
            <h4 className={cn("mt-1.5 text-sm font-bold tracking-[-0.01em]", c.text)}>
              Tom Barrett · 3 projects
            </h4>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]", c.positive)}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {projects.map((p) => (
            <div
              key={p.name}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                p.accent
                  ? isDark
                    ? "border-primary/40 bg-primary/[0.05]"
                    : "border-primary/30 bg-primary/[0.04]"
                  : c.chip,
              )}
            >
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-xs font-semibold", c.text)}>{p.name}</p>
                <p className={cn("truncate text-[10px]", c.textMuted)}>{p.brief}</p>
              </div>
              <div className="flex w-20 shrink-0 items-center gap-2">
                <div className={cn("h-1 flex-1 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-gray-100")}>
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <span className={cn("text-[9px] font-semibold tabular-nums uppercase tracking-[0.14em]", c.textFaint)}>
                  {p.progress}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "tracking") {
    const milestones = [
      { label: "Discovery & user interviews", done: true, due: "Mar 8" },
      { label: "Design system + key screens", done: true, due: "Mar 22" },
      { label: "Build, in flight", done: false, active: true, due: "Apr 12" },
      { label: "QA + launch checklist", done: false, active: false, due: "Apr 26" },
    ];
    return (
      <div className={cn(shell, "p-6 sm:p-7")}>
        <div className={cn("flex items-center justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Project · Ironbark Digital
            </p>
            <h4 className={cn("mt-1.5 text-sm font-bold tracking-[-0.01em]", c.text)}>
              Website Redesign · 2/4 done
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-1.5 w-16 overflow-hidden rounded-full", isDark ? "bg-white/10" : "bg-gray-100")}>
              <div className="h-full w-1/2 rounded-full bg-primary" />
            </div>
            <span className={cn("text-[10px] font-semibold tabular-nums", c.textMuted)}>50%</span>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-3 text-xs">
              <span
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  m.done
                    ? "bg-emerald-500/90"
                    : m.active
                      ? cn("ring-2 ring-primary/50", isDark ? "bg-primary/20" : "bg-primary/15")
                      : isDark
                        ? "border border-white/20"
                        : "border border-neutral-300",
                )}
              >
                {m.done ? <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} /> : null}
              </span>
              <span
                className={cn(
                  "flex-1 truncate",
                  m.done ? c.textMuted : c.textSoft,
                )}
              >
                {m.label}
              </span>
              <span className={cn("shrink-0 tabular-nums text-[10px]", c.textFaint)}>
                {m.due}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "invoicing") {
    return (
      <div className={cn(shell, "flex flex-col p-6 sm:p-7")}>
        <div className={cn("flex items-start justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Invoice · INV-2026-018
            </p>
            <h4 className={cn("mt-2 text-lg font-bold tracking-[-0.02em]", c.text)}>
              Deposit · Ironbark Digital
            </h4>
          </div>
          <StatusPill tone={tone} variant="positive">Paid</StatusPill>
        </div>

        <div className="mt-4 space-y-1.5 text-xs">
          <SummaryRow tone={tone} label="Bill to" value="tom@ironbarkdigital.com.au" />
          <SummaryRow tone={tone} label="Issued" value="18 Mar 2026" />
          <SummaryRow tone={tone} label="Paid by" value="Stripe · Visa •• 4242" />
        </div>

        <div className={cn("mt-auto flex items-end justify-between border-t pt-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.2em]", c.textMuted)}>
              Amount
            </p>
            <p className={cn("mt-1 text-2xl font-bold tabular-nums tracking-tight", c.text)}>
              A$5,040
            </p>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]", c.textMuted)}>
            33% · deposit
          </span>
        </div>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className={cn(shell, "flex items-center justify-center p-6")}>
        <div className="relative">
          <DocPage tone={tone} rotate="rotate-6" translateX="translate-x-6" />
          <div className="relative">
            <DocPage tone={tone} active />
          </div>
          <span className={cn("absolute -bottom-2 -right-2 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] shadow-lg", c.primarySolid)}>
            <FileText aria-hidden className="h-3 w-3" strokeWidth={2.5} />
            PDF
          </span>
        </div>
      </div>
    );
  }

  if (kind === "deliverables") {
    const links = [
      { label: "github.com/ironbark/redesign", note: "Commit 4a1b · merged" },
      { label: "figma.com/file/ironbark-final", note: "v12 · Tom approved" },
      { label: "ironbark-staging.vercel.app", note: "Latest preview" },
    ];
    return (
      <div className={cn(shell, "p-6 sm:p-7")}>
        <div className={cn("flex items-center justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Milestone 02 · Visual design
            </p>
            <h4 className={cn("mt-1.5 text-sm font-bold tracking-[-0.01em]", c.text)}>
              3 deliverables shared
            </h4>
          </div>
          <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]", c.positive)}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {links.map(({ label, note }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                c.chip,
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  c.primaryBg,
                )}
              >
                <ExternalLink aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate font-mono text-[11px] font-medium", c.chipText)}>
                  {label}
                </p>
                <p className={cn("truncate text-[10px]", c.textMuted)}>{note}</p>
              </div>
              <ArrowUpRight
                aria-hidden
                className={cn("h-3.5 w-3.5 shrink-0", c.textFaint)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "changes") {
    return (
      <div className={cn(shell, "flex flex-col p-6 sm:p-7")}>
        <div className={cn("flex items-start justify-between border-b pb-4", c.divider)}>
          <div>
            <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Change request · CR-04
            </p>
            <h4 className={cn("mt-2 text-base font-bold tracking-[-0.01em]", c.text)}>
              Add multi-currency support
            </h4>
          </div>
          <StatusPill tone={tone} variant="warning">Pending</StatusPill>
        </div>

        <p className={cn("mt-3 text-xs leading-relaxed", c.textMuted)}>
          Client wants USD + EUR pricing alongside AUD. Stripe Tax handles the
          conversion at checkout.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className={cn("rounded-lg border px-3 py-2.5", c.chip)}>
            <p className={cn("text-[9px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Estimate
            </p>
            <p className={cn("mt-1 font-bold tabular-nums", c.text)}>+A$1,200</p>
          </div>
          <div className={cn("rounded-lg border px-3 py-2.5", c.chip)}>
            <p className={cn("text-[9px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
              Timeline
            </p>
            <p className={cn("mt-1 font-bold tabular-nums", c.text)}>+3 days</p>
          </div>
        </div>

        <div className={cn("mt-auto flex items-center justify-end gap-2 border-t pt-4", c.divider)}>
          <button
            type="button"
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors",
              c.ghostBtn,
            )}
          >
            Decline
          </button>
          <button
            type="button"
            className={cn("rounded-md px-3 py-1.5 text-[11px] font-semibold", c.primarySolid)}
          >
            Quote A$1,200
          </button>
        </div>
      </div>
    );
  }

  // dashboard
  const stats = [
    { label: "Active", value: "12", trend: "+3", accent: true },
    { label: "Pending", value: "3", trend: "—" },
    { label: "MTD", value: "A$8.4k", trend: "+18%" },
  ];
  const activity = [
    { who: "Tom Barrett", action: "approved", what: "Website Redesign · v2" },
    { who: "INV-2026-018", action: "paid", what: "A$5,040 · Stripe" },
    { who: "Loop Studio", action: "viewed", what: "Mobile app proposal" },
  ];
  return (
    <div className={cn(shell, "p-6 sm:p-7")}>
      <div className={cn("flex items-center justify-between border-b pb-4", c.divider)}>
        <div>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.22em]", c.textFaint)}>
            Dashboard
          </p>
          <h4 className={cn("mt-1.5 text-sm font-bold tracking-[-0.01em]", c.text)}>
            This month
          </h4>
        </div>
        <TrendingUp
          aria-hidden
          className={cn("h-4 w-4", c.primary)}
          strokeWidth={2}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className={cn(
              "rounded-lg border px-2.5 py-2.5",
              s.accent
                ? isDark
                  ? "border-primary/40 bg-primary/[0.05]"
                  : "border-primary/30 bg-primary/[0.04]"
                : c.chip,
            )}
          >
            <p className={cn("text-[9px] font-semibold uppercase tracking-[0.2em]", c.textFaint)}>
              {s.label}
            </p>
            <p className={cn("mt-1.5 text-lg font-bold tabular-nums tracking-tight", c.text)}>
              {s.value}
            </p>
            <p className={cn("text-[9px] font-semibold tabular-nums", s.accent ? c.primary : c.textMuted)}>
              {s.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1.5 text-[11px]">
        {activity.map((a, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
            <span className={cn("truncate", c.textSoft)}>
              <span className={cn("font-semibold", c.text)}>{a.who}</span>{" "}
              <span className={c.textMuted}>{a.action}</span>{" "}
              <span>{a.what}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helpers -----------------------------------------------------------------

function StatusPill({
  tone,
  variant,
  children,
}: {
  tone: "light" | "dark";
  variant: "primary" | "positive" | "warning" | "neutral";
  children: React.ReactNode;
}) {
  const isDark = tone === "dark";
  const styles = {
    primary: isDark
      ? "bg-primary/15 text-primary"
      : "bg-primary/10 text-primary",
    positive: isDark
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-emerald-50 text-emerald-700",
    warning: isDark
      ? "bg-amber-500/15 text-amber-400"
      : "bg-amber-50 text-amber-700",
    neutral: isDark
      ? "bg-white/[0.06] text-white/60"
      : "bg-gray-100 text-neutral-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        styles[variant],
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === "primary" && "bg-primary",
          variant === "positive" && "bg-emerald-400",
          variant === "warning" && "bg-amber-400",
          variant === "neutral" && (isDark ? "bg-white/40" : "bg-neutral-400"),
        )}
      />
      {children}
    </span>
  );
}

function LineRow({
  tone,
  label,
  value,
}: {
  tone: "light" | "dark";
  label: string;
  value: string;
}) {
  const isDark = tone === "dark";
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className={isDark ? "text-white/80" : "text-neutral-700"}>{label}</span>
      <span className={cn("shrink-0 font-semibold tabular-nums", isDark ? "text-white" : "text-black")}>
        {value}
      </span>
    </div>
  );
}

function SummaryRow({
  tone,
  label,
  value,
}: {
  tone: "light" | "dark";
  label: string;
  value: string;
}) {
  const isDark = tone === "dark";
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <span className={isDark ? "text-white/55" : "text-neutral-500"}>{label}</span>
      <span className={cn("shrink-0 tabular-nums", isDark ? "text-white/85" : "text-neutral-700")}>
        {value}
      </span>
    </div>
  );
}

function DocPage({
  tone,
  active = false,
  rotate = "",
  translateX = "",
}: {
  tone: "light" | "dark";
  active?: boolean;
  rotate?: string;
  translateX?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={cn(
        "h-44 w-32 rounded-lg border p-3 shadow-md",
        active ? "z-10" : "absolute inset-0 opacity-70",
        rotate,
        translateX,
        isDark
          ? "border-white/15 bg-[#1a1a1d]"
          : "border-gray-100 bg-white",
      )}
    >
      <div className="space-y-1.5">
        <div
          className={cn(
            "h-2 w-16 rounded-full",
            isDark ? "bg-white/30" : "bg-neutral-300",
          )}
        />
        <div
          className={cn(
            "h-1 w-10 rounded-full",
            isDark ? "bg-white/15" : "bg-neutral-200",
          )}
        />
      </div>
      <div className="mt-3 space-y-1">
        {[100, 90, 85, 70, 88, 60, 84, 92].map((w, i) => (
          <div
            key={i}
            className={cn(
              "h-[3px] rounded-full",
              isDark ? "bg-white/12" : "bg-neutral-200",
            )}
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className={cn("mt-3 flex items-baseline justify-between border-t pt-2", isDark ? "border-white/10" : "border-gray-100")}>
        <span className={cn("text-[7px] font-semibold uppercase tracking-[0.2em]", isDark ? "text-white/40" : "text-neutral-500")}>
          Total
        </span>
        <span className={cn("text-[10px] font-bold tabular-nums tracking-tight", isDark ? "text-white" : "text-black")}>
          A$16,720
        </span>
      </div>
    </div>
  );
}
