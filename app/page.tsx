"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  type Transition,
  type Variants,
} from "framer-motion";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  FileDown,
  FileText,
  FolderKanban,
  Package,
  Receipt,
  Send,
  Share2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, focusRing } from "@/lib/utils";

// Public marketing page is always rendered in light mode regardless of the
// app-wide theme toggle. Re-declaring the token CSS variables on this wrapper
// wins over any `.dark` class higher up the tree without touching the rest of
// the app's theme behaviour.
const lightTheme = {
  "--background": "0 0% 97%",
  "--foreground": "0 0% 7%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 7%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "0 0% 7%",
  "--primary": "221 83% 53%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "0 0% 100%",
  "--secondary-foreground": "0 0% 7%",
  "--muted": "0 0% 97%",
  "--muted-foreground": "0 0% 40%",
  "--accent": "0 0% 94%",
  "--accent-foreground": "0 0% 7%",
  "--border": "0 0% 90%",
  "--input": "0 0% 90%",
  "--ring": "221 83% 53%",
  colorScheme: "light",
} as React.CSSProperties;

// Single shared easing for the whole page so motion feels coherent.
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function MarketingHomePage() {
  return (
    <div
      style={lightTheme}
      className="min-h-screen bg-background text-foreground"
    >
      <ScrollProgressBar />
      <BetaBanner />
      <MarketingNav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden
        className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.18)]"
      />
      <span className="text-sm font-semibold tracking-tight text-foreground">
        Velo
      </span>
    </span>
  );
}

function MarketingNav() {
  const prefersReduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nav fades in just after the hero starts. With reduced motion we skip the
  // entrance entirely so the bar is present on first paint.
  const initial = prefersReduced ? false : { opacity: 0, y: -8 };
  const animate = { opacity: 1, y: 0 };
  const transition: Transition = prefersReduced
    ? { duration: 0 }
    : { duration: 0.5, delay: 0.1, ease: EASE_OUT };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-background/80 backdrop-blur transition-colors",
        scrolled ? "border-b border-border" : "border-b border-transparent",
      )}
    >
      <motion.div
        initial={initial}
        animate={animate}
        transition={transition}
        className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6"
      >
        <Link
          href="/"
          aria-label="Velo home"
          className={cn("rounded-sm", focusRing)}
        >
          <Wordmark />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="#pricing"
            className={cn(
              "hidden rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex",
              focusRing,
            )}
          >
            Pricing
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              focusRing,
            )}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90",
              focusRing,
            )}
          >
            Start free trial
          </Link>
        </nav>
      </motion.div>
    </header>
  );
}

function Hero() {
  const prefersReduced = useReducedMotion();

  // Build the per-step motion props once. Reduced-motion users get the final
  // state on first paint with no transition.
  const fadeUp = (delay: number) =>
    prefersReduced
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE_OUT },
        };

  const underline = prefersReduced
    ? {
        initial: false as const,
        animate: { scaleX: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { scaleX: 0 },
        animate: { scaleX: 1 },
        transition: { duration: 0.7, delay: 0.65, ease: EASE_OUT },
      };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <HeroBackground />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-32 text-center sm:pb-24 sm:pt-40">
        <motion.div
          {...fadeUp(0)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.18)]"
          />
          Built in Brisbane · free 14-day trial
        </motion.div>

        <h1 className="text-balance text-6xl font-semibold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
          <motion.span className="inline-block" {...fadeUp(0)}>
            Client work,
          </motion.span>{" "}
          <span className="relative inline-block">
            <motion.span className="inline-block" {...fadeUp(0.2)}>
              handled.
            </motion.span>
            <motion.span
              aria-hidden
              className="absolute -bottom-[10px] left-0 right-0 h-1 origin-left bg-primary sm:-bottom-[14px] sm:h-[6px]"
              {...underline}
            />
          </span>
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
          {...fadeUp(0.85)}
        >
          Send proposals, get approvals, track projects, and invoice clients —
          all in one place. Built for freelance developers and dev agencies.
        </motion.p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div className="w-full sm:w-auto" {...fadeUp(1.05)}>
            <Link
              href="/sign-up"
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto",
                focusRing,
              )}
            >
              Start free trial
            </Link>
          </motion.div>
          <motion.div className="w-full sm:w-auto" {...fadeUp(1.2)}>
            <Link
              href="#how-it-works"
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto",
                focusRing,
              )}
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        <motion.div
          aria-hidden
          className="mt-14 hidden md:block"
          {...fadeUp(1.45)}
        >
          <BrowserMockFloat prefersReduced={prefersReduced} />
        </motion.div>
      </div>
    </section>
  );
}

