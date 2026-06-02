import {
  CheckCircle2,
  FileDown,
  FileText,
  FolderKanban,
  GitPullRequest,
  LayoutDashboard,
  Package,
  Receipt,
  Send,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    number: "01",
    icon: Send,
    title: "Send",
    description:
      "Create a proposal with scope, line items, deposit percentage, and GST in one place. Send your client a secure link. No account needed to view it.",
  },
  {
    number: "02",
    icon: CheckCircle2,
    title: "Approve",
    description:
      "Your client reviews the proposal in a clean portal and approves with a timestamped record. Consistent with Australia's Electronic Transactions Act 1999.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Live",
    description:
      "Velo creates the project, milestones, client portal, and deposit invoice the moment your client approves. Nothing to set up manually.",
  },
];

export type FeatureMockupKind =
  | "proposals"
  | "portal"
  | "tracking"
  | "invoicing"
  | "pdf"
  | "deliverables"
  | "changes"
  | "dashboard";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  mockup: FeatureMockupKind;
};

// Full feature list — surfaced on /features.
export const allFeatures: Feature[] = [
  {
    icon: FileText,
    title: "Proposals",
    description:
      "Professional proposals with line items, GST, and deposit calculation. No more back-and-forth over email — clients get a clean link, you get a clear decision.",
    mockup: "proposals",
  },
  {
    icon: Share2,
    title: "Client portal",
    description:
      "Clients track progress through their own secure Velo account. No paid subscription required, client accounts are always free. Your clients always know where things stand without having to ask.",
    mockup: "portal",
  },
  {
    icon: FolderKanban,
    title: "Project tracking",
    description:
      "Milestone-based tracking with time logging built in. Stop guessing where projects stand: every milestone, logged and visible.",
    mockup: "tracking",
  },
  {
    icon: Receipt,
    title: "Invoicing",
    description:
      "Deposit and final invoices generated automatically. Get paid faster when the invoice is already waiting the moment the project wraps.",
    mockup: "invoicing",
  },
  {
    icon: FileDown,
    title: "PDF export",
    description:
      "Download professional PDFs for proposals and invoices. Send something that looks professional even before you've built a brand.",
    mockup: "pdf",
  },
  {
    icon: Package,
    title: "Deliverables",
    description:
      "Share proof of work links with clients per milestone. Close projects cleanly with proof of everything that shipped.",
    mockup: "deliverables",
  },
  {
    icon: GitPullRequest,
    title: "Change requests",
    description:
      "Clients submit scope changes through their portal. You approve, decline, or quote the work without leaving Velo. Scope creep doesn't disappear, Velo just makes it easier to handle.",
    mockup: "changes",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "One view of every proposal, project, and invoice. Live status, recent activity, and the numbers that matter. One tab instead of five, everything you need to run your week.",
    mockup: "dashboard",
  },
];

// Subset shown on the homepage. Three only — the rest live on /features.
export const homeHighlights: Feature[] = [
  allFeatures[0],
  allFeatures[1],
  allFeatures[3],
];

export const trustItems = [
  "Built for Australian freelancers",
  "GST ready",
  "AUD invoicing",
  "Encrypted and secure",
];

export type PlanFeature = { label: string; comingSoon?: boolean };

export type Plan = {
  name: string;
  description: string;
  monthlyPrice: number;
  priceFrom?: boolean;
  seats: string;
  features: PlanFeature[];
  highlighted?: boolean;
  tagline?: string;
  cta: { label: string; href: string };
};

