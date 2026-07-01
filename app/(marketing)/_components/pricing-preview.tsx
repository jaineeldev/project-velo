"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReveal } from "./reveal";
import { focusRing } from "../_lib/shared";

type Plan = {
  name: string;
  price: number;
  description: string;
  seats: string;
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: 9,
    description:
      "For solo freelancers getting started. Unlimited projects, proposals, and invoices.",
    seats: "1 user",
  },
  {
    name: "Studio",
    price: 24,
    description:
      "For active freelancers with multiple clients. Priority support included.",
    seats: "Up to 5 users",
    highlighted: true,
  },
  {
    name: "Agency",
    price: 49,
    description:
      "For small teams managing client work. Team workload views included.",
    seats: "Up to 15 users",
  },
];

export function PricingPreview() {
  const reveal = useReveal();

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.p
          {...reveal(0)}
          className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]"
        >
          Plans
        </motion.p>
        <motion.h2
          {...reveal(0.05)}
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-16 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          Priced for one person.
          <br />
          Built to <span className="text-[#4F7EF7]">scale.</span>
        </motion.h2>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.article
              key={plan.name}
              {...reveal(0.1 + i * 0.05)}
              className={`relative flex flex-col rounded-xl p-8 transition-all duration-300 motion-safe:hover:-translate-y-1 ${
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

              <h3 className="mb-1 text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-4 font-mono text-xs text-[#555]">{plan.seats}</p>

              <p className="my-4 flex items-baseline gap-1">
                <span className="font-mono text-5xl font-black text-white">
                  A${plan.price}
                </span>
                <span className="font-mono text-sm text-[#555]">/ month</span>
              </p>

              <p className="mb-8 text-sm leading-relaxed text-[#A0A0A0]">
                {plan.description}
              </p>

              <Link
                href="/waitlist"
                className={`mt-auto inline-flex w-full items-center justify-center rounded-lg py-3 text-sm font-bold transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing} ${
                  plan.highlighted
                    ? "bg-[#4F7EF7] text-white hover:bg-[#3B6AE8]"
                    : "border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#444] hover:text-white"
                }`}
              >
                Join the waitlist
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.p
          {...reveal(0.28)}
          className="mt-6 text-center font-mono text-xs text-[#555]"
        >
          Scale plan also available for growing agencies. See full pricing →
        </motion.p>
        <motion.div {...reveal(0.32)}>
          <Link
            href="/pricing"
            className={`group mt-4 inline-flex w-full items-center justify-center gap-1 rounded-sm text-center font-mono text-sm text-[#555] transition-colors duration-200 hover:text-[#A0A0A0] ${focusRing}`}
          >
            See full pricing and features
            <span
              aria-hidden
              className="inline-block transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
