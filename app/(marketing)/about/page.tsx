import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Shield } from "lucide-react";
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
      <WaitlistSection />
      <ShutdownReassurance />
      <EarlyBetaNote />
      <ContactLine />
      <CtaToSecurity />
    </>
  );
}

function AboutHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-20 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          About
        </p>
        <h1
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.045em] text-white"
        >
          Built in <span className="text-[#4F7EF7]">Brisbane.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-balance text-lg leading-relaxed text-[#A0A0A0] sm:text-xl">
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
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          Why I&apos;m building this
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-12 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          Built for devs who&apos;d rather be{" "}
          <span className="text-[#4F7EF7]">coding.</span>
        </h2>
        <div className="max-w-2xl space-y-6 text-2xl leading-relaxed text-[#A0A0A0]">
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
            Just the proposal-to-invoice flow, scoped for how dev work
            actually happens.
          </p>
        </div>
      </div>
    </section>
  );
}

function TeamSection() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          The team
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          The <span className="text-[#4F7EF7]">team.</span>
        </h2>
        <p className="mb-12 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
          Velo is built mostly by one person, with help from contributors who
          send PRs and feedback. No investors, no growth team, no quarterly
          OKRs.
        </p>

        <ul>
          {team.map((member) => (
            <li key={member.handle}>
              <a
                href={member.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-6 border-t border-[#2A2A2A] py-6 transition-colors hover:bg-[#0F0F0F]"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
                    @{member.handle}
                  </span>
                  <span className="text-sm text-[#A0A0A0]">{member.role}</span>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#555] transition-colors group-hover:text-[#4F7EF7]">
                  GitHub
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
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
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          Where I am
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          Known limits and{" "}
          <span className="text-[#4F7EF7]">what&apos;s next.</span>
        </h2>
        <p className="mb-16 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
          I&apos;d rather show the seams than pretend they aren&apos;t there.
          Below: what doesn&apos;t exist yet, and the order I plan to build
          everything in.
        </p>

        <h3 className="mb-8 font-display text-2xl font-black tracking-tight text-white">
          Known limits.
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {stillRoughGroups.map(({ label, items }) => (
            <div
              key={label}
              className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6"
            >
              <p className="border-b border-[#2A2A2A] pb-3 font-mono text-xs uppercase tracking-widest text-[#555]">
                {label}
              </p>
              <ul>
                {items.map(({ title, detail }) => (
                  <li
                    key={title}
                    className="border-b border-[#2A2A2A] py-5 text-sm leading-relaxed text-[#A0A0A0] last:border-b-0"
                  >
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1">{detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="mb-8 mt-20 font-display text-2xl font-black tracking-tight text-white">
          What&apos;s next.
        </h3>
        <ol>
          {whatsNextItems.map(({ title, detail }, i) => (
            <li
              key={title}
              className="flex items-start gap-6 border-t border-[#2A2A2A] py-6"
            >
              <span className="font-mono text-sm font-bold tabular-nums text-[#555]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <p className="text-base font-semibold text-white sm:text-lg">
                  {title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[#A0A0A0]">
                  {detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ShutdownReassurance() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-8 sm:p-10">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
              <Shield aria-hidden className="h-5 w-5" strokeWidth={2} />
            </span>
            <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
              My commitment
            </p>
          </div>
          <h2 className="mt-6 max-w-xl font-display text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
            If I ever shut Velo down, your data comes with you.
          </h2>
          <div className="mt-7 max-w-prose space-y-5 text-base leading-relaxed text-[#A0A0A0]">
            <p>
              I&apos;ll give you at least 60 days notice before Velo shuts
              down. No sudden surprises. You&apos;ll get an email with
              instructions and a download link for everything I hold for you.
            </p>
            <p>
              Your export includes every proposal, invoice, client record,
              project, milestone, and time entry, in a standard format you can
              open without Velo. Nothing is locked in.
            </p>
            <p>
              It&apos;s just me building this, and I&apos;m honest about that.
              I&apos;d rather tell you this upfront than have you find out at
              the worst possible moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactLine() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#111]">
      <p className="py-4 text-center font-mono text-xs uppercase tracking-widest text-[#A0A0A0]">
        Questions? Email me at{" "}
        <a
          href="mailto:jaineelk.dev@gmail.com"
          className="text-[#4F7EF7] hover:text-white"
        >
          jaineelk.dev@gmail.com
        </a>
        . I read everything.
      </p>
    </section>
  );
}

function WaitlistSection() {
  return (
    <section
      id="waitlist"
      className="scroll-mt-24 border-t border-[#2A2A2A] bg-[#0A0A0A] py-24"
    >
      <div className="mx-auto max-w-3xl px-6">
        <Waitlist />
      </div>
    </section>
  );
}

function CtaToSecurity() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            Trust
          </p>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            How I handle your <span className="text-[#4F7EF7]">data.</span>
          </h2>
          <p className="text-lg leading-relaxed text-[#A0A0A0]">
            Velo handles proposals, invoices, and client records. Read the
            security page for the full picture, in plain language.
          </p>
        </div>
        <Link
          href="/security"
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#2A2A2A] px-7 py-3 text-sm font-bold text-[#A0A0A0] transition-all hover:border-[#444] hover:text-white"
        >
          See security
          <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={2} />
        </Link>
      </div>
    </section>
  );
}
