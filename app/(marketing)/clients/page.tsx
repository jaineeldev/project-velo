import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Mail,
  Receipt,
  Shield,
  X,
  type LucideIcon,
} from "lucide-react";
import { StructuredData } from "../_components/structured-data";
import { FinalCTA } from "../_components/final-cta";
import { focusRing } from "../_lib/shared";

const clientsDescription =
  "What your clients actually see when you send a proposal through Velo. A clean, branded experience: secure links, one-click approval, a free client portal, and clear payment visibility.";

export const metadata: Metadata = {
  title: "For clients",
  description: clientsDescription,
  openGraph: {
    title: "For clients · Velo",
    description: clientsDescription,
  },
  twitter: {
    title: "For clients · Velo",
    description: clientsDescription,
  },
};

type Section = {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  body: string;
  mockup: React.ReactNode;
};

const sections: Section[] = [
  {
    eyebrow: "What your client receives",
    icon: Mail,
    title: "A proposal that looks like you mean business.",
    body: "Your client gets an email with a secure link to their proposal. It opens to a clean, professional page showing the full scope of work, line items, GST breakdown, and total. No account needed to view it, just click and read.",
    mockup: <ProposalSharePageMock />,
  },
  {
    eyebrow: "One click to approve",
    icon: CheckCircle2,
    title: "Approval takes ten seconds.",
    body: "Your client clicks Approve. That's it. No printing, no scanning, no emailing back a signed PDF. The approval is logged with a timestamp and their verified email address, consistent with Australia's Electronic Transactions Act 1999.",
    mockup: <ApprovalConfirmationMock />,
  },
  {
    eyebrow: "Their own dashboard",
    icon: Shield,
    title: "Clients always know where things stand.",
    body: "Clients are invited to a secure Velo portal. They never pay for an account, and they only ever see the proposals, projects, and invoices you share with them, nothing else.",
    mockup: <ClientDashboardMock />,
  },
  {
    eyebrow: "Payment visibility",
    icon: Receipt,
    title: "No surprises when it's time to pay.",
    body: "When a deposit or final invoice is due, your client sees a clear payment indicator on their dashboard. They always know what's outstanding and what's been settled, before they have to ask.",
    mockup: <PaymentPendingProjectMock />,
  },
];

