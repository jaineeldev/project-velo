"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReveal } from "./reveal";
import { focusRing } from "../_lib/shared";

export function HomeFinalCta() {
  const reveal = useReveal();

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-32 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          {...reveal(0)}
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          className="mb-6 font-display font-black leading-[0.88] tracking-[-0.04em] text-white"
        >
          Run the project.
          <br />
          Not the <span className="text-[#4F7EF7]">paperwork.</span>
        </motion.h2>
        <motion.p
          {...reveal(0.08)}
          className="mx-auto mb-10 max-w-xl text-xl leading-relaxed text-[#A0A0A0]"
        >
          Velo handles the proposals, approvals, milestones, and invoices. You
          handle the work.
        </motion.p>
        <motion.div {...reveal(0.15)}>
          <Link
            href="/waitlist"
            className={`inline-flex items-center justify-center rounded-xl bg-[#4F7EF7] px-10 py-4 text-lg font-bold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing}`}
          >
            Join the waitlist
          </Link>
        </motion.div>
        <motion.p
          {...reveal(0.22)}
          className="mt-6 font-mono text-xs text-[#555]"
        >
          Northstar Website Redesign · Paid · A$8,400
        </motion.p>
      </div>
    </section>
  );
}
