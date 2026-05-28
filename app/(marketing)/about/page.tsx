import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { stillRoughGroups, team, whatsNextItems } from "../_lib/data";
import { StructuredData } from "../_components/structured-data";
import { Waitlist } from "../_components/waitlist";

export const metadata: Metadata = {
  title: "About",
  description:
    "Velo is being built in Brisbane by one dev for other devs. Here's who's behind it, why it exists, and what's still rough about it.",
};

export default function AboutPage() {
  return (
    <>
      <StructuredData />
      <AboutHero />
      <Manifesto />
      <TeamSection />
      <ShutdownReassurance />
      <WaitlistBlock />
      <EarlyBetaNote />
      <ContactLine />
      <CtaToSecurity />
    </>
  );
}

function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 text-center sm:px-10 sm:pb-32 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          About
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          Built in <span className="text-primary">Brisbane.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo is a side-of-the-desk project that grew out of a frustration:
          freelancer tools are written for everyone except devs. So I&apos;m
          building the one I&apos;d actually want to use.
        </p>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="relative bg-[#0d0d0f]">
      <div className="mx-auto max-w-3xl px-6 py-32 sm:px-10 sm:py-40">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Why I&apos;m building this
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            Built for devs who&apos;d rather be{" "}
            <span className="text-primary">coding.</span>
          </h2>
        </div>
        <div className="mt-10 space-y-6 text-base leading-[1.75] text-white/60 sm:text-lg">
          <p>
            Most freelancer tools feel like they were made for someone else:
            wedding planners, marketing consultants, designers. The interfaces
            are busy, the language is patronising, and the workflows assume a
            kind of work that isn&apos;t mine. Meanwhile, devs spend their day
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
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            The team
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
            The <span className="text-primary">team.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Velo is built mostly by one person, with help from contributors who
            send PRs and feedback. No investors, no growth team, no quarterly
            OKRs.
          </p>
        </div>

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
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl">
                    @{member.handle}
                  </span>
                  <span className="text-sm text-white/40">
                    {member.role}
                  </span>
                </div>
                <div className="flex items-center gap-4 sm:gap-6">
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
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Where I am
          </p>
          <h2 className="mx-auto mt-6 max-w-2xl text-balance text-5xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">
            Known limits and{" "}
            <span className="text-primary">what&apos;s next.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            I&apos;d rather show the seams than pretend they aren&apos;t
            there. Below: what doesn&apos;t exist yet, and the order I plan
            to build everything in.
          </p>
        </div>

        <div className="mt-20 sm:mt-24">
          <h3 className="text-center text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
            Known limits.
          </h3>
          <div className="mt-12 grid gap-12 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
            {stillRoughGroups.map(({ label, items }) => (
              <div key={label}>
                <div className="border-b border-white/10 pb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  {label}
                </div>
                <ul className="divide-y divide-white/[0.06]">
                  {items.map(({ title, detail }) => (
                    <li
                      key={title}
                      className="py-5 text-sm leading-relaxed text-white/60"
                    >
                      <span className="font-semibold text-white">{title}</span>
                      <p className="mt-1">{detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-white/[0.06] pt-20 sm:mt-24">
          <h3 className="text-center text-3xl font-bold leading-tight tracking-[-0.02em] text-white sm:text-4xl">
            What&apos;s next.
          </h3>
          <ol className="mx-auto mt-14 max-w-2xl">
            {whatsNextItems.map(({ title, detail }, i) => {
              const isLast = i === whatsNextItems.length - 1;
              return (
                <li
                  key={title}
                  className="relative flex items-start gap-5 pb-10 last:pb-0"
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
                  <div className="flex-1 pt-[5px]">
                    <p className="text-base font-semibold text-white sm:text-lg">
                      {title}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                      {detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Sits right after the team section to answer the "what if this disappears"
// objection that surfaces once the small-team reality is on the page.
function ShutdownReassurance() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-2xl px-6 py-20 sm:px-10 sm:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          My commitment
        </p>
        <h2 className="mt-6 text-balance text-2xl font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-3xl">
          If I ever shut Velo down, your data comes with you.
        </h2>
        <div className="mt-8 max-w-prose space-y-5 text-base leading-relaxed text-white/60">
          <p>
            I&apos;ll give you at least 60 days notice before Velo shuts down.
            No sudden surprises. You&apos;ll get an email with instructions
            and a download link for everything I hold for you.
          </p>
          <p>
            Your export includes every proposal, invoice, client record,
            project, milestone, and time entry, in a standard format you can
            open without Velo. Nothing is locked in.
          </p>
          <p>
            It&apos;s just me building this, and I&apos;m honest about that.
            I&apos;d rather tell you this upfront than have you find out at the
            worst possible moment.
          </p>
        </div>
      </div>
    </section>
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

function ContactLine() {
  return (
    <section className="relative bg-[#0d0d0f]">
      <p className="py-4 text-center text-sm text-white/60">
        Questions? Email me at jaineelk.dev@gmail.com. I read everything.
      </p>
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
            How I handle your{" "}
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
