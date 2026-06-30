import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Shield } from "lucide-react";
import { stillRoughGroups, team, whatsNextItems } from "../_lib/data";
import { StructuredData } from "../_components/structured-data";
import { Reveal } from "../_components/reveal";
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
      <KnownLimits />
      <WhatsNext />
      <CtaToSecurity />
      <WaitlistSection />
    </>
  );
}

function AboutHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-20 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
            About
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h1
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.045em] text-white"
          >
            Built in <span className="text-[#4F7EF7]">Brisbane.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-10 max-w-2xl text-balance text-lg leading-relaxed text-[#A0A0A0] sm:text-xl">
            Velo is a side-of-the-desk project that grew out of a frustration:
            freelancer tools are written for everyone except devs. So I&apos;m
            building the one I&apos;d actually want to use.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Manifesto() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            A note from me
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-12 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            I&apos;m a student. I built it{" "}
            <span className="text-[#4F7EF7]">anyway.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="max-w-2xl space-y-5 text-base leading-relaxed text-[#A0A0A0] sm:text-lg">
            <p>
              I&apos;m a computer science student. Velo is the project
              I&apos;ve been building on the side. Designed, written, and
              shipped end-to-end by me. No team, no investors, no boilerplate
              from a course.
            </p>
            <p>
              I picked this problem because the existing freelancer tools are
              obviously underbuilt for devs. They&apos;re built for wedding
              planners and marketing consultants: busy interfaces, patronising
              copy, workflows that assume the user&apos;s job involves a
              &ldquo;creative brief&rdquo; instead of a Git repo. Devs deserve
              better, and the problem is rich enough to actually engineer
              against: auth, payments, PDFs, webhooks, secure share tokens,
              atomic mutations, a real audit trail.
            </p>
            <p>
              I built it the way I&apos;d want to be hired to build something.
              Strict TypeScript everywhere. Zod at every trust boundary. A
              proper security pass: CSP, rate limiting, no PII in logs,
              timing-safe public tokens. Atomic transactions for any
              multi-row write. Accessibility audited, not assumed.
            </p>
            <p>
              Velo doesn&apos;t have paying customers yet. It&apos;s pre-beta.
              But it&apos;s a real product, not a school assignment. The repo
              is open, the decisions are documented, and I&apos;d happily walk
              you through any part of it.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-14 border-t border-[#2A2A2A] pt-8">
            <p className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
              Jaineel
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-widest text-[#555]">
              Brisbane · CS student · Open to roles
            </p>
            <a
              href="https://jaineel.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A0A0A0] transition-colors duration-200 hover:text-white"
            >
              Say hi
              <ArrowUpRight
                aria-hidden
                className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TeamSection() {
  const contributors = team.filter((m) => m.handle !== "jaineeldev");
  if (contributors.length === 0) return null;

  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-20">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[#555]">
            Acknowledgements
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mb-8 text-base leading-relaxed text-[#A0A0A0]">
            Velo is built end-to-end by me. Thanks to the contributors below
            for PRs, feedback, and second opinions along the way.
          </p>
        </Reveal>

        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {contributors.map((member, i) => (
            <Reveal key={member.handle} delay={0.1 + i * 0.04}>
              <li>
                <a
                  href={member.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 font-mono text-sm text-[#A0A0A0] transition-colors duration-200 hover:text-white"
                >
                  @{member.handle}
                  <ArrowUpRight
                    aria-hidden
                    className="h-3.5 w-3.5 text-[#555] transition-all duration-200 group-hover:text-[#4F7EF7] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </a>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShutdownReassurance() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
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
                instructions and a download link for everything I hold for
                you.
              </p>
              <p>
                Your export includes every proposal, invoice, client record,
                project, milestone, and time entry, in a standard format you
                can open without Velo. Nothing is locked in.
              </p>
              <p>
                It&apos;s just me building this, and I&apos;m honest about
                that. I&apos;d rather tell you this upfront than have you find
                out at the worst possible moment.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function KnownLimits() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            Where I am
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            Known <span className="text-[#4F7EF7]">limits.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mb-16 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
            I&apos;d rather show the seams than pretend they aren&apos;t there.
            What doesn&apos;t exist yet, grouped by area.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {stillRoughGroups.map(({ label, items }, i) => (
            <Reveal key={label} delay={0.12 + i * 0.06}>
              <div className="h-full rounded-xl border border-[#2A2A2A] bg-[#111] p-6 transition-all duration-300 hover:border-[#444] hover:bg-[#151515] motion-safe:hover:-translate-y-1">
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatsNext() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Reveal>
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            On the build queue
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            className="mb-6 font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
          >
            What&apos;s <span className="text-[#4F7EF7]">next.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mb-12 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
            The order I plan to build in. Anything here lands first; order can
            shift if real feedback says it should.
          </p>
        </Reveal>

        <ol>
          {whatsNextItems.map(({ title, detail }, i) => (
            <Reveal key={title} delay={0.12 + i * 0.04}>
              <li className="flex items-start gap-6 border-t border-[#2A2A2A] py-6">
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
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function CtaToSecurity() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <Reveal>
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
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#2A2A2A] px-7 py-3 text-sm font-bold text-[#A0A0A0] transition-all duration-200 hover:border-[#444] hover:text-white motion-safe:hover:-translate-y-0.5"
          >
            See security
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </Reveal>
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
