import {
  ArrowRight,
  Check,
  Circle,
  Download,
  FileArchive,
  FileCode2,
  FileImage,
  FileText,
  GitPullRequest,
  Link2,
  type LucideIcon,
} from "lucide-react";
import type { FeatureMockupKind } from "../_lib/data";

// Shared fixture used by every mockup so the story stays consistent:
// Tom Barrett at Ironbark Digital, working on the Northstar Website
// Redesign, A$8,400 inclusive of GST.
const FIXTURE = {
  projectName: "Northstar Website Redesign",
  clientName: "Tom Barrett",
  clientCompany: "Ironbark Digital",
  clientEmail: "tom@ironbark.digital",
  total: "A$8,400",
  subtotal: "A$7,636",
  gst: "A$764",
  deposit: "A$2,520",
  final: "A$5,880",
  proposalId: "PRP-014",
  invoiceId: "INV-001",
};

function MockFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#111]">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-black tracking-tight text-white">
            Velo
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            {label}
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#2A2A2A]" />
          <span className="h-2 w-2 rounded-full bg-[#2A2A2A]" />
          <span className="h-2 w-2 rounded-full bg-[#2A2A2A]" />
        </div>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function ProposalsMockup() {
  const lines = [
    { name: "Discovery & wireframes", amount: "A$1,800" },
    { name: "Frontend build", amount: "A$4,200" },
    { name: "Launch & QA", amount: "A$1,636" },
  ];
  return (
    <MockFrame label={`Proposal · ${FIXTURE.proposalId}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Draft
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            {FIXTURE.projectName}
          </h4>
          <p className="mt-0.5 font-mono text-xs text-[#A0A0A0]">
            For {FIXTURE.clientName} · {FIXTURE.clientCompany}
          </p>
        </div>
        <span className="rounded-md bg-[#2A2A2A] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#A0A0A0]">
          Draft
        </span>
      </div>

      <ul className="mt-5 space-y-2.5">
        {lines.map((line) => (
          <li
            key={line.name}
            className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5 last:border-b-0 last:pb-0"
          >
            <span className="text-sm text-white">{line.name}</span>
            <span className="font-mono text-sm text-[#A0A0A0]">
              {line.amount}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-1.5 border-t border-[#2A2A2A] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#A0A0A0]">Subtotal</span>
          <span className="font-mono text-white">{FIXTURE.subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#A0A0A0]">GST (10%)</span>
          <span className="font-mono text-white">{FIXTURE.gst}</span>
        </div>
        <div className="flex items-baseline justify-between pt-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Total inc. GST
          </span>
          <span className="font-mono text-xl font-bold text-white">
            {FIXTURE.total}
          </span>
        </div>
      </div>

      <button
        type="button"
        aria-hidden
        className="mt-5 inline-flex w-full cursor-default items-center justify-center gap-2 rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-bold text-white"
      >
        Send to client
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
    </MockFrame>
  );
}

function ClientPortalMockup() {
  return (
    <MockFrame label="Client portal">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Project
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            {FIXTURE.projectName}
          </h4>
          <p className="mt-0.5 font-mono text-xs text-[#A0A0A0]">
            Shared with {FIXTURE.clientName}
          </p>
        </div>
        <span className="rounded-md border border-blue-800 bg-blue-950 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-blue-400">
          In progress
        </span>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Milestones
          </span>
          <span className="font-mono text-xs text-[#A0A0A0]">
            3 / 5 complete
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
          <div
            className="h-full rounded-full bg-[#4F7EF7]"
            style={{ width: "60%" }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: "Deposit", value: FIXTURE.deposit, state: "paid" },
          { label: "Final", value: FIXTURE.final, state: "scheduled" },
          { label: "Total", value: FIXTURE.total, state: "muted" },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#555]">
              {row.label}
            </p>
            <p
              className={`mt-1 font-mono text-sm font-bold ${
                row.state === "paid"
                  ? "text-[#22C55E]"
                  : row.state === "muted"
                    ? "text-white"
                    : "text-[#A0A0A0]"
              }`}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function ProjectTrackingMockup() {
  const milestones: {
    name: string;
    state: "done" | "active" | "pending";
    meta: string;
  }[] = [
    { name: "Discovery", state: "done", meta: "Delivered 18 May" },
    { name: "Design", state: "done", meta: "Delivered 31 May" },
    { name: "Development", state: "active", meta: "6 of 14 days" },
    { name: "Launch", state: "pending", meta: "Awaiting build" },
  ];
  return (
    <MockFrame label="Project tracking">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Milestones
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            {FIXTURE.projectName}
          </h4>
        </div>
        <span className="font-mono text-xs text-[#A0A0A0]">
          {FIXTURE.clientCompany}
        </span>
      </div>
      <ul className="mt-5 space-y-2">
        {milestones.map((m) => (
          <li
            key={m.name}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              m.state === "active"
                ? "border-blue-800 bg-blue-950/40"
                : "border-[#2A2A2A] bg-[#1A1A1A]"
            }`}
          >
            <MilestoneDot state={m.state} />
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  m.state === "pending" ? "text-[#A0A0A0]" : "text-white"
                }`}
              >
                {m.name}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[#555]">
                {m.meta}
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                m.state === "done"
                  ? "bg-green-950 text-green-400"
                  : m.state === "active"
                    ? "border border-blue-800 bg-blue-950 text-blue-400"
                    : "bg-[#2A2A2A] text-[#A0A0A0]"
              }`}
            >
              {m.state === "done"
                ? "Done"
                : m.state === "active"
                  ? "Active"
                  : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

function MilestoneDot({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-green-800 bg-green-950 text-[#22C55E]">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-700 bg-blue-950 text-blue-400">
        <ArrowRight className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#0A0A0A] text-[#555]">
      <Circle className="h-2.5 w-2.5" strokeWidth={2} />
    </span>
  );
}

function InvoicingMockup() {
  return (
    <MockFrame label={`Invoice · ${FIXTURE.invoiceId}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Deposit invoice
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            {FIXTURE.projectName}
          </h4>
          <p className="mt-0.5 font-mono text-xs text-[#A0A0A0]">
            Billed to {FIXTURE.clientCompany}
          </p>
        </div>
        <span className="rounded-md border border-amber-900 bg-amber-950 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-amber-400">
          Awaiting
        </span>
      </div>

      <div className="mt-6 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-5 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
          Amount due
        </p>
        <p className="mt-2 font-mono text-4xl font-black text-white">
          {FIXTURE.deposit}
        </p>
        <p className="mt-2 font-mono text-xs text-[#A0A0A0]">
          30% deposit · due on receipt
        </p>
      </div>

      <button
        type="button"
        aria-hidden
        className="mt-5 inline-flex w-full cursor-default items-center justify-center gap-2 rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-bold text-white"
      >
        Pay now
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#555]">
        Secured by
        <StripeWordmark />
      </p>
    </MockFrame>
  );
}

function StripeWordmark() {
  return (
    <span
      aria-hidden
      className="inline-flex items-baseline rounded bg-[#635BFF] px-1.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-white"
    >
      stripe
    </span>
  );
}

function PdfExportMockup() {
  return (
    <MockFrame label="PDF preview">
      <div className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] p-5">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-3">
          <span className="font-display text-base font-black tracking-tight text-white">
            Velo
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            {FIXTURE.proposalId} · PDF
          </span>
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-bold text-white">{FIXTURE.projectName}</p>
          <p className="font-mono text-[10px] text-[#A0A0A0]">
            Prepared for {FIXTURE.clientName} · {FIXTURE.clientCompany}
          </p>
        </div>
        <div className="mt-4 space-y-1.5">
          <span className="block h-1.5 w-full rounded bg-[#1A1A1A]" />
          <span className="block h-1.5 w-11/12 rounded bg-[#1A1A1A]" />
          <span className="block h-1.5 w-3/4 rounded bg-[#1A1A1A]" />
          <span className="block h-1.5 w-5/6 rounded bg-[#1A1A1A]" />
        </div>
        <div className="mt-4 flex items-baseline justify-between border-t border-[#2A2A2A] pt-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Total inc. GST
          </span>
          <span className="font-mono text-sm font-bold text-white">
            {FIXTURE.total}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText
            aria-hidden
            className="h-4 w-4 text-[#4F7EF7]"
            strokeWidth={2}
          />
          <div>
            <p className="text-sm font-semibold text-white">
              {FIXTURE.proposalId}.pdf
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
              218 KB · 2 pages
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-hidden
          className="inline-flex cursor-default items-center gap-1.5 rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-1.5 text-xs font-bold text-white"
        >
          <Download className="h-3 w-3" strokeWidth={2.5} />
          Download
        </button>
      </div>
    </MockFrame>
  );
}

function DeliverablesMockup() {
  const files: { name: string; meta: string; icon: LucideIcon }[] = [
    { name: "Brand guidelines.pdf", meta: "1.4 MB", icon: FileText },
    { name: "Final designs.fig", meta: "Figma · v12", icon: FileImage },
    { name: "Production build.zip", meta: "8.2 MB", icon: FileArchive },
    { name: "Launch checklist.md", meta: "Markdown", icon: FileCode2 },
  ];
  return (
    <MockFrame label="Deliverables">
      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            Milestone 03 · Development
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            Shared with {FIXTURE.clientName}
          </h4>
        </div>
        <span className="font-mono text-xs text-[#A0A0A0]">4 files</span>
      </div>
      <ul className="mt-5 space-y-2">
        {files.map(({ name, meta, icon: Icon }) => (
          <li
            key={name}
            className="flex items-center justify-between rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#2A2A2A] bg-[#0A0A0A] text-[#4F7EF7]">
                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
                  {meta}
                </p>
              </div>
            </div>
            <Link2
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-[#555]"
              strokeWidth={2}
            />
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

function ChangeRequestsMockup() {
  return (
    <MockFrame label="Change request · CR-003">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            From {FIXTURE.clientName}
          </p>
          <h4 className="mt-1 text-base font-bold text-white">
            Add a careers section to the website
          </h4>
        </div>
        <GitPullRequest
          aria-hidden
          className="h-4 w-4 shrink-0 text-[#F59E0B]"
          strokeWidth={2}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#A0A0A0]">
        New page with job listings template, application form, and a feed
        from Greenhouse. Estimated +3 days.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            New scope
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-white">+A$480</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
            New total
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-white">
            A$8,880
          </p>
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          aria-hidden
          className="flex-1 cursor-default rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-bold text-white"
        >
          Approve
        </button>
        <button
          type="button"
          aria-hidden
          className="flex-1 cursor-default rounded-lg border border-[#2A2A2A] px-4 py-2.5 text-sm font-medium text-[#A0A0A0]"
        >
          Decline
        </button>
      </div>
    </MockFrame>
  );
}

function DashboardMockup() {
  const stats = [
    { label: "Active projects", value: "4", tone: "default" },
    { label: "Pending proposals", value: "2", tone: "default" },
    { label: "Outstanding", value: FIXTURE.final, tone: "amber" },
  ];
  const activity = [
    { who: FIXTURE.clientName, what: "approved the proposal", when: "2h" },
    { who: "You", what: `sent invoice ${FIXTURE.invoiceId}`, when: "2h" },
    { who: FIXTURE.clientName, what: "paid the deposit", when: "1d" },
  ];
  return (
    <MockFrame label="Dashboard">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-widest text-[#555]">
              {s.label}
            </p>
            <p
              className={`mt-2 font-mono text-lg font-black ${
                s.tone === "amber" ? "text-[#F59E0B]" : "text-white"
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#555]">
          Recent activity
        </p>
        <ul className="mt-3 space-y-2">
          {activity.map((row, i) => (
            <li
              key={`${row.who}-${i}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#4F7EF7]" />
                <p className="truncate text-xs text-white">
                  <span className="font-semibold">{row.who}</span>{" "}
                  <span className="text-[#A0A0A0]">{row.what}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-[#555]">
                {row.when}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </MockFrame>
  );
}

export function FeatureMockup({ kind }: { kind: FeatureMockupKind }) {
  switch (kind) {
    case "proposals":
      return <ProposalsMockup />;
    case "portal":
      return <ClientPortalMockup />;
    case "tracking":
      return <ProjectTrackingMockup />;
    case "invoicing":
      return <InvoicingMockup />;
    case "pdf":
      return <PdfExportMockup />;
    case "deliverables":
      return <DeliverablesMockup />;
    case "changes":
      return <ChangeRequestsMockup />;
    case "dashboard":
      return <DashboardMockup />;
    default:
      return null;
  }
}