// Sits above the nav (not sticky) so it shows on landing and scrolls away as
// the user moves into the page. The sticky nav and fixed scroll-progress bar
// take over from there.
function BetaBanner() {
  return (
    <div className="border-b border-border bg-primary/[0.06]">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 py-2 text-xs text-foreground">
        <span
          aria-hidden
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
        />
        <span className="text-center">
          <span className="font-semibold">Velo is in early beta</span>
          <span className="text-muted-foreground"> — expect rough edges. </span>
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className={cn(
              "rounded-sm font-medium text-primary underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Tell us what breaks
          </a>
        </span>
      </div>
    </div>
  );
}

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-primary"
    />
  );
}

function HeroBackground() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "radial-gradient(60% 55% at 50% 35%, #eff6ff 0%, transparent 70%)",
      }}
      animate={prefersReduced ? undefined : { opacity: [0.55, 1, 0.55] }}
      transition={
        prefersReduced
          ? undefined
          : { duration: 10, repeat: Infinity, ease: "easeInOut" }
      }
    />
  );
}

// Browser-window mock that sits below the hero CTAs. The float animation lives
// on a nested motion.div so it doesn't conflict with the entrance fade-up the
// parent applies.
function BrowserMockFloat({
  prefersReduced,
}: {
  prefersReduced: boolean | null;
}) {
  return (
    <motion.div
      animate={prefersReduced ? undefined : { y: [0, -8, 0] }}
      transition={
        prefersReduced
          ? undefined
          : { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }
      className="mx-auto max-w-2xl"
    >
      <BrowserMock />
    </motion.div>
  );
}

function BrowserMock() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b border-border bg-foreground/[0.03] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex flex-1 items-center justify-center rounded-md bg-background px-3 py-1 text-xs text-muted-foreground">
          velo.app/p/acme-redesign
        </div>
      </div>

      {/* Proposal */}
      <div className="p-8 text-left">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">
              Website Redesign — Acme Studio
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sarah Chen · sarah@acmestudio.com
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 aria-hidden className="h-3 w-3" />
            Approved
          </span>
        </div>

        <div className="mt-6 space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">Discovery &amp; wireframes</span>
            <span className="font-medium text-foreground">A$2,400</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              Visual design &amp; implementation
            </span>
            <span className="font-medium text-foreground">A$4,800</span>
          </div>
        </div>

        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>A$7,200</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>GST (10%)</span>
            <span>A$720</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-base font-semibold text-foreground">
            <span>Total</span>
            <span>A$7,920</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    icon: Send,
    title: "Send a proposal",
    description:
      "Create a professional proposal and send it to your client with one click. They get an email with a review link.",
  },
  {
    number: "02",
    icon: CheckCircle2,
    title: "Client approves",
    description:
      "Your client reviews and approves the proposal online. No login required, no friction.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Everything is created",
    description:
      "A project, milestones and deposit invoice are created automatically the moment they approve.",
  },
];

// Builds container + child variants for a stagger-on-scroll group. When the
// user prefers reduced motion both variants resolve to the final state with
// zero duration, so content is visible immediately on first paint.
function staggerVariants(
  prefersReduced: boolean | null,
  stagger: number,
  yOffset = 20,
  extraChild: Record<string, number> = {},
): { container: Variants; item: Variants } {
  if (prefersReduced) {
    const finalItem = { opacity: 1, y: 0, ...extraChild };
    return {
      container: { hidden: {}, visible: {} },
      item: { hidden: finalItem, visible: finalItem },
    };
  }
  return {
    container: {
      hidden: {},
      visible: { transition: { staggerChildren: stagger } },
    },
    item: {
      hidden: {
        opacity: 0,
        y: yOffset,
        ...Object.fromEntries(
          Object.entries(extraChild).map(([k, v]) => [
            k,
            k === "scale" ? 0.95 : v,
          ]),
        ),
      },
      visible: {
        opacity: 1,
        y: 0,
        ...extraChild,
        transition: { duration: 0.5, ease: EASE_OUT },
      },
    },
  };
}

