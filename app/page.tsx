"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  Globe,
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

// Total preloader lifetime in ms. Beats: dot scales in (0–0.5s), wordmark
// fades in (0.35–0.75s), shimmer sweeps across (0.8–1.3s), underline draws
// (1.1–1.7s), brief hold, then AnimatePresence fades the overlay out as the
// hero cascade rises in.
const PRELOADER_HOLD_MS = 2100;
// sessionStorage key that records the splash has been seen this session. Per
// session, not forever — repeat visits in a new tab still see the brand stamp
// once, but in-session navigations don't replay it.
const PRELOADER_SEEN_KEY = "velo-preloader-seen";

export default function MarketingHomePage() {
  const prefersReduced = useReducedMotion();
  // Start with the splash hidden. We flip it on in the effect once we know
  // whether the user has seen it this session — avoids a flash of splash for
  // returning visitors and matches SSR output (no splash on first paint).
  const [showPreloader, setShowPreloader] = useState(false);
  const [appReady, setAppReady] = useState(true);

  useEffect(() => {
    // Reduced-motion users skip the splash entirely.
    if (prefersReduced) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(PRELOADER_SEEN_KEY) === "1";
    } catch {
      // Private browsing / blocked storage — treat as unseen and show once.
    }
    if (seen) return;
    setShowPreloader(true);
    setAppReady(false);
    try {
      window.sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
    } catch {
      // ignore — splash still plays this paint
    }
    const t = window.setTimeout(() => {
      // Flip both at the same time so the hero cascade rises in as the splash
      // fades out — one continuous handoff rather than sequential beats.
      setAppReady(true);
      setShowPreloader(false);
    }, PRELOADER_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [prefersReduced]);

  return (
    <div
      style={lightTheme}
      className="min-h-screen bg-background text-foreground"
    >
      <StructuredData />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Skip to content
      </a>
      <AnimatePresence>
        {showPreloader ? <Preloader key="preloader" /> : null}
      </AnimatePresence>
      <GeoNotice ready={appReady} />
      <ScrollProgressBar />
      <BetaBanner />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        <Hero ready={appReady} />
        <HowItWorks />
        <Features />
        <StillRough />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

// Schema.org JSON-LD for the homepage. Derived from the same `plans` and
// `faqs` arrays the visible UI uses so the structured data can never drift
// from what the page actually shows.
function StructuredData() {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Velo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Send proposals, get approvals, track projects, and invoice clients — all in one place. Built for freelance developers and dev agencies.",
      url: appUrl,
      offers: plans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: String(plan.monthlyPrice),
        priceCurrency: "AUD",
        category: "subscription",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Brief splash with the wordmark drawing itself in. Sized large so it reads
// as a brand stamp, not a chip: oversized dot with a continuously-pulsing
// halo, "Velo" fades in beside it, a primary-tinted shimmer sweeps across the
// letters, and a blue underline draws beneath — echoing the hero's "handled."
// underline so the entrance previews the page's vocabulary.
function Preloader() {
  return (
    <motion.div
      role="status"
      aria-label="Loading Velo"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
    >
      <div className="flex items-center gap-4">
        <motion.span
          aria-hidden
          className="block h-5 w-5 rounded-full bg-primary"
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0.4)",
              "0 0 0 18px hsl(var(--primary) / 0)",
            ],
          }}
          transition={{
            scale: { duration: 0.5, ease: EASE_OUT },
            boxShadow: {
              duration: 1.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5,
            },
          }}
        />
        <span className="relative inline-block">
          <motion.span
            // bg-clip-text + text-transparent renders the linear-gradient
            // through the glyph shape. Animating backgroundPosition sweeps a
            // bright primary band across the letters once.
            className="block bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl"
            style={{
              backgroundImage:
                "linear-gradient(110deg, hsl(var(--foreground)) 35%, hsl(var(--primary)) 50%, hsl(var(--foreground)) 65%)",
              backgroundSize: "220% 100%",
            }}
            initial={{ opacity: 0, x: -8, backgroundPosition: "100% 0%" }}
            animate={{ opacity: 1, x: 0, backgroundPosition: "-100% 0%" }}
            transition={{
              opacity: { duration: 0.4, delay: 0.35, ease: EASE_OUT },
              x: { duration: 0.4, delay: 0.35, ease: EASE_OUT },
              backgroundPosition: {
                duration: 0.55,
                delay: 0.8,
                ease: "easeInOut",
              },
            }}
          >
            Velo
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute -bottom-1.5 left-0 right-0 h-[3px] origin-left rounded-full bg-primary sm:h-1"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 1.1, ease: EASE_OUT }}
          />
        </span>
      </div>
    </motion.div>
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

// Soft notice for visitors outside Australia. Detection uses the browser's
// IANA timezone — privacy-friendly, no IP lookup, no API call. Anything under
// the `Australia/...` zone (e.g. Australia/Brisbane, Australia/Sydney) is
// treated as in-region. Dismissal persists in localStorage so returning
// visitors don't see it again. Gated behind `ready` so it doesn't fight the
// preloader exit animation.
const GEO_NOTICE_KEY = "velo-geo-notice-dismissed";

function GeoNotice({ ready }: { ready: boolean }) {
  const prefersReduced = useReducedMotion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!ready) return;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
      const inAustralia = tz.startsWith("Australia/");
      const dismissed =
        window.localStorage.getItem(GEO_NOTICE_KEY) === "1";
      if (!inAustralia && !dismissed) {
        setShow(true);
      }
    } catch {
      // Private browsing / blocked storage / missing Intl support — silently
      // skip rather than fail. Better to show no notice than to crash.
    }
  }, [ready]);

  const dismiss = useCallback(() => {
    setShow(false);
    try {
      window.localStorage.setItem(GEO_NOTICE_KEY, "1");
    } catch {
      // ignore — dismissal still works for this session
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, dismiss]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="geo-notice"
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReduced ? { duration: 0 } : { duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Dismiss notice"
            onClick={dismiss}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="geo-notice-title"
            initial={
              prefersReduced ? false : { opacity: 0, y: 12, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.98 }
            }
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.25, ease: EASE_OUT }
            }
            className="relative w-full max-w-md rounded-xl bg-card p-6 shadow-xl sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Globe aria-hidden className="h-4 w-4" />
              </span>
              <h2
                id="geo-notice-title"
                className="text-base font-semibold tracking-tight text-foreground"
              >
                Heads up — Velo only follows Australian privacy law
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Velo&apos;s privacy practices are scoped to Australia. If you
              sign up from outside Australia, your data may not be handled in
              line with your local privacy laws (e.g. GDPR, CCPA). Please read
              our Privacy Policy before continuing.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/privacy"
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent",
                  focusRing,
                )}
              >
                Read Privacy Policy
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                  focusRing,
                )}
              >
                I understand
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Hero({ ready }: { ready: boolean }) {
  const prefersReduced = useReducedMotion();

  // Build the per-step motion props once. Reduced-motion users get the final
  // state on first paint with no transition. Otherwise the cascade is gated
  // behind `ready` so it kicks off as the preloader fades out — until then
  // the elements stay at their initial (hidden) state.
  const fadeUp = (delay: number) =>
    prefersReduced
      ? {
          initial: false as const,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
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
        animate: ready ? { scaleX: 1 } : { scaleX: 0 },
        transition: { duration: 0.5, delay: 0.4, ease: EASE_OUT },
      };

  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <HeroBackground />
      <div className="relative mx-auto max-w-3xl px-6 pb-20 pt-32 text-center sm:pb-24 sm:pt-40">
        <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <motion.span className="block" {...fadeUp(0)}>
            Ship code,
          </motion.span>
          <motion.span className="block" {...fadeUp(0.12)}>
            not{" "}
            <span className="relative inline-block">
              spreadsheets.
              <motion.span
                aria-hidden
                className="absolute -bottom-[8px] left-0 right-0 h-1 origin-left bg-primary sm:-bottom-[12px] sm:h-[6px]"
                {...underline}
              />
            </span>
          </motion.span>
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground"
          {...fadeUp(0.4)}
        >
          Send proposals, get approvals, track projects, and invoice clients —
          all in one place. Built for freelance developers and dev agencies.
        </motion.p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.div className="w-full sm:w-auto" {...fadeUp(0.55)}>
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
          <motion.div className="w-full sm:w-auto" {...fadeUp(0.65)}>
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
          className="mt-10 sm:mt-14"
          {...fadeUp(0.8)}
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
      <div className="p-5 text-left sm:p-8">
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
    title: "Send",
    description:
      "Build a proposal with line items, deposit %, and GST. Email your client a private review link.",
  },
  {
    number: "02",
    icon: CheckCircle2,
    title: "Approve",
    description:
      "They review and approve in the browser. No PDF download, no account, no chasing for sign-off.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Live",
    description:
      "Project, milestones, and deposit invoice — all created the moment they approve.",
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
          Approve once. The setup is done.
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
          What we&apos;ve built so far
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

// Radical-honesty section. Lists what's missing, slow, or broken in the
// current beta with a one-line explanation of the plan for each. Pre-beta
// dev-targeted product — being transparent here builds trust faster than
// pretending everything works.
const stillRoughItems: { title: string; detail: string }[] = [
  {
    title: "Email sometimes lands in spam",
    detail:
      "Sending from Resend's shared sender while we verify a custom domain.",
  },
  {
    title: "Rate limiting resets on restart",
    detail:
      "Counters live in memory today. Upstash Redis is on the way before public beta.",
  },
  {
    title: "No multi-user workspaces yet",
    detail:
      "Each account is single-user. Studio and Agency seat support is coming.",
  },
  {
    title: "Payments are bank-transfer PDFs",
    detail:
      "Invoices include your bank details. Native Stripe payments are on the roadmap.",
  },
  {
    title: "Mobile works but is desktop-first",
    detail:
      "Functional on phones; designed for desktop first. Dedicated PWA polish is coming.",
  },
];

function StillRough() {
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
          What&apos;s still rough
        </motion.h2>
        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-xl text-center text-base leading-relaxed text-muted-foreground"
        >
          Velo is in early beta. Here&apos;s what we know is missing, slow, or
          broken — and what we&apos;re doing about it.
        </motion.p>

        <div className="mt-12 border-t border-border">
          {stillRoughItems.map(({ title, detail }) => (
            <motion.div
              key={title}
              variants={item}
              className="border-b border-border py-5"
            >
              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {detail}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// The free trial is its own restricted tier (capped projects, suspends at
// day 14) — distinct in shape from the four paid plans, so it gets a separate
// callout above the pricing grid rather than a 5th card in line with them.
const trialFeatures = [
  "Up to 2 active projects",
  "Proposals and client approvals",
  "Project tracking and milestones",
  "Deposit and final invoices",
  "PDF export",
  "Client portal",
];

type PlanFeature = { label: string; comingSoon?: boolean };

type Plan = {
  name: string;
  monthlyPrice: number;
  // When true, prices render as "From AU$X" — used for tiers where the headline
  // price is a minimum and the final figure flexes on seat count or custom deals.
  priceFrom?: boolean;
  seats: string;
  features: PlanFeature[];
  highlighted?: boolean;
  tagline?: string;
  // Plans with custom pricing route to a contact mailto instead of /sign-up,
  // and use bespoke CTA copy.
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    name: "Starter",
    monthlyPrice: 9,
    seats: "1 user",
    features: [
      { label: "Unlimited projects and proposals" },
      { label: "Client portal" },
      { label: "GST support" },
      { label: "PDF export" },
      { label: "Stripe payments", comingSoon: true },
    ],
    cta: { label: "Try Starter free", href: "/sign-up" },
  },
  {
    name: "Studio",
    monthlyPrice: 24,
    seats: "Up to 5 users",
    features: [
      { label: "Everything in Starter" },
      { label: "Priority support" },
      { label: "Lead pipeline", comingSoon: true },
      { label: "Stripe payments", comingSoon: true },
    ],
    highlighted: true,
    cta: { label: "Try Studio free", href: "/sign-up" },
  },
  {
    name: "Agency",
    monthlyPrice: 49,
    seats: "Up to 15 users",
    features: [
      { label: "Everything in Studio" },
      { label: "Multi-user workspaces", comingSoon: true },
      { label: "Stripe payments", comingSoon: true },
    ],
    cta: { label: "Try Agency free", href: "/sign-up" },
  },
  {
    name: "Scale",
    monthlyPrice: 99,
    priceFrom: true,
    seats: "Unlimited users",
    tagline: "Custom pricing available",
    features: [
      { label: "Everything in Agency" },
      { label: "Dedicated support" },
      { label: "White-label client portal", comingSoon: true },
      { label: "Stripe payments", comingSoon: true },
    ],
    cta: {
      label: "Talk to us",
      href: "mailto:jaineelk.dev@gmail.com?subject=Velo%20Scale%20plan",
    },
  },
];

type BillingPeriod = "monthly" | "annual";

// Plan card CTA. Routes through next/link for in-app paths and a raw anchor
// for mailto/external — next/link warns when given non-route hrefs.
function PlanCta({
  label,
  href,
  highlighted,
}: {
  label: string;
  href: string;
  highlighted?: boolean;
}) {
  const className = cn(
    "inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition-colors",
    highlighted
      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      : "border border-border bg-card text-foreground hover:bg-accent",
    focusRing,
  );
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  return isExternal ? (
    <a href={href} className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

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

        <motion.div
          variants={item}
          className="relative mx-auto mt-12 max-w-4xl rounded-lg bg-card p-6 shadow-sm ring-1 ring-primary/30 sm:p-8"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-primary-foreground">
            Start here
          </span>

          <div className="grid gap-6 text-left sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10">
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                  Free trial
                </h3>
                <span className="text-sm text-muted-foreground">
                  AU$0 · 14 days · no credit card
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                After 14 days your account pauses until you pick a plan — we
                never auto-charge.
              </p>
              <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {trialFeatures.map((feature) => (
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
            </div>
            <div className="sm:shrink-0">
              <Link
                href="/sign-up"
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:w-auto",
                  focusRing,
                )}
              >
                Start free trial
              </Link>
            </div>
          </div>
        </motion.div>

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
                <CardHeader>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1 pt-2">
                    {plan.priceFrom ? (
                      <span className="text-sm font-medium text-muted-foreground">
                        From
                      </span>
                    ) : null}
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
                        key={feature.label}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check
                          aria-hidden
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        />
                        <span className="leading-snug">
                          {feature.label}
                          {feature.comingSoon ? (
                            <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                              Coming soon
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <PlanCta
                      label={plan.cta.label}
                      href={plan.cta.href}
                      highlighted={plan.highlighted}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p
          variants={item}
          className="mt-10 text-center text-sm text-muted-foreground"
        >
          More features rolling out through 2026 — got something you need?{" "}
          <a
            href="mailto:jaineelk.dev@gmail.com?subject=Velo%20feature%20request"
            className={cn(
              "rounded-sm font-medium text-primary underline-offset-2 hover:underline",
              focusRing,
            )}
          >
            Tell us.
          </a>
        </motion.p>
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
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Early beta — things will break. Send feedback when they do.
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
