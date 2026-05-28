import type { Metadata } from "next";
import { FileText, FolderKanban, Receipt, Shield } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { StructuredData } from "../_components/structured-data";
import { FinalCTA } from "../_components/final-cta";
import { RoadmapList } from "../_components/roadmap-list";

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
    label: "Invoices & payments",
    detail: "Issued invoices, paid status. Never card numbers.",
  },
];

const securityRoadmap = [
  { label: "Independent third-party security audit" },
  { label: "Two-factor authentication for agency accounts" },
  { label: "SOC 2 Type II certification" },
  { label: "Single sign-on (SSO)" },
];

export const metadata: Metadata = {
  title: "Security",
  description:
    "How Velo handles your data: client data ownership, cryptographic share tokens, encryption in transit and at rest, Australian hosting, Stripe-handled payments, and account deletion within 30 days.",
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
          share token tied to that one proposal. The link can&apos;t be guessed
          or reused on another record, and abuse is rate-limited at the edge.
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
        <p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">
          Velo is designed for use under Australian law. If you are outside
          Australia, please review the terms carefully before signing up.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "How I protect your data",
    body: (
      <>
        <p className="not-prose rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
          Velo runs on Vercel. Your data lives in Neon serverless Postgres,
          Sydney region, with disk-level encryption.
        </p>
        <p>
          Connections to Velo run over TLS, so every byte of data in transit
          between your browser and the servers is encrypted. At rest, your
          records live in{" "}
          <span className="font-semibold text-white">Neon serverless Postgres</span>{" "}
          in the Sydney region with disk-level encryption.
        </p>
        <p>
          The application itself runs on{" "}
          <span className="font-semibold text-white">Vercel</span>, fronted by
          Clerk for authentication. Session tokens are HttpOnly cookies, scoped
          to the Velo domain, with the standard set of CSRF and SameSite
          protections.
        </p>
      </>
    ),
  },
  {
    number: "04",
    title: "Payments",
    body: (
      <>
        <div className="not-prose flex items-start gap-4 rounded-xl border border-primary/30 bg-primary/[0.06] p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Shield aria-hidden className="h-5 w-5" strokeWidth={2} />
          </span>
          <p className="text-base font-semibold leading-snug text-white sm:text-lg">
            Velo never stores card or bank details. Stripe handles all payment
            processing end-to-end.
          </p>
        </div>
        <p>
          Today, invoices include your bank details and your client pays you
          directly via bank transfer.
        </p>
        <p>
          When native card payments ship (coming soon), they will be handled
          end-to-end by{" "}
          <span className="font-semibold text-white">Stripe</span>. Card
          numbers go from your client&apos;s browser straight to Stripe; Velo
          only ever sees the resulting status (paid, refunded, disputed).
        </p>
      </>
    ),
  },
  {
    number: "05",
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
        <p>
          If you&apos;d rather pause than delete, every plan has a free trial
          that pauses your workspace without losing any data. Pick up where
          you left off whenever you come back.
        </p>
      </>
    ),
  },
  {
    number: "06",
    title: "Reporting an issue",
    body: (
      <>
        <p>
          Found a security bug? Email{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className={cn(
              "rounded-sm font-semibold text-primary underline-offset-2 hover:underline",
              focusRing,
            )}
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
      <section className="relative bg-[#0d0d0f]">
        <div className="mx-auto max-w-4xl px-6 pb-12 pt-8 sm:px-10 sm:pb-24 sm:pt-12">
          {sections.map((section, i) => (
            <article
              key={section.number}
              className={cn(
                "border-t border-white/10 py-20 first:border-t-0 sm:py-24",
                i === 0 && "first:pt-12",
              )}
            >
              <span
                aria-hidden
                className="mb-2 block select-none text-[5rem] font-bold leading-none text-white/[0.06] sm:text-[6rem]"
              >
                {section.number}
              </span>
              <h2 className="text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-4xl md:text-4xl">
                {section.title}
              </h2>
              <div className="mt-8 max-w-prose space-y-5 text-base leading-[1.75] text-white/60 sm:text-lg">
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
            <span className="text-primary">Policy.</span>
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

// Three-column summary near the top so visitors immediately know what data
// categories Velo handles before digging into the numbered sections.
function WhatVeloHandles() {
  return (
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-10 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          What Velo handles
        </p>
        <div className="mt-8 grid gap-4 text-left sm:grid-cols-3 sm:gap-5">
          {dataInScope.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Icon aria-hidden className="h-4 w-4" strokeWidth={2} />
              </span>
              <p className="mt-4 text-base font-bold text-white">{label}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
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
    <section className="relative border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:px-10 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            On the roadmap
          </p>
          <h2 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            What I don&apos;t do{" "}
            <span className="text-primary">yet.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Standards-level security work that is on the build queue. I&apos;m
            shipping these in order before public launch.
          </p>
        </div>
        <RoadmapList items={securityRoadmap} className="mt-12" />
      </div>
    </section>
  );
}

function SecurityHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 text-center sm:px-10 sm:pb-36 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Security
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-6xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl md:text-8xl">
          How I store, protect, and delete your{" "}
          <span className="text-primary">data.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          Velo handles contracts, invoices, and client records. Here is exactly
          how that data is stored, transmitted, accessed, and deleted, plain
          English.
        </p>
      </div>
    </section>
  );
}
