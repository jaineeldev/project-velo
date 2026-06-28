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
      <FaqSection id="faq" defaultOpenCount={3} />
      <FinalCTA
        heading={
          <>
            Still deciding? Start the{" "}
            <span className="text-[#4F7EF7]">trial.</span>
          </>
        }
        body="14 days, every feature, no credit card. Cancel by closing the tab."
        subtle="If a plan doesn't fit, email me. It's just me building this, and I read every message."
        secondaryCta={{ label: "Email me", href: "mailto:jaineelk.dev@gmail.com" }}
      />
    </>
  );
}

function PricingHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-12 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          Pricing
        </p>
        <h1
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.045em] text-white"
        >
          Simple, transparent{" "}
          <span className="text-[#4F7EF7]">pricing.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-[#A0A0A0]">
          14-day free trial · 2 projects · No credit card required. Pick a
          plan when you&apos;re ready. I never auto-charge.
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          All prices in AUD · GST included where applicable
        </p>
      </div>
    </section>
  );
}
