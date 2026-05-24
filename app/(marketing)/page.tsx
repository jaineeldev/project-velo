import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { homeHighlights, plans } from "./_lib/data";
import { StructuredData } from "./_components/structured-data";
import { Hero } from "./_components/hero";
import { TrustStrip } from "./_components/trust-strip";
import { HowItWorks } from "./_components/how-it-works";
import { FeatureRow } from "./_components/feature-row";
import { FaqSection } from "./_components/faq-section";
import { FinalCTA } from "./_components/final-cta";

export const metadata: Metadata = {
  title: "Velo · Ship code, not spreadsheets",
  description:
    "Send proposals, get approvals, track projects, and invoice clients, all in one place. Built for freelance developers and dev agencies.",
};

export default function HomePage() {
  return (
    <>
      <StructuredData kind="home" />
      <Hero />
      <TrustStrip />
      <HowItWorks />

      {/* 3 featured highlights — full list lives on /features */}
      <section className="relative bg-white text-black">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-32 text-center sm:px-10 sm:pb-16 sm:pt-44">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            A taste of what&apos;s inside
          </p>
          <h2 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-black sm:text-6xl md:text-7xl">
            Every part of the freelance flow,{" "}
            <span className="text-primary">designed like one product.</span>
          </h2>
        </div>
        <div>
          {homeHighlights.map((feature, i) => (
            <FeatureRow
              key={feature.title}
              mockup={feature.mockup}
              flipped={i % 2 === 1}
              index={i + 1}
              tone="light"
            />
          ))}
        </div>
        <div>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-16 sm:px-10">
            <p className="max-w-md text-base text-[#666666] sm:text-lg">
              Plus project tracking, change requests, PDF export, deliverables,
              and a single dashboard for everything.
            </p>
            <Link
              href="/features"
              className={cn(
                "group inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-gray-50",
                focusRing,
              )}
            >
              See all features
              <ArrowRight
                aria-hidden
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </section>

      <SecurityTrustStrip />

      <PricingTeaser />

      <FaqSection
        items={HOMEPAGE_FAQS}
        heading={
          <>
            Answered <span className="text-primary">upfront.</span>
          </>
        }
        tight
        footer={
          <p className="text-sm text-white/45">
            More on the{" "}
            <Link
              href="/pricing#faq"
              className={cn(
                "rounded-sm font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline",
                focusRing,
              )}
            >
              full FAQ
            </Link>{" "}
            on the pricing page.
          </p>
        }
      />

      <FinalCTA />
    </>
  );
}

// Three short trust statements that sit between the light features section
// and the pricing teaser. No cards, no icons; the restraint is the point.
function SecurityTrustStrip() {
  return (
    <section className="relative isolate overflow-hidden border-y border-white/[0.06] bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-5xl px-6 py-24 text-center sm:px-10 sm:py-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Security
        </p>
        <ul className="mx-auto mt-10 space-y-3 text-base leading-relaxed text-white/70 sm:space-y-4 sm:text-lg">
          <li>We never store card or bank details.</li>
          <li>
            All data encrypted in transit and at rest, hosted in Australia.
          </li>
          <li>
            Delete your account anytime — all data permanently removed within
            30 days.
          </li>
        </ul>
        <Link
          href="/security"
          className={cn(
            "mt-10 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline",
            focusRing,
          )}
        >
          Read our security policy →
        </Link>
      </div>
    </section>
  );
}

// Compact inline pricing teaser. Lists all four plans with monthly prices in
// a single row so visitors learn the cost without clicking through.
function PricingTeaser() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 py-32 sm:px-10 sm:py-40">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Pricing
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl">
            Four plans.{" "}
            <span className="text-primary">No surprises.</span>
          </h2>
        </div>

        <ul className="mx-auto mt-14 flex max-w-4xl flex-wrap items-stretch justify-center gap-x-3 gap-y-4">
          {plans.map((plan, i) => (
            <li
              key={plan.name}
              className="flex flex-1 basis-[140px] flex-col items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-5 text-center"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
                {plan.name}
              </span>
              <span className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-white tabular-nums sm:text-3xl">
                {plan.priceFrom ? (
                  <span className="mr-1 text-xs font-semibold text-white/55">
                    From
                  </span>
                ) : null}
                AU${plan.monthlyPrice}
              </span>
              <span className="text-[11px] text-white/45">
                /mo · {plan.seats.toLowerCase()}
              </span>
              {/* Subtle key separators between plans on wide layouts. */}
              {i < plans.length - 1 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute"
                />
              ) : null}
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-xl text-center text-base text-white/60 sm:text-lg">
          14-day free trial on every plan. No credit card. We never auto-charge.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/pricing"
            className={cn(
              "group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
              focusRing,
            )}
          >
            See full pricing
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              "rounded-sm text-sm text-white/60 underline-offset-2 hover:text-white hover:underline",
              focusRing,
            )}
          >
            Or start free trial →
          </Link>
        </div>
      </div>
    </section>
  );
}

// Four conversion-relevant FAQs, 2-column grid on desktop, no accordion.
// Tight subset of FAQs shown on the homepage. Pricing page renders the full
// list via the same FaqSection accordion.
const HOMEPAGE_FAQS = [
  {
    q: "What happens after the 14-day trial?",
    a: "Pick a plan to keep going. We don't auto-charge, and your data stays put if you want to come back later.",
  },
  {
    q: "Do my clients need an account?",
    a: "Yes, and it's always free. Clients sign in to a free Velo account to view and approve, so every approval is logged against a verified email. Client accounts never require a paid plan.",
  },
  {
    q: "Does Velo handle GST?",
    a: "Yes. Proposals and invoices calculate GST and deposit splits based on your AU business profile.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from settings whenever. You keep access until the end of the period you paid for, and a full account deletion removes everything inside 30 days.",
  },
];
