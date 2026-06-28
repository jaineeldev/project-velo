"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";

// Full-bleed "This is what done looks like." — the centrepiece moment.
// A complete Northstar paid invoice rendered as a near-full-width document
// on dark canvas. Every detail visible. The PAID stamp lands last.

const MILESTONES = [
  { n: "01", label: "Discovery & strategy", date: "16 Jun", amount: "A$1,200" },
  { n: "02", label: "Design", date: "30 Jun", amount: "A$2,400" },
  { n: "03", label: "Development", date: "21 Jul", amount: "A$3,600" },
  { n: "04", label: "Launch", date: "28 Jul", amount: "A$1,200" },
];

export function ThisIsDone() {
  const prefersReduced = useReducedMotion();

  const headingEnter = prefersReduced
    ? { initial: false as const, whileInView: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.7, ease: EASE_OUT },
      };

  const docEnter = prefersReduced
    ? { initial: false as const, whileInView: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.8, ease: EASE_OUT, delay: 0.15 },
      };

  const stampEnter = prefersReduced
    ? { initial: false as const, whileInView: { opacity: 1, scale: 1, rotate: -12 } }
    : {
        initial: { opacity: 0, scale: 1.6, rotate: 6 },
        whileInView: { opacity: 1, scale: 1, rotate: -12 },
        transition: { duration: 0.55, ease: EASE_OUT, delay: 0.95 },
      };

  return (
    <section className="relative overflow-hidden bg-deep py-24 sm:py-32">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F5F3EF 1px, transparent 1px), linear-gradient(to bottom, #F5F3EF 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-10">
        <motion.div
          {...headingEnter}
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-3xl"
        >
          <p className="font-mono text-xs uppercase tracking-widest text-canvas/45">
            Project · Northstar · Closed
          </p>
          <h2 className="mt-5 font-display text-6xl font-black leading-[0.9] tracking-[-0.05em] text-canvas md:text-7xl lg:text-8xl">
            This is what{" "}
            <span className="text-primary">done</span>
            <br />
            looks like.
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-canvas/65">
            One record. Approved, deposited, built, invoiced, paid. No second
            spreadsheet. No re-typed totals. No chase email.
          </p>
        </motion.div>

        <motion.div
          {...docEnter}
          viewport={{ once: true, amount: 0.25 }}
          className="relative mt-16 overflow-hidden rounded-2xl border border-line bg-canvas text-ink shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:mt-20"
        >
          <div className="relative">
            <div className="absolute right-10 top-10 hidden sm:block lg:right-16 lg:top-14">
              <motion.div
                {...stampEnter}
                viewport={{ once: true, amount: 0.25 }}
                className="origin-center"
              >
                <PaidStamp />
              </motion.div>
            </div>

            <div className="grid gap-8 border-b border-line p-8 sm:grid-cols-[1.4fr_1fr] sm:p-12 lg:gap-12 lg:p-16">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
                  Invoice · Final
                </p>
                <p className="mt-4 font-display text-3xl font-black tracking-[-0.03em] text-ink sm:text-4xl">
                  Northstar Website Redesign
                </p>
                <p className="mt-3 font-mono text-sm text-ink-2">
                  INV-NS-002 · Issued 28 Jul 2026
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-1 sm:gap-y-5">
                <Field k="Billed to" v="Tom Barrett" sub="Ironbark Digital" />
                <Field
                  k="Email"
                  v="tom@ironbarkdigital.com.au"
                  mono
                />
              </div>
            </div>

            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16 lg:p-16">
              <div>
                <div className="flex items-baseline justify-between border-b border-line pb-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
                    Milestones
                  </p>
                  <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
                    Delivered
                  </p>
                </div>
                <ul className="divide-y divide-line">
                  {MILESTONES.map((m, i) => (
                    <MilestoneRow
                      key={m.n}
                      m={m}
                      i={i}
                      prefersReduced={!!prefersReduced}
                    />
                  ))}
                </ul>

                <div className="mt-8 space-y-3 border-t border-line pt-6">
                  <Line k="Subtotal" v="A$8,400.00" />
                  <Line k="Deposit paid · 16 Jun" v="−A$2,520.00" muted />
                  <Line k="Balance" v="A$5,880.00" muted />
                </div>
              </div>

              <div className="flex flex-col justify-between gap-10">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
                    Total billed
                  </p>
                  <p className="mt-3 font-display font-black tracking-[-0.045em] text-ink text-6xl leading-none lg:text-7xl">
                    A$8,400
                  </p>
                  <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-3">
                    AUD · GST inclusive
                  </p>
                </div>

                <div className="rounded-xl border border-line bg-raised p-5">
                  <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
                    Payment trail
                  </p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <PayRow
                      label="Deposit · 30%"
                      date="16 Jun 2026"
                      amount="A$2,520"
                    />
                    <PayRow
                      label="Balance · 70%"
                      date="28 Jul 2026"
                      amount="A$5,880"
                    />
                  </ul>
                  <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                    <span className="font-mono text-xs uppercase tracking-widest text-ink-3">
                      Collected
                    </span>
                    <span className="font-mono text-base font-semibold tabular-nums text-ink">
                      A$8,400
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-raised px-8 py-5 font-mono text-xs uppercase tracking-widest text-ink-3 sm:px-12 lg:px-16">
              <span>Closed in Velo · 28 Jul 2026</span>
              <span>
                Ironbark Digital · ABN 00 000 000 000
              </span>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            prefersReduced
              ? undefined
              : { duration: 0.55, ease: EASE_OUT, delay: 0.4 }
          }
          className="mx-auto mt-12 max-w-2xl text-center font-mono text-xs uppercase tracking-widest text-canvas/45"
        >
          The same record you started in. Nothing copy-pasted.
        </motion.p>
      </div>
    </section>
  );
}

