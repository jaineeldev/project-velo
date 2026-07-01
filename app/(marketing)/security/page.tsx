import type { Metadata } from "next";
import { Check, FileText, FolderKanban, Receipt } from "lucide-react";
import { StructuredData } from "../_components/structured-data";
import { FinalCTA } from "../_components/final-cta";
import { RoadmapList } from "../_components/roadmap-list";

const atAGlance: string[] = [
  "TLS encryption in transit",
  "Encrypted at rest",
  "Hosted in Australia",
  "30-day account deletion",
];

const dataInScope = [
  {
    icon: FileText,
    label: "Proposals & contracts",
    detail: "Line items, totals, approval logs.",
  },
  {
    icon: FolderKanban,
    label: "Project data",
    detail: "Milestones, deliverables, status.",
  },
  {
    icon: Receipt,
    label: "Invoices",
    detail: "Issued invoices, totals, payment status.",
  },
];

const securityRoadmap = [
  { label: "Independent third-party security audit" },
  { label: "Two-factor authentication for agency accounts" },
  { label: "SOC 2 Type II certification" },
  { label: "Single sign-on (SSO)" },
];

const securityDescription =
  "How Velo handles your data: client data ownership, cryptographic share tokens, encryption in transit and at rest, Australian hosting, and account deletion within 30 days.";

export const metadata: Metadata = {
  title: "Security",
  description: securityDescription,
  openGraph: {
    title: "Security · Velo",
    description: securityDescription,
  },
  twitter: {
    title: "Security · Velo",
    description: securityDescription,
  },
};

