import type { Metadata } from "next";
import { StructuredData } from "../_components/structured-data";
import { PricingSection } from "../_components/pricing-section";
import { FaqSection } from "../_components/faq-section";
import { FinalCTA } from "../_components/final-cta";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing. 14-day free trial, no credit card required. Four plans from AU$9/mo. Built for freelance developers and dev agencies.",
};

export default function PricingPage() {
  return (
    <>
      <StructuredData kind="pricing" />
      <PricingHero />
      <PricingSection showHeader={false} />
      <FaqSection id="faq" />
      <FinalCTA
        heading={
          <>
            Still deciding? Start the{" "}
            <span className="text-primary">trial.</span>
          </>
        }
        body="14 days, every feature, no credit card. Cancel by closing the tab."
        subtle="If a plan doesn't fit, email me. It's just me building this, and I read every message."
        secondaryCta={{ label: "Email me", href: "mailto:hello@velo.app" }}
      />
    </>
  );
}

function PricingHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-24 text-center sm:px-10 sm:pb-28 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Pricing
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          Simple, transparent{" "}
          <span className="text-primary">pricing.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          14-day free trial · 2 projects · No credit card required. Pick a plan
          when you&apos;re ready. I never auto-charge.
        </p>
        <p className="mt-2 text-sm text-white/60">
          All prices in AUD. GST included where applicable.
        </p>
      </div>
    </section>
  );
}