export default function ClientsPage() {
  return (
    <>
      <StructuredData />
      <ClientsHero />

      {sections.map((section, i) => (
        <section
          key={section.eyebrow}
          className="border-t border-[#2A2A2A] bg-[#0A0A0A] py-24"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div
              className={`grid gap-12 md:grid-cols-12 md:items-center ${
                i % 2 === 1 ? "md:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="md:col-span-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-[#4F7EF7]">
                    <section.icon
                      aria-hidden
                      className="h-4 w-4"
                      strokeWidth={2}
                    />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
                    {String(i + 1).padStart(2, "0")} · {section.eyebrow}
                  </span>
                </div>
                <h2
                  style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
                  className="mt-6 font-display font-black leading-[0.95] tracking-[-0.035em] text-white"
                >
                  {section.title}
                </h2>
                <p className="mt-6 text-lg leading-relaxed text-[#A0A0A0]">
                  {section.body}
                </p>
              </div>
              <div className="md:col-span-7">{section.mockup}</div>
            </div>
          </div>
        </section>
      ))}

      <FreeForClientsSection />

      <FinalCTA
        heading={
          <>
            Ready to impress your{" "}
            <span className="text-[#4F7EF7]">clients?</span>
          </>
        }
        body="Velo is pre-beta. Join the waitlist and I'll email when public sign-up opens."
        subtle=""
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}

function ClientsHero() {
  return (
    <section className="bg-[#0A0A0A] px-6 pb-20 pt-32 text-center sm:pt-40">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          For your clients
        </p>
        <h1
          style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          className="mx-auto max-w-5xl text-balance font-display font-black leading-[0.9] tracking-[-0.045em] text-white"
        >
          A professional experience your clients will actually{" "}
          <span className="text-[#4F7EF7]">trust.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-balance text-lg leading-relaxed text-[#A0A0A0]">
          When you send a proposal through Velo, your client gets a clean,
          branded experience. No login walls, no confusion, no chasing for
          signatures. Just a link, a decision, and a project that starts
          itself.
        </p>
        <div className="mt-12 flex items-center justify-center">
          <Link
            href="/waitlist"
            className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-[#4F7EF7] px-8 py-3.5 text-base font-bold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing}`}
          >
            Join the waitlist
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FreeForClientsSection() {
  return (
    <section className="border-t border-[#2A2A2A] bg-[#111] py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[#555]">
          Free for your clients
        </p>
        <h2
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
          className="mx-auto max-w-3xl text-balance font-display font-black leading-[0.9] tracking-[-0.04em] text-white"
        >
          Client accounts are always{" "}
          <span className="text-[#4F7EF7]">free.</span>
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-balance text-lg leading-relaxed text-[#A0A0A0]">
          Your clients never pay for Velo. Their account is free, their portal
          is free, and there&apos;s no upsell waiting for them. You pay for
          the tool. They just get the experience.
        </p>
        <ul className="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Check, label: "Free forever" },
            { icon: Shield, label: "No credit card" },
            { icon: X, label: "Cancel anytime" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-3 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] px-5 py-4"
            >
              <Icon
                aria-hidden
                className="h-4 w-4 shrink-0 text-[#4F7EF7]"
                strokeWidth={2}
              />
              <span className="text-sm font-medium text-white">{label}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-xl font-mono text-xs uppercase tracking-widest text-[#555]">
          Billed to the agency or freelancer · clients sign up free
        </p>
      </div>
    </section>
  );
}

function MockChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2.5">
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#2A2A2A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2A2A2A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#2A2A2A]" />
      </div>
      <span className="ml-3 truncate font-mono text-[11px] text-[#555]">
        {url}
      </span>
    </div>
  );
}

function ProposalSharePageMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111]">
      <MockChrome url="velo.app/share/p_8f3aa9c1" />
      <div className="p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
          Proposal · Sent 14 May 2026
        </p>
        <h3 className="mt-3 text-2xl font-bold text-white">
          Northstar Website Redesign
        </h3>
        <p className="mt-1 font-mono text-sm text-[#A0A0A0]">
          From Jaineel Dev · For Northstar Co.
        </p>

        <div className="mt-6 space-y-3">
          {[
            { name: "Discovery & design", amount: "A$1,800" },
            { name: "Frontend build", amount: "A$3,400" },
            { name: "CMS integration", amount: "A$1,600" },
            { name: "Launch & QA", amount: "A$960" },
          ].map((line) => (
            <div
              key={line.name}
              className="flex items-center justify-between border-b border-[#2A2A2A] pb-3 last:border-b-0"
            >
              <span className="text-sm text-white">{line.name}</span>
              <span className="font-mono text-sm text-[#A0A0A0]">
                {line.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-baseline justify-between border-t border-[#2A2A2A] pt-5">
          <span className="font-mono text-xs uppercase tracking-widest text-[#555]">
            Total · inc. GST
          </span>
          <span className="font-mono text-2xl font-bold text-white">
            A$8,400
          </span>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className="flex-1 cursor-default rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-bold text-white"
          >
            Approve
          </button>
          <button
            type="button"
            className="cursor-default rounded-lg border border-[#2A2A2A] px-4 py-2.5 text-sm font-medium text-[#A0A0A0]"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ApprovalConfirmationMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111] p-10 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-800 bg-green-950 text-[#22C55E]">
        <CheckCircle2 aria-hidden className="h-6 w-6" strokeWidth={2} />
      </span>
      <h3 className="mt-6 text-xl font-bold text-white">Approved</h3>
      <p className="mt-2 font-mono text-sm text-[#A0A0A0]">
        Northstar Website Redesign
      </p>
      <div className="mx-auto mt-6 max-w-xs rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4 text-left">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
          Logged
        </p>
        <p className="mt-2 font-mono text-xs text-white">
          14 May 2026 · 10:42 AEST
        </p>
        <p className="mt-1 font-mono text-xs text-[#A0A0A0]">
          jordan@northstar.com.au
        </p>
      </div>
      <p className="mt-6 font-mono text-xs text-[#555]">
        Project & deposit invoice created automatically.
      </p>
    </div>
  );
}

function ClientDashboardMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111]">
      <MockChrome url="velo.app/portal" />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
              Logged in as
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Jordan · Northstar Co.
            </p>
          </div>
          <span className="rounded-md border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-0.5 font-mono text-[10px] uppercase text-[#A0A0A0]">
            Free account
          </span>
        </div>

        <div className="mt-6 space-y-3">
          {[
            {
              name: "Northstar Website Redesign",
              status: "In progress",
              tone: "active",
              progress: "3 / 5 milestones",
            },
            {
              name: "Brand microsite",
              status: "Approved",
              tone: "done",
              progress: "Awaiting kickoff",
            },
            {
              name: "Q2 retainer proposal",
              status: "Sent",
              tone: "sent",
              progress: "Awaiting your review",
            },
          ].map((row) => (
            <div
              key={row.name}
              className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-4"
            >
              <div>
                <p className="text-sm font-semibold text-white">{row.name}</p>
                <p className="mt-1 font-mono text-xs text-[#555]">
                  {row.progress}
                </p>
              </div>
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  row.tone === "active"
                    ? "border border-blue-800 bg-blue-950 text-blue-400"
                    : row.tone === "done"
                      ? "bg-green-950 text-green-400"
                      : "bg-blue-950 text-blue-400"
                }`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentPendingProjectMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111]">
      <MockChrome url="velo.app/portal/p_5b41" />
      <div className="p-6">
        <p className="font-mono text-xs uppercase tracking-widest text-[#555]">
          Project · Northstar Website Redesign
        </p>
        <h3 className="mt-2 text-xl font-bold text-white">
          Payment outstanding
        </h3>

        <div className="mt-6 rounded-lg border border-amber-900 bg-amber-950/40 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-amber-400">
                Final invoice
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Due 30 June 2026
              </p>
            </div>
            <span className="font-mono text-2xl font-bold text-white">
              A$5,880
            </span>
          </div>
          <button
            type="button"
            className="mt-4 inline-flex w-full cursor-default items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-bold text-white"
          >
            Pay invoice
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { label: "Deposit invoice", state: "Paid · 18 May 2026" },
            { label: "Milestone 1", state: "Delivered" },
            { label: "Milestone 2", state: "Delivered" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3"
            >
              <span className="text-sm text-white">{row.label}</span>
              <span className="font-mono text-xs text-[#22C55E]">
                {row.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