type Section = {
  number: string;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    number: "01",
    title: "Your data belongs to you",
    body: (
      <>
        <p>
          You own everything you put into Velo: proposals, invoices, project
          history, client records, time entries. I don&apos;t use your data
          for any purpose other than running the platform you signed up for.
          No training, no third-party analytics on the contents of your work,
          no sale to advertisers.
        </p>
        <p>
          You can export all your proposals, invoices, and client records as
          CSV at any time from your account settings. Your data is never
          locked in.
        </p>
        <p>
          If you delete your account, every record I hold for you is
          permanently removed within 30 days. That includes backups and the
          identifier I use to link your records together.
        </p>
      </>
    ),
  },
  {
    number: "02",
    title: "How client approvals work",
    body: (
      <>
        <p>
          Every shared proposal is reached through a unique, cryptographic
          share token tied to that one proposal. The link can&apos;t be
          guessed or reused on another record, and abuse is rate-limited at
          the edge.
        </p>
        <p>
          Clients now sign in to a free Velo account to view and approve, so
          every approval is logged against a verified email address with a
          timestamp. That trail is consistent with{" "}
          <span className="font-semibold text-white">
            Australia&apos;s Electronic Transactions Act 1999
          </span>
          . For high-value engagements I still recommend a separate signed
          contract.
        </p>
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6">
          <p className="text-sm leading-relaxed text-[#A0A0A0]">
            Velo is designed for use under Australian law. If you are outside
            Australia, please review the terms carefully before signing up.
          </p>
        </div>
      </>
    ),
  },
  {
    number: "03",
    title: "How I protect your data",
    body: (
      <>
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6">
          <p className="text-sm leading-relaxed text-[#A0A0A0]">
            All data is encrypted in transit using TLS and encrypted at rest.
            Backups run automatically.
          </p>
        </div>
        <p>
          Connections to Velo run over TLS, so every byte of data in transit
          between your browser and the servers is encrypted. At rest, your
          records live in{" "}
          <span className="font-semibold text-white">
            a fully cloud-based, serverless PostgreSQL database
          </span>{" "}
          in Australia with disk-level encryption.
        </p>
        <p>
          The application itself runs on{" "}
          <span className="font-semibold text-white">
            a globally distributed edge platform
          </span>
          , fronted by a dedicated authentication provider. Session tokens are
          HttpOnly cookies, scoped to the Velo domain, with the standard set
          of CSRF and SameSite protections.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Account deletion",
    body: (
      <>
        <p>
          You can delete your account from{" "}
          <span className="font-semibold text-white">Settings</span> at any
          time. Deletion purges your records from the database and your auth
          provider, and all associated data is permanently removed within 30
          days. I don&apos;t hold a shadow copy.
        </p>
      </>
    ),
  },
  {
    number: "05",
    title: "Reporting an issue",
    body: (
      <>
        <p>
          Found a security bug? Email{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className="font-medium text-[#4F7EF7] underline-offset-4 hover:underline"
          >
            jaineelk.dev@gmail.com
          </a>{" "}
          with the details and a way to reach you. Don&apos;t share specifics
          on public channels until I&apos;ve had a chance to fix the issue
          and tell the affected users.
        </p>
      </>
    ),
  },
];

export default function SecurityPage() {
  return (
    <>
      <StructuredData />
      <SecurityHero />
      <WhatVeloHandles />
      <section className="border-t border-[#2A2A2A] bg-[#0A0A0A]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
            At a glance
          </p>
          <ul className="mb-16 grid grid-cols-2 gap-4 rounded-xl border border-[#2A2A2A] bg-[#111] p-6 md:grid-cols-3">
            {atAGlance.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2.5 text-sm font-medium text-[#A0A0A0]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-green-800 bg-green-950 text-[#22C55E]">
                  <Check aria-hidden className="h-3 w-3" strokeWidth={3} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          {sections.map((section) => (
            <article
              key={section.number}
              className="relative border-t border-[#2A2A2A] py-16"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-0 top-12 select-none font-mono font-black leading-none text-[#1A1A1A]"
                style={{ fontSize: "8rem" }}
              >
                {section.number}
              </span>
              <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
                Section {section.number}
              </p>
              <h2 className="relative mt-4 max-w-2xl font-display text-4xl font-black leading-[0.95] tracking-[-0.035em] text-white sm:text-5xl">
                {section.title}
              </h2>
              <div className="relative mt-8 max-w-prose space-y-5 text-base leading-[1.75] text-[#A0A0A0] sm:text-lg">
                {section.body}
              </div>
            </article>
          ))}
        </div>
      </section>
      <SecurityRoadmap />
      <FinalCTA
        eyebrow="Want the full picture?"
        heading={
          <>
            Read the Privacy{" "}
            <span className="text-[#4F7EF7]">Policy.</span>
          </>
        }
        body="The Privacy Policy and Terms of Service cover the full legal language. The summary on this page is the spirit of it."
        subtle="Australian privacy law applies. If you're outside Australia, please read the policy carefully before signing up."
        primaryCta={{ label: "Read Privacy Policy", href: "/privacy" }}
        secondaryCta={{ label: "Read Terms of Service", href: "/terms" }}
      />
    </>
  );
}

function WhatVeloHandles() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          What Velo handles
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-12 max-w-2xl font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          Three kinds of <span className="text-[#4F7EF7]">data.</span>
        </h2>
        <div className="grid gap-6 text-left sm:grid-cols-3">
          {dataInScope.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="rounded-xl border border-[#2A2A2A] bg-[#111] p-6 transition-all hover:border-[#444] hover:bg-[#151515]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-5 text-lg font-bold tracking-tight text-white">
                {label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#A0A0A0]">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecurityRoadmap() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#555]">
          On the roadmap
        </p>
        <h2
          style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          className="mb-6 max-w-2xl font-display font-black leading-[0.9] tracking-[-0.035em] text-white"
        >
          What I don&apos;t do{" "}
          <span className="text-[#4F7EF7]">yet.</span>
        </h2>
        <p className="mb-12 max-w-xl text-lg leading-relaxed text-[#A0A0A0]">
          Standards-level security work that is on the build queue. I&apos;m
          shipping these in order before public launch.
        </p>
        <RoadmapList items={securityRoadmap} />
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[#A0A0A0]">
          Data hosting, payments, and authentication are handled by Vercel,
          Neon, Stripe, and a dedicated authentication provider. Each of
          which maintains their own SOC 2 certifications and security
          programs.
        </p>
      </div>
    </section>
  );
}

function SecurityHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-20 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          Security
        </p>
        <h1
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.04em] text-white"
        >
          How I store, protect, and delete your{" "}
          <span className="text-[#4F7EF7]">data.</span>
        </h1>
        <p className="mx-auto mt-9 max-w-2xl text-lg leading-relaxed text-[#A0A0A0]">
          Velo handles contracts, invoices, and client records. Here is
          exactly how that data is stored, transmitted, accessed, and
          deleted, in plain English.
        </p>
      </div>
    </section>
  );
}