function HowItWorks() {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.15);

  return (
    <section
      id="how-it-works"
      className="border-b border-border bg-foreground/[0.03]"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-6xl px-6 py-24 sm:py-28"
      >
        <motion.h2
          variants={item}
          className="mx-auto max-w-2xl text-balance text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          From proposal to paid, automatically
        </motion.h2>

        <div className="mt-16 grid gap-12 sm:gap-10 md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <motion.div
              key={number}
              variants={item}
              className="flex flex-col"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
                  {number}
                </span>
                <span className="h-[2px] flex-1 rounded-full bg-foreground/15" />
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: FileText,
    title: "Proposals",
    description:
      "Professional proposals with line items, GST, and deposit calculation.",
  },
  {
    icon: Share2,
    title: "Client portal",
    description:
      "Clients track progress via a shareable link. No account needed.",
  },
  {
    icon: FolderKanban,
    title: "Project tracking",
    description: "Milestone-based tracking with time logging built in.",
  },
  {
    icon: Receipt,
    title: "Invoicing",
    description: "Deposit and final invoices generated automatically.",
  },
  {
    icon: FileDown,
    title: "PDF export",
    description: "Download professional PDFs for proposals and invoices.",
  },
  {
    icon: Package,
    title: "Deliverables",
    description: "Share proof of work links with clients per milestone.",
  },
];

function Features() {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.1, 20, {
    scale: 1,
  });
  const hover = prefersReduced ? undefined : { scale: 1.02 };

  return (
    <section className="border-b border-border bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-6xl px-6 py-24 sm:py-28"
      >
        <motion.h2
          variants={item}
          className="mx-auto max-w-2xl text-balance text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Everything you need to run client work
        </motion.h2>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={hover}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <Card className="h-full transition-colors hover:border-foreground/20">
                <CardHeader>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <CardTitle className="pt-3 text-base">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

type Plan = {
  name: string;
  monthlyPrice: number;
  seats: string;
  features: string[];
  highlighted?: boolean;
  tagline?: string;
};

const plans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 9,
    seats: "1 user",
    features: [
      "Unlimited projects and proposals",
      "Client portal",
      "GST support",
      "PDF export",
    ],
  },
  {
    name: "Studio",
    monthlyPrice: 24,
    seats: "Up to 5 users",
    features: [
      "Everything in Starter",
      "Client portal branding",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    name: "Agency",
    monthlyPrice: 49,
    seats: "Up to 15 users",
    features: [
      "Everything in Studio",
      "Advanced project tracking",
      "Team workload views",
    ],
  },
  {
    name: "Scale",
    monthlyPrice: 99,
    seats: "Unlimited users",
    tagline: "Best value for large teams",
    features: [
      "Everything in Agency",
      "White-label client portal",
      "Dedicated support",
    ],
  },
];

type BillingPeriod = "monthly" | "annual";

function BillingToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-sm px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
        focusRing,
      )}
    >
      {children}
    </button>
  );
}

