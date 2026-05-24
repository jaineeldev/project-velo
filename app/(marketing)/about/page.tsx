import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { stillRoughGroups, team, whatsNextGroups } from "../_lib/data";
import { StructuredData } from "../_components/structured-data";
import { Waitlist } from "../_components/waitlist";

export const metadata: Metadata = {
  title: "About",
  description:
    "Velo is being built in Brisbane by a small team of devs for other devs. Here's who's behind it, why it exists, and what's still rough about it.",
};

export default function AboutPage() {
  return (
    <>
      <StructuredData />
      <AboutHero />
      <Manifesto />
      <TeamSection />
      <EarlyBetaNote />
      <WaitlistBlock />
      <CtaToSecurity />
    </>
  );
}

function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 sm:px-10 sm:pb-32 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          About
        </p>
        <h1 className="mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          Built in <span className="text-primary">Brisbane.</span>
        </h1>
        <p className="mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo is a side-of-the-desk project that grew out of a frustration:
          freelancer tools are written for everyone except devs. So we&apos;re
          building the one we&apos;d actually want to use.
        </p>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="relative bg-[#0d0d0f]">
      <div className="mx-auto max-w-3xl px-6 py-32 sm:px-10 sm:py-40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Why we&apos;re building this
        </p>
        <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
          Built for devs who&apos;d rather be{" "}
          <span className="text-primary">coding.</span>
        </h2>
        <div className="mt-10 space-y-6 text-base leading-[1.75] text-white/60 sm:text-lg">
          <p>
            Most freelancer tools feel like they were made for someone else:
            wedding planners, marketing consultants, designers. The interfaces
            are busy, the language is patronising, and the workflows assume a
            kind of work that isn&apos;t ours. Meanwhile, devs spend their day
            inside their editor, terminal, and GitHub. Clean, fast,
            well-designed tools. The business side of being a dev shouldn&apos;t
            feel like a step backwards from that.
          </p>
          <p>
            Velo is for the dev who&apos;s tired of running their freelance
            work out of something that looks and feels like 2015 SaaS. No
            popups asking for testimonials, no badge-shaped CTAs, no clip art.
            Just the proposal-to-invoice flow, scoped for how dev work actually
            happens.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="relative border-y border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-32 sm:px-10 sm:py-40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          The team
        </p>
        <h2 className="mt-6 max-w-2xl text-balance text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
          A few devs in{" "}
          <span className="text-primary">Brisbane.</span>
        </h2>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo is built mostly by one person, with help from contributors who
          send PRs and feedback. No investors, no growth team, no quarterly
          OKRs.
        </p>

        <ul className="mt-14 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {team.map((member) => (
            <li key={member.handle}>
              <a
                href={member.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8",
                  focusRing,
                )}
              >
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
                    @{member.handle}
                  </span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
                  <span className="text-sm text-white/60 sm:text-base">
                    {member.role}
                  </span>
                  <span
                    aria-hidden
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/40 transition-colors group-hover:text-primary"
                  >
                    github
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function EarlyBetaNote() {
  return (
    <section className="relative bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-32 sm:px-10 sm:py-40">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Where we are
        </p>
        <h2 className="mt-6 max-w-2xl text-balance text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
          Known limits and{" "}
          <span className="text-primary">what&apos;s next.</span>
        </h2>
        <p className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
          We&apos;d rather show the seams than pretend they aren&apos;t there.
          Below: what doesn&apos;t exist yet, and the dated plan for everything
          we&apos;re building.
        </p>

        <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-12 lg:gap-20">
          <RoughColumn
            heading="Known limitations"
            groups={stillRoughGroups}
          />
          <RoughColumn
            heading="Roadmap"
            groups={whatsNextGroups}
          />
        </div>
      </div>
    </section>
  );
}

function RoughColumn({
  heading,
  groups,
}: {
  heading: string;
  groups: {
    label: string;
    items: { title: string; detail: string; quarter?: string }[];
  }[];
}) {
  return (
    <div>
      <p className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-3xl">
        {heading}
      </p>
      <div className="mt-10 space-y-12">
        {groups.map(({ label, items }) => (
          <div key={label}>
            <div className="border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
              {label}
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {items.map(({ title, detail, quarter }) => (
                <li
                  key={title}
                  className="py-5 text-sm leading-relaxed text-white/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-white">{title}</span>
                    {quarter ? (
                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                        {quarter}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1">{detail}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitlistBlock() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-3xl px-6 py-32 sm:px-10 sm:py-40">
        <Waitlist />
      </div>
    </section>
  );
}

function CtaToSecurity() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-32 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-40">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Trust
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            How we handle your{" "}
            <span className="text-primary">data.</span>
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg">
            Velo handles proposals, invoices, and client records. Read the
            security page for the full picture, in plain language.
          </p>
        </div>
        <Link
          href="/security"
          className={cn(
            "group inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-white/25 bg-transparent px-7 text-sm font-semibold text-white transition-colors hover:bg-white/[0.06]",
            focusRing,
          )}
        >
          See security
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </div>
    </section>
  );
}
