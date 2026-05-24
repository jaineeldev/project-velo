import { Fragment } from "react";
import type { Metadata } from "next";
import { allFeatures } from "../_lib/data";
import { StructuredData } from "../_components/structured-data";
import { FeatureRow } from "../_components/feature-row";
import { FinalCTA } from "../_components/final-cta";

// Theme bucket labels keyed by the mockup of the feature they introduce.
// Keeps the 8-row list from reading as a flat scroll.
const bucketLabels: Record<string, string> = {
  proposals: "Send work",
  tracking: "Track work",
  invoicing: "Get paid",
};

const featureRoadmap = [
  { label: "Stripe payments", quarter: "Q3 2026" },
  { label: "Multi-user workspaces and team roles", quarter: "Q3 2026" },
  { label: "Mobile app (PWA)", quarter: "Q4 2026" },
  { label: "Client e-signatures on proposals", quarter: "Q4 2026" },
  { label: "Automated payment reminders", quarter: "Q4 2026" },
  { label: "GitHub and Linear integrations", quarter: "2027" },
  { label: "White-label client portal", quarter: "2027" },
];

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every part of the freelance flow, in one product: proposals, client portal, project tracking, invoicing, PDF export, deliverables, change requests, and a dashboard for everything.",
};

export default function FeaturesPage() {
  return (
    <>
      <StructuredData />
      <FeaturesHero />
      <section className="relative border-t border-gray-100 bg-[#fafafa] text-black">
        <div>
          {allFeatures.map((feature, i) => {
            const bucketLabel = bucketLabels[feature.mockup];
            return (
              <Fragment key={feature.title}>
                {bucketLabel ? (
                  <div className="mx-auto max-w-7xl px-6 pt-16 sm:px-10 sm:pt-20">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
                        {bucketLabel}
                      </span>
                      <span aria-hidden className="h-px flex-1 bg-gray-200" />
                    </div>
                  </div>
                ) : null}
                <FeatureRow
                  mockup={feature.mockup}
                  flipped={i % 2 === 1}
                  index={i + 1}
                  tone="light"
                />
              </Fragment>
            );
          })}
        </div>
      </section>
      <FeatureRoadmap />
      <FinalCTA
        eyebrow="Ready when you are"
        heading={
          <>
            See it in your own{" "}
            <span className="text-primary">browser.</span>
          </>
        }
        body="14-day free trial. No credit card required."
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}

function FeaturesHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 text-center sm:px-10 sm:pb-44 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Features
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          Everything you need to run{" "}
          <span className="text-primary">client work.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo replaces the proposal doc, the project board, the invoice
          generator, and the client-update email. Eight pieces, scoped tight,
          designed to feel like one product instead of a stitched-together
          toolkit. Designed specifically for the way Australian freelancers
          and dev agencies work: GST, AUD invoicing, and local compliance
          built in.
        </p>
      </div>
    </section>
  );
}

// Roadmap section sits between the feature rows and FinalCTA, on a dark
// surface so it visually bookends with the hero and CTA. Styled as a
// changelog-style list of rows rather than cards: clean, scannable, signals
// "release schedule" instead of "more features for sale".
function FeatureRoadmap() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            On the roadmap
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            What&apos;s coming{" "}
            <span className="text-primary">next.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            The shortlist of what is on the build queue, with target quarters.
            Honest dates, not vapor.
          </p>
        </div>
        <ul className="mt-12 border-t border-white/[0.06]">
          {featureRoadmap.map(({ label, quarter }) => (
            <li
              key={label}
              className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-5"
            >
              <span className="font-medium text-white">{label}</span>
              <span className="shrink-0 font-mono text-sm text-white/40 tabular-nums">
                {quarter}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-white/30">
          Dates are targets, not promises. Follow along at{" "}
          <a
            href="https://github.com/jaineeldev/project-velo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono underline-offset-2 hover:text-white/60 hover:underline"
          >
            github.com/jaineeldev/project-velo
          </a>
          .
        </p>
      </div>
    </section>
  );
}