export const plans: Plan[] = [
  {
    name: "Starter",
    description: "For solo freelancers getting started",
    monthlyPrice: 9,
    seats: "1 user",
    features: [
      { label: "Unlimited projects and proposals" },
      { label: "Client portal" },
      { label: "GST support" },
      { label: "PDF export" },
      { label: "Stripe payments on invoices" },
    ],
    cta: { label: "Join the waitlist", href: "/waitlist" },
  },
  {
    name: "Studio",
    description: "For active freelancers with multiple clients",
    monthlyPrice: 24,
    seats: "Up to 5 users",
    features: [
      { label: "Everything in Starter" },
      { label: "Priority support" },
      { label: "Lead pipeline", comingSoon: true },
    ],
    highlighted: true,
    cta: { label: "Join the waitlist", href: "/waitlist" },
  },
  {
    name: "Agency",
    description: "For small teams managing client work",
    monthlyPrice: 49,
    seats: "Up to 15 users",
    features: [
      { label: "Everything in Studio" },
      { label: "Multi-user workspaces", comingSoon: true },
    ],
    cta: { label: "Join the waitlist", href: "/waitlist" },
  },
  {
    name: "Scale",
    description: "For growing agencies with unlimited users",
    monthlyPrice: 99,
    priceFrom: true,
    seats: "Unlimited users",
    tagline: "Custom pricing available",
    features: [
      { label: "Everything in Agency" },
      { label: "Dedicated support" },
      { label: "White-label client portal", comingSoon: true },
    ],
    cta: { label: "Join the waitlist", href: "/waitlist" },
  },
];

export type TrialFeature = { label: string; note?: string };

export const trialFeatures: TrialFeature[] = [
  {
    label: "Up to 2 active projects",
    note: "Completed projects don't count toward the limit. All your data is kept if you upgrade or cancel.",
  },
  { label: "Proposals and client approvals" },
  { label: "Project tracking and milestones" },
  { label: "Deposit and final invoices" },
  { label: "PDF export" },
  { label: "Client portal" },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "What happens after the 14-day trial?",
    a: "Pick a plan to keep going. I won't auto-charge you, and your data stays put if you decide to come back later.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. Sign up with your email, build your first proposal, and send it. Card details only come up when you choose a plan.",
  },
  {
    q: "Does Velo handle GST?",
    a: "Yes. Proposals and invoices calculate GST and deposit splits based on your AU business profile.",
  },
  {
    q: "How do I get paid?",
    a: "Clients pay invoices by card through Stripe, directly on the share link. If they'd rather not pay by card, your invoice PDF still includes your bank details for a manual transfer.",
  },
  {
    q: "Is my data secure?",
    a: "Your data lives in your own workspace behind authentication. Public share links use unguessable tokens and are rate-limited.",
  },
  {
    q: "Do my clients need an account?",
    a: "Yes, and it's always free. Clients create a free Velo account to view and approve proposals, which gives you a verified identity trail on every approval. Client accounts never require a paid plan.",
  },
  {
    q: "Is Velo secure? It handles contracts and invoices.",
    a: "Velo never stores card or bank details. Payments are processed through Stripe. All data is encrypted in transit and at rest. Client approvals are recorded with a timestamp and verified email address, consistent with Australia's Electronic Transactions Act 1999. For high-value engagements I recommend following up with a formal signed contract.",
  },
  {
    q: "Who owns my client data?",
    a: "You do. All proposals, invoices, and project data you enter into Velo belongs to you. I don't use it for any purpose other than running the platform. If you delete your account, all your data is permanently removed within 30 days.",
  },
];

export type RoughGroup = {
  label: string;
  items: { title: string; detail: string }[];
};