function Pricing() {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.1);
  const hover = prefersReduced ? undefined : { scale: 1.02 };
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  // Continuous outward glow for the highlighted Studio card. Lives on a
  // separate absolutely-positioned layer so it doesn't fight the entrance
  // animation on the card wrapper.
  const pulse = prefersReduced
    ? undefined
    : {
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0.35)",
          "0 0 0 12px hsl(var(--primary) / 0)",
          "0 0 0 0 hsl(var(--primary) / 0)",
        ],
      };
  const pulseTransition: Transition | undefined = prefersReduced
    ? undefined
    : {
        duration: 2.4,
        repeat: Infinity,
        ease: "easeOut",
        repeatDelay: 0.2,
      };

  return (
    <section
      id="pricing"
      className="border-b border-border bg-foreground/[0.03]"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-6xl px-6 py-24 sm:py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            variants={item}
            className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            variants={item}
            className="mt-4 text-base text-muted-foreground"
          >
            14-day free trial, no credit card required.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex justify-center">
            <div
              role="radiogroup"
              aria-label="Billing period"
              className="inline-flex rounded-md border border-border bg-card p-1"
            >
              <BillingToggleButton
                active={billing === "monthly"}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </BillingToggleButton>
              <BillingToggleButton
                active={billing === "annual"}
                onClick={() => setBilling("annual")}
              >
                Annual
                <span
                  className={cn(
                    "ml-2 rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                    billing === "annual"
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  Save 2 months
                </span>
              </BillingToggleButton>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={item}
              whileHover={hover}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="relative h-full"
            >
              <Card
                className={cn(
                  "relative flex h-full flex-col",
                  plan.highlighted &&
                    "border-primary shadow-md ring-1 ring-primary",
                )}
              >
                {plan.highlighted ? (
                  <>
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      animate={pulse}
                      transition={pulseTransition}
                    />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary-foreground">
                      Most popular
                    </span>
                  </>
                ) : null}

                <CardHeader>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-3xl font-semibold tracking-tight text-foreground">
                      AU$
                      {billing === "annual"
                        ? plan.monthlyPrice * 10
                        : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {billing === "annual" ? "/year" : "/mo"}
                    </span>
                  </div>
                  <CardDescription>{plan.seats}</CardDescription>
                  {plan.tagline ? (
                    <span className="mt-2 inline-flex w-fit rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {plan.tagline}
                    </span>
                  ) : null}
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <Link
                      href="/sign-up"
                      className={cn(
                        "inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
                        plan.highlighted
                          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                          : "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
                        focusRing,
                      )}
                    >
                      Start free trial
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

type Faq = { q: string; a: string };

const faqs: Faq[] = [
  {
    q: "What happens after the 14-day trial?",
    a: "Pick a plan to keep going. We won't auto-charge you, and your data stays put if you decide to come back later.",
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
    q: "Do my clients need an account to view proposals?",
    a: "No. Every proposal and project gets a shareable link. Clients click, review, and approve without signing up.",
  },
  {
    q: "How do I get paid?",
    a: "Invoices are PDFs with your bank details — clients pay you directly. Native payments aren't part of v1.",
  },
  {
    q: "Is my data secure?",
    a: "Your data lives in your own workspace behind authentication. Public share links use unguessable tokens and are rate-limited.",
  },
];

function FAQ() {
  const prefersReduced = useReducedMotion();
  const { container, item } = staggerVariants(prefersReduced, 0.08);

  return (
    <section className="border-b border-border bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="mx-auto max-w-3xl px-6 py-24 sm:py-28"
      >
        <motion.h2
          variants={item}
          className="text-balance text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Frequently asked questions
        </motion.h2>

        <div className="mt-12 border-t border-border">
          {faqs.map((faq) => (
            <motion.div key={faq.q} variants={item}>
              <details className="group border-b border-border py-5">
                <summary
                  className={cn(
                    "flex cursor-pointer list-none items-center justify-between gap-4 rounded-sm text-left text-base font-medium text-foreground [&::-webkit-details-marker]:hidden",
                    focusRing,
                  )}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FinalCTA() {
  const prefersReduced = useReducedMotion();

  const fadeUp = prefersReduced
    ? {
        initial: false as const,
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EASE_OUT },
      };

  return (
    <section className="border-b border-border bg-foreground/[0.03]">
      <div className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
        <motion.div
          {...fadeUp}
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm sm:p-16"
        >
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Ready to send your first proposal?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            14-day free trial. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto",
                focusRing,
              )}
            >
              Start free trial
            </Link>
            <Link
              href="#pricing"
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto",
                focusRing,
              )}
            >
              See pricing
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <Wordmark />

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link
            href="/privacy"
            className={cn("rounded-sm hover:text-foreground", focusRing)}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className={cn("rounded-sm hover:text-foreground", focusRing)}
          >
            Terms of Service
          </Link>
          <span>&copy; 2026 Velo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
