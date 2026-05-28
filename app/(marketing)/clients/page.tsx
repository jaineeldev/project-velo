import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Shield, X } from "lucide-react";
import { cn, focusRing } from "@/lib/utils";
import { StructuredData } from "../_components/structured-data";
import { FinalCTA } from "../_components/final-cta";
import {
  ApprovalConfirmationMock,
  ClientDashboardMock,
  type ClientPerspectiveIconKey,
  ClientPerspectiveRow,
  PaymentPendingProjectMock,
  ProposalSharePageMock,
} from "../_components/clients-perspective";

export const metadata: Metadata = {
  title: "For clients",
  description:
    "What your clients actually see when you send a proposal through Velo. A clean, branded experience: secure links, one-click approval, a free client portal, and clear payment visibility. Aimed at Australian freelancers and agencies evaluating Velo.",
};

type Section = {
  eyebrow: string;
  iconKey: ClientPerspectiveIconKey;
  title: string;
  body: string;
  mockup: React.ReactNode;
  tone: "light" | "dark";
};

const sections: Section[] = [
  {
    eyebrow: "What your client receives",
    iconKey: "mail",
    title: "A proposal that looks like you mean business.",
    body: "Your client gets an email with a secure link to their proposal. It opens to a clean, professional page showing the full scope of work, line items, GST breakdown, and total. No account needed to view it, just click and read.",
    mockup: <ProposalSharePageMock />,
    tone: "light",
  },
  {
    eyebrow: "One click to approve",
    iconKey: "approve",
    title: "Approval takes ten seconds.",
    body: "Your client clicks Approve. That's it. No printing, no scanning, no emailing back a signed PDF. The approval is logged with a timestamp and their verified email address, consistent with Australia's Electronic Transactions Act 1999.",
    mockup: <ApprovalConfirmationMock />,
    tone: "dark",
  },
  {
    eyebrow: "Their own dashboard",
    iconKey: "dashboard",
    title: "Clients always know where things stand.",
    body: "Clients are invited to a secure Velo portal. They never pay for an account, and they only ever see the proposals, projects, and invoices you share with them, nothing else.",
    mockup: <ClientDashboardMock />,
    tone: "light",
  },
  {
    eyebrow: "Payment visibility",
    iconKey: "payment",
    title: "No surprises when it's time to pay.",
    body: "When a deposit or final invoice is due, your client sees a clear payment indicator on their dashboard. They always know what's outstanding and what's been settled, before they have to ask.",
    mockup: <PaymentPendingProjectMock />,
    tone: "dark",
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
          data-bg={section.tone}
          className={cn(
            "relative",
            section.tone === "light"
              ? "bg-[#fafafa] text-black"
              : "bg-[#0d0d0f] text-white",
          )}
        >
          <ClientPerspectiveRow
            eyebrow={section.eyebrow}
            iconKey={section.iconKey}
            index={i + 1}
            title={section.title}
            body={section.body}
            mockup={section.mockup}
            flipped={i % 2 === 1}
            tone={section.tone}
          />
        </section>
      ))}

      <FreeForClientsSection />

      <FinalCTA
        heading={
          <>
            Ready to impress your{" "}
            <span className="text-primary">clients?</span>
          </>
        }
        body="Start your 14-day free trial. No credit card required."
        subtle=""
        secondaryCta={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}

function ClientsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-7xl px-6 pb-32 pt-24 text-center sm:px-10 sm:pb-44 sm:pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          For your clients
        </p>
        <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">
          A professional experience your clients will actually{" "}
          <span className="text-primary">trust.</span>
        </h1>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
          When you send a proposal through Velo, your client gets a clean,
          branded experience. No login walls, no confusion, no chasing for
          signatures. Just a link, a decision, and a project that starts
          itself.
        </p>
        <div className="mt-12 flex items-center justify-center">
          <Link
            href="/sign-up"
            className={cn(
              "group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white transition-colors hover:bg-primary/90",
              focusRing,
            )}
          >
            Start free trial
            <ArrowRight
              aria-hidden
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Section 5: free-for-clients. Centered, no mock. The dark background pairs
// with the dark Section 4 above and the dark FinalCTA below to form one
// closing block, with a hairline rule separating the two text-only sections.
function FreeForClientsSection() {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/[0.06] bg-[#0d0d0f]">
      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center sm:px-10 sm:py-36">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Free for your clients
        </p>
        <h2 className="mx-auto mt-8 max-w-3xl text-balance text-5xl font-extrabold leading-[1] tracking-[-0.03em] text-white sm:text-6xl md:text-7xl">
          Client accounts are always{" "}
          <span className="text-primary">free.</span>
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
          Your clients never pay for Velo. Their account is free, their portal
          is free, and there&apos;s no upsell waiting for them. You pay for the
          tool. They just get the experience.
        </p>
        <ul className="mx-auto mt-12 grid max-w-xl grid-cols-1 gap-5 text-sm text-white/60 sm:grid-cols-3 sm:gap-8">
          {[
            { icon: Check, label: "Free forever" },
            { icon: Shield, label: "No credit card" },
            { icon: X, label: "Cancel anytime" },
          ].map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center justify-center gap-2.5"
            >
              <Icon
                aria-hidden
                className="h-4 w-4 shrink-0 text-primary"
                strokeWidth={2.25}
              />
              <span>{label}</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-10 max-w-xl text-sm text-white/60">
          Velo is billed to the agency or freelancer. Clients sign up for free
          and only ever see their own proposals and projects.
        </p>
      </div>
    </section>
  );
}
