import type { Metadata } from "next";
import { Fragment } from "react";
import { allFeatures } from "../_lib/data";
import { StructuredData } from "../_components/structured-data";
import { FinalCTA } from "../_components/final-cta";
import { FeatureMockup } from "../_components/feature-mockups";

const bucketByMockup: Record<string, string> = {
  proposals: "Send work",
  tracking: "Track work",
  invoicing: "Get paid",
};

const featureRoadmap: { label: string; date?: string }[] = [
  { label: "Stripe payments", date: "Q3 2026" },
  { label: "Multi-user workspaces and team roles", date: "Q3 2026" },
  { label: "Mobile app (PWA)", date: "Q4 2026" },
  { label: "Client e-signatures on proposals", date: "Q4 2026" },
  { label: "Automated payment reminders", date: "Q1 2027" },
  { label: "GitHub and Linear integrations", date: "Q1 2027" },
  { label: "White-label client portal", date: "Q2 2027" },
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
      <FeaturesList />
      <FeatureRoadmap />
      <FinalCTA
        eyebrow="Ready when you are"
        heading={
          <>
            See it in your own{" "}
            <span className="text-[#4F7EF7]">browser.</span>
          </>
        }
        body="Waitlist only for now. I'll email you when public beta opens."
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}

function FeaturesHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-20 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          Features
        </p>
        <h1
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.045em] text-white"
        >
          Everything you need to run{" "}
          <span className="text-[#4F7EF7]">client work.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-[#A0A0A0]">
          One approval. Project, milestones, and deposit invoice created
          automatically.
        </p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#A0A0A0]">
          Proposals, approvals, project tracking, client updates, deliverables,
          and invoices. One connected flow instead of five separate tools.
        </p>
      </div>
    </section>
  );
}

function FeaturesList() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-6">
        {allFeatures.map((feature, i) => {
          const bucketLabel = bucketByMockup[feature.mockup];
          const Icon = feature.icon;
          return (
            <Fragment key={feature.title}>
              {bucketLabel ? (
                <div className="border-t border-[#2A2A2A] pt-8">
                  <p className="mb-12 font-mono text-xs uppercase tracking-widest text-[#555]">
                    {bucketLabel}
                  </p>
                </div>
              ) : null}
              <article
                className={`grid gap-10 border-t border-[#2A2A2A] py-16 md:grid-cols-12 md:items-center md:gap-12 md:py-20 ${
                  i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
                }`}
              >
                <div className="md:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
                      <Icon
                        aria-hidden
                        className="h-4 w-4"
                        strokeWidth={2}
                      />
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h2
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                    className="mt-6 font-display font-black leading-[0.95] tracking-[-0.035em] text-white"
                  >
                    {feature.title}
                    <span className="text-[#4F7EF7]">.</span>
                  </h2>
                  <p className="mt-6 text-lg leading-relaxed text-[#A0A0A0]">
                    {feature.description}
                  </p>
                </div>
                <div className="md:col-span-7">
                  <FeatureMockup kind={feature.mockup} />
                </div>
              </article>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

function FeatureRoadmap() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          On the roadmap
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          What&apos;s coming{" "}
          <span className="text-[#4F7EF7]">next.</span>
        </h2>
        <p className="mb-16 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
          The shortlist of what is on the build queue, in rough order of
          priority.
        </p>
        <ol>
          {featureRoadmap.map(({ label, date }) => (
            <li
              key={label}
              className="flex items-center justify-between gap-6 border-t border-[#2A2A2A] py-6 last:border-b last:border-[#2A2A2A]"
            >
              <span className="flex-1 text-base font-medium text-white sm:text-lg">
                {label}
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
                {date ?? "Soon"}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-sm text-[#A0A0A0]">
          Order can shift as I learn what people need most. Follow along at{" "}
          <a
            href="https://github.com/jaineeldev/project-velo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[#4F7EF7] hover:text-white"
          >
            github.com/jaineeldev/project-velo
          </a>
          .
        </p>
      </div>
    </section>
  );
}