function Field({
  k,
  v,
  sub,
  mono,
}: {
  k: string;
  v: string;
  sub?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-3">
        {k}
      </p>
      <p
        className={`mt-2 text-base font-semibold tracking-tight text-ink ${
          mono ? "font-mono break-all text-sm" : ""
        }`}
      >
        {v}
      </p>
      {sub ? (
        <p className="mt-0.5 text-sm text-ink-2">{sub}</p>
      ) : null}
    </div>
  );
}

function MilestoneRow({
  m,
  i,
  prefersReduced,
}: {
  m: (typeof MILESTONES)[number];
  i: number;
  prefersReduced: boolean;
}) {
  return (
    <motion.li
      initial={prefersReduced ? false : { opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={
        prefersReduced
          ? undefined
          : { duration: 0.4, ease: EASE_OUT, delay: 0.3 + i * 0.08 }
      }
      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-5 py-4"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ok/40 bg-ok/[0.12]">
        <Check className="h-3.5 w-3.5 text-ok" strokeWidth={2.5} />
      </span>
      <div>
        <p className="text-base font-semibold tracking-tight text-ink">
          {m.label}
        </p>
        <p className="mt-0.5 font-mono text-xs uppercase tracking-widest text-ink-3">
          Milestone {m.n}
        </p>
      </div>
      <span className="hidden font-mono text-sm text-ink-2 sm:inline">
        {m.date}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums text-ink">
        {m.amount}
      </span>
    </motion.li>
  );
}

function Line({
  k,
  v,
  muted,
}: {
  k: string;
  v: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className={muted ? "text-ink-3" : "text-ink-2"}>{k}</span>
      <span
        className={`font-mono tabular-nums ${
          muted ? "text-ink-3" : "font-semibold text-ink"
        }`}
      >
        {v}
      </span>
    </div>
  );
}

function PayRow({
  label,
  date,
  amount,
}: {
  label: string;
  date: string;
  amount: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3">
          {date}
        </p>
      </div>
      <span className="font-mono text-sm font-semibold tabular-nums text-ink">
        {amount}
      </span>
    </li>
  );
}

function PaidStamp() {
  return (
    <div
      className="relative inline-flex h-32 w-32 items-center justify-center rounded-full border-[3px] border-ok text-ok lg:h-40 lg:w-40"
      style={{
        boxShadow: "inset 0 0 0 2px rgba(22,163,74,0.25)",
      }}
    >
      <div className="absolute inset-2 rounded-full border border-ok/40" />
      <div className="text-center">
        <p className="font-display text-4xl font-black tracking-[-0.04em] lg:text-5xl">
          PAID
        </p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ok/80">
          28 Jul 2026
        </p>
      </div>
    </div>
  );
}
