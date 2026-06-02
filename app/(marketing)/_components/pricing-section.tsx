"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { staggerVariants } from "../_lib/animation";
import { plans, trialFeatures } from "../_lib/data";

type BillingPeriod = "monthly" | "annual";

// Full pricing layout. Dark surface, sans-extrabold prices, no italic.
// Highlighted plan gets a single blue ring; otherwise plans render flat on a
// white/5 surface so the price reads as the hero.
export function PricingSection({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.1);
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  return (
    <section id="pricing" className="relative bg-[#0d0d0f]">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="relative mx-auto max-w-7xl px-6 py-32 sm:px-10 sm:py-40"
      >
        {showHeader ? (
          <div className="text-center">
            <motion.p
              variants={item}
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40"
            >
              Pricing
            </motion.p>
            <motion.h2
              variants={item}
              className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl"
            >
              Simple, transparent{" "}
              <span className="text-primary">pricing.</span>
            </motion.h2>
          </div>
        ) : null}

        <motion.div
          variants={item}
          className={cn(
            "flex justify-center",
            showHeader ? "mt-12" : "",
          )}
        >
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1"
          >
            <BillingToggleButton
              active={billing === "monthly"}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </BillingToggleButton>
            <BillingToggleButton
              active={billing === "annual"}
              onClick={() => setBilling("annual")}
            >
              Annual
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  billing === "annual"
                    ? "bg-primary/15 text-primary"
                    : "bg-white/15 text-white/80",
                )}
              >
                Save 20%
              </span>
            </BillingToggleButton>
          </div>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const included = plan.features.filter((f) => !f.comingSoon);
            const roadmap = plan.features.filter((f) => f.comingSoon);
            // Effective monthly when billed annually: monthlyPrice × 10 (the
            // existing yearly multiplier) ÷ 12, formatted as the cleanest
            // possible string (e.g. "20" not "20.00", "7.50" kept).
            const annualEffective = (() => {
              const v = (plan.monthlyPrice * 10) / 12;
              const rounded = Math.round(v * 100) / 100;
              return rounded % 1 === 0
                ? rounded.toString()
                : rounded.toFixed(2);
            })();
            const priceDisplay =
              billing === "annual"
                ? annualEffective
                : plan.monthlyPrice.toString();

            return (
              <motion.div
                key={plan.name}
                variants={item}
                className="relative h-full"
              >
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#141416] p-8",
                    plan.highlighted && "ring-2 ring-blue-500",
                  )}
                >
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">
                      {plan.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-0">
                      {plan.priceFrom ? (
                        <span className="text-sm font-semibold text-white/60">
                          From
                        </span>
                      ) : null}
                      <span className="text-4xl font-extrabold leading-none tracking-[-0.04em] text-white tabular-nums xl:text-5xl">
                        AU${priceDisplay}
                      </span>
                      <span className="text-sm text-white/60">/mo</span>
                    </div>
                    <p className="mt-1 h-4 text-[11px] font-medium text-white/45">
                      {billing === "annual" ? "billed annually" : ""}
                    </p>
                    <p className="mt-2 text-sm text-white/60">{plan.seats}</p>
                    {plan.tagline ? (
                      <span className="mt-3 inline-flex w-fit text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        {plan.tagline}
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-8 space-y-3">
                    {included.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-start gap-2.5 text-sm text-white/70"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          strokeWidth={2.5}
                        />
                        <span className="leading-snug">{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {roadmap.length > 0 ? (
                    <div className="mt-6 border-t border-white/[0.06] pt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                        On the roadmap
                      </p>
                      <ul className="mt-3 space-y-2">
                        {roadmap.map((feature) => (
                          <li
                            key={feature.label}
                            className="flex items-start gap-2.5 text-xs text-white/35"
                          >
                            <span
                              aria-hidden
                              className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25"
                            />
                            <span className="leading-snug">
                              {feature.label}
                              <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
                                soon
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex-1" />

                  <div className="mt-8">
                    <PlanCta
                      label={plan.cta.label}
                      href={plan.cta.href}
                      highlighted={plan.highlighted}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Exit-valve trial card. Same surface as the plan cards above so
            it reads as a "not ready to commit?" off-ramp rather than a
            featured tier. */}
        <motion.div
          variants={item}
          className="relative mx-auto mt-10 max-w-3xl rounded-2xl border border-white/[0.08] bg-[#141416] p-6 sm:p-7"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Try free first
          </span>
          <div className="grid gap-5 text-left sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-bold tracking-[-0.02em] text-white">
                  Free trial
                </h3>
                <span className="text-sm text-white/60">
                  AU$0 · 14 days · no credit card
                </span>
              </div>
              <p className="mt-2 text-sm text-white/60">
                After 14 days your account pauses until you pick a plan. I
                never auto-charge.
              </p>
              <ul className="mt-5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {trialFeatures.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-2 text-sm text-white/75"
                  >
                    <Check
                      aria-hidden
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                      strokeWidth={2.5}
                    />
                    <span className="leading-snug">
                      {feature.label}
                      {feature.note ? (
                        <span className="mt-1 block text-xs text-white/40">
                          {feature.note}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:shrink-0">
              <Link
                href="/waitlist"
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center rounded-full border border-white/20 bg-transparent px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06] sm:w-auto",
                  focusRing,
                )}
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.p
          variants={item}
          className="mt-14 text-center text-sm text-white/60"
        >
          More features rolling out through 2026. Got something you need?{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com?subject=Velo%20feature%20request"
            className={cn(
              "rounded-sm font-semibold text-primary underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Tell me.
          </a>
        </motion.p>
      </motion.div>
    </section>
  );
}

function PlanCta({
  label,
  href,
  highlighted,
}: {
  label: string;
  href: string;
  highlighted?: boolean;
}) {
  const className = cn(
    "inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition-colors",
    highlighted
      ? "bg-primary text-white hover:bg-primary/90"
      : "border border-white/20 bg-transparent text-white hover:bg-white/[0.06]",
    focusRing,
  );
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  return isExternal ? (
    <a href={href} className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function BillingToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-white text-[#0a0a0a]"
          : "text-white/60 hover:text-white",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}