export const stillRoughGroups: RoughGroup[] = [
  {
    label: "Platform",
    items: [
      {
        title: "Email sometimes lands in spam",
        detail:
          "Sending from Resend's shared sender while I verify a custom domain.",
      },
      {
        title: "No public API or webhooks",
        detail:
          "You can't integrate Velo with your own tooling yet. A public API is on the roadmap.",
      },
      {
        title: "No analytics or reporting yet",
        detail:
          "Project and invoice views show current state but not trends. Revenue, profitability, and time-cost reports come later.",
      },
      {
        title: "Mobile works but is desktop-first",
        detail:
          "Functional on phones; designed for desktop first. Dedicated PWA polish is coming.",
      },
    ],
  },
  {
    label: "Team & CRM",
    items: [
      {
        title: "Clients are a contact list, not a CRM",
        detail:
          "Name, email, and phone today. Notes, tags, lead stages, last-contact tracking, and a communications log are the next thing I build.",
      },
      {
        title: "No team roles or permissions yet",
        detail:
          "Studio and Agency plans show seat counts, but owner / admin / member / viewer permissions haven't been built. Multi-user lands together with the access model.",
      },
      {
        title: "No e-signature on proposals",
        detail:
          "Client approval is a button click on the share link. Signed PDFs with timestamps come later.",
      },
      {
        title: "No file attachments",
        detail:
          "Milestones support deliverable links, but you can't upload contracts, receipts, or asset files to projects or invoices yet.",
      },
    ],
  },
  {
    label: "Money & billing",
    items: [
      {
        title: "AUD and GST only",
        detail:
          "Pricing, invoices, and tax handling assume Australian businesses. Multi-currency and non-AU tax regimes are a separate build.",
      },
      {
        title: "No accounting software exports yet",
        detail:
          "GST is calculated, but you'll need to copy numbers into Xero, MYOB, or QBO by hand. Native exports are planned.",
      },
      {
        title: "No recurring invoices or retainers",
        detail:
          "Every invoice is one-off. Monthly retainers and subscription billing are on the roadmap.",
      },
      {
        title: "No automated payment reminders",
        detail:
          "Invoices don't chase themselves. You'll nudge late-paying clients by hand until reminder workflows ship.",
      },
      {
        title: "No expense tracking",
        detail:
          "You can invoice clients but can't log business expenses, mileage, or reimbursables against a project.",
      },
    ],
  },
  {
    label: "Heads up",
    items: [
      {
        title: "The product name might change",
        detail:
          "\"Velo\" is a working name. The final name lands before public beta. Don't get attached.",
      },
    ],
  },
];

export const whatsNextItems: { title: string; detail: string }[] = [
  {
    title: "Custom sending domain for email",
    detail:
      "Verifying my own domain so proposals stop landing in client spam folders.",
  },
  {
    title: "CRM upgrade for clients",
    detail:
      "Notes, tags, lead stages, and a communications log. The most-asked-for change in early feedback.",
  },
  {
    title: "Team workspaces and roles",
    detail:
      "Multi-user accounts on Studio and Agency plans, with owner / admin / member / viewer permissions.",
  },
  {
    title: "Recurring invoices and retainers",
    detail:
      "Monthly billing for ongoing work, not just one-off project invoices.",
  },
  {
    title: "File attachments on projects and invoices",
    detail:
      "Upload contracts, receipts, and asset files instead of stuffing everything into deliverable links.",
  },
  {
    title: "Accounting software exports",
    detail:
      "Native exports to Xero, MYOB, and QBO so end-of-quarter isn't a copy-paste job.",
  },
  {
    title: "Public API and webhooks",
    detail:
      "For wiring Velo into your own tooling once the core flow is stable.",
  },
  {
    title: "Analytics and reporting",
    detail:
      "Revenue, profitability, and time-cost views once there's enough data per account to be meaningful.",
  },
  {
    title: "Multi-currency and non-AU tax",
    detail:
      "Pricing and tax handling beyond AUD/GST. Comes after the Australian core is solid.",
  },
];

export type TeamMember = {
  handle: string;
  role: string;
  url: string;
};

export const team: TeamMember[] = [
  {
    handle: "jaineeldev",
    role: "Founder, product and engineering",
    url: "https://github.com/jaineeldev",
  },
  {
    handle: "JuiceM00n",
    role: "Contributor",
    url: "https://github.com/JuiceM00n",
  },
  {
    handle: "Rockmancheese",
    role: "Contributor",
    url: "https://github.com/Rockmancheese",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "For clients", href: "/clients" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
];
