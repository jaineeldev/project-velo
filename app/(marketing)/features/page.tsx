import { Fragment } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cn, focusRing } from "@/lib/utils";
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

const featureRoadmap: { label: string; date?: string }[] = [
  { label: "Stripe payments" },
  { label: "Multi-user workspaces and team roles" },
  { label: "Mobile app (PWA)", date: "Q4 2026" },
  { label: "Client e-signatures on proposals" },
  { label: "Automated payment reminders" },
  { label: "GitHub and Linear integrations" },
  { label: "White-label client portal" },
  { label: "API and webhooks", date: "2027" },
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
      <section
        data-bg="light"
        className="relative border-t border-gray-100 bg-[#fafafa] text-black"
      >
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
                  footer={
                    feature.mockup === "portal" ? (
                      <Link
                        href="/clients"
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline",
                          focusRing,
                        )}
                      >
                        See the client experience →
                      </Link>
                    ) : undefined
                  }
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
        <p className="mx-auto mt-10 max-w-2xl text-balance text-center text-xl font-medium text-white/70">
          One approval. Project, milestones, and deposit invoice created
          automatically.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Proposals, approvals, project tracking, client updates, deliverables,
          and invoices. One connected flow instead of five separate tools.
        </p>
      </div>
    </section>
  );
}

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
            The shortlist of what is on the build queue, in rough order of
            priority.
          </p>
        </div>
        <ol className="mx-auto mt-16 max-w-2xl">
          {featureRoadmap.map(({ label, date }, i) => {
            const isLast = i === featureRoadmap.length - 1;
            return (
              <li
                key={label}
                className="relative flex items-start gap-5 pb-8 last:pb-0"
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-white/[0.12] to-white/[0.04]"
                  />
                )}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-[#0d0d0f] font-mono text-[11px] font-semibold tabular-nums text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-1 flex-wrap items-baseline gap-x-3 pt-[5px] text-base font-medium text-white sm:text-lg">
                  <span>{label}</span>
                  {date ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">
                      {date}
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mx-auto mt-12 max-w-2xl text-sm text-white/60">
          Order can shift as I learn what people need most. Follow along at{" "}
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
