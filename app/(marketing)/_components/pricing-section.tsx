"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { EASE_OUT } from "../_lib/shared";
import { plans, trialFeatures } from "../_lib/data";

type BillingPeriod = "monthly" | "annual";

export function PricingSection({
  showHeader = true,
}: {
  showHeader?: boolean;
}) {
  const prefersReduced = useReducedMotion();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const reveal = (delay = 0) => ({
    initial: prefersReduced ? false : { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: prefersReduced
      ? { duration: 0 }
      : { duration: 0.5, ease: EASE_OUT, delay },
  });

  return (
    <section
      id="pricing"
      className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        {showHeader ? (
          <div>
            <motion.p
              {...reveal(0)}
              className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
            >
              Pricing
            </motion.p>
            <motion.h2
              {...reveal(0.05)}
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
              className="mb-12 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
            >
              Simple, transparent{" "}
              <span className="text-[#4F7EF7]">pricing.</span>
            </motion.h2>
          </div>
        ) : null}

        <motion.div
          {...reveal(0.08)}
          className={showHeader ? "mb-12 flex justify-center" : "mb-12 flex justify-center"}
        >
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex items-center gap-1 rounded-lg border border-[#2A2A2A] bg-[#111] p-1"
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
                className={`ml-2 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
                  billing === "annual"
                    ? "bg-green-950 text-green-400"
                    : "bg-[#1A1A1A] text-[#A0A0A0]"
                }`}
              >
                Save 20%
              </span>
            </BillingToggleButton>
          </div>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, planIdx) => {
            const included = plan.features.filter((f) => !f.comingSoon);
            const roadmap = plan.features.filter((f) => f.comingSoon);
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
                {...reveal(0.1 + planIdx * 0.04)}
                className="relative h-full"
              >
                <div
                  className={`relative flex h-full flex-col rounded-xl p-7 transition-all ${
                    plan.highlighted
                      ? "border-2 border-[#4F7EF7] bg-[#111]"
                      : "border border-[#2A2A2A] bg-[#111] hover:border-[#444] hover:bg-[#151515]"
                  }`}
                >
                  {plan.highlighted ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#4F7EF7] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  ) : null}

                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-[#A0A0A0]">{plan.description}</p>

                  <div className="mt-6 flex flex-wrap items-baseline gap-x-1.5">
                    {plan.priceFrom ? (
                      <span className="text-sm font-medium text-[#555]">From</span>
                    ) : null}
                    <span className="font-mono text-5xl font-black leading-none tabular-nums text-white">
                      AU${priceDisplay}
                    </span>
                    <span className="font-mono text-sm text-[#555]">/mo</span>
                  </div>
                  <p className="mt-1 h-4 font-mono text-[11px] text-[#555]">
                    {billing === "annual" ? "billed annually" : ""}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#A0A0A0]">
                    {plan.seats}
                  </p>
                  {plan.tagline ? (
                    <span className="mt-3 inline-flex w-fit font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#555]">
                      {plan.tagline}
                    </span>
                  ) : null}

                  <ul className="mt-7 space-y-2.5">
                    {included.map((feature) => (
                      <li
                        key={feature.label}
                        className="flex items-start gap-2.5 text-sm text-white"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#22C55E]"
                          strokeWidth={2.5}
                        />
                        <span className="leading-snug">{feature.label}</span>
                      </li>
                    ))}
                  </ul>

                  {roadmap.length > 0 ? (
                    <div className="mt-6 border-t border-[#2A2A2A] pt-5">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#555]">
                        On the roadmap
                      </p>
                      <ul className="mt-3 space-y-2">
                        {roadmap.map((feature) => (
                          <li
                            key={feature.label}
                            className="flex items-start gap-2.5 text-xs text-[#A0A0A0]"
                          >
                            <span
                              aria-hidden
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#F59E0B]"
                            />
                            <span className="leading-snug">
                              {feature.label}
                              <span className="ml-1.5 font-mono text-[9px] font-bold uppercase tracking-widest text-[#F59E0B]">
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
                      href="/waitlist"
                      highlighted={plan.highlighted}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          {...reveal(0.3)}
          className="relative mx-auto mt-16 max-w-3xl rounded-xl border border-dashed border-[#333] bg-[#111] p-7 sm:p-8"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#A0A0A0]">
            Try free first
          </span>
          <div className="grid gap-5 text-left sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Free trial
                </h3>
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#555]">
                  AU$0 · 14 days · no credit card
                </span>
              </div>
              <p className="mt-2 text-sm text-[#A0A0A0]">
                After 14 days your account pauses until you pick a plan. I
                never auto-charge.
              </p>
              <ul className="mt-5 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {trialFeatures.map((feature) => (
                  <li
                    key={feature.label}
                    className="flex items-start gap-2 text-sm text-white"
                  >
                    <Check
                      aria-hidden
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#22C55E]"
                      strokeWidth={2.5}
                    />
                    <span className="leading-snug">
                      {feature.label}
                      {feature.note ? (
                        <span className="mt-1 block text-xs text-[#A0A0A0]">
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
                className="inline-flex w-full items-center justify-center rounded-xl border border-[#2A2A2A] px-6 py-3 text-sm font-bold text-[#A0A0A0] transition-all hover:border-[#444] hover:text-white sm:w-auto"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.p
          {...reveal(0.36)}
          className="mt-12 text-center text-sm text-[#A0A0A0]"
        >
          More features rolling out through 2026. Got something you need?{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com?subject=Velo%20feature%20request"
            className="font-medium text-[#4F7EF7] hover:text-white"
          >
            Tell me.
          </a>
        </motion.p>
      </div>
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
  const className = highlighted
    ? "inline-flex w-full items-center justify-center rounded-lg bg-[#4F7EF7] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#3B6AE8]"
    : "inline-flex w-full items-center justify-center rounded-lg border border-[#2A2A2A] px-6 py-3 text-sm font-bold text-[#A0A0A0] transition-all hover:border-[#444] hover:text-white";
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
      className={`inline-flex items-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[#1A1A1A] text-white"
          : "text-[#A0A0A0] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
