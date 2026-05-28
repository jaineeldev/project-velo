import Link from "next/link";
import { cn, focusRing } from "@/lib/utils";
import { Wordmark } from "./wordmark";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "For clients", href: "/clients" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

const accountLinks = [
  { label: "Join waitlist", href: "/waitlist" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-[#0d0d0f]">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-32 sm:px-10 sm:pb-16 sm:pt-40">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-8 max-w-sm text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-3xl">
              Ship code, not{" "}
              <span className="text-primary">spreadsheets.</span>
            </p>
            <p className="mt-4 text-sm text-white/60">
              Built in Brisbane, Australia
            </p>
          </div>

          <FooterCol heading="Product" links={productLinks} />
          <FooterCol heading="Account" links={accountLinks} />
          <FooterCol heading="Legal" links={legalLinks} />
        </div>

        {/* Social + external contact row sits between the link columns and
            the copyright. Email lives here so it's findable without being
            wedged under the wordmark. */}
        <div className="mt-20 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/[0.06] pt-8">
          <a
            href="mailto:jaineelk.dev@gmail.com"
            className={cn(
              "rounded-sm text-sm text-white/60 underline-offset-2 hover:text-white hover:underline",
              focusRing,
            )}
          >
            	jaineelk.dev@gmail.com
          </a>
          <a
            href="https://github.com/jaineeldev/project-velo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Velo on GitHub"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white",
              focusRing,
            )}
          >
            <GithubMark className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center">
          <p className="text-white/60">
            &copy; 2026 Velo. All rights reserved. Built in Brisbane.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Inline GitHub mark. Lucide v1 doesn't export Github so we use the official
// path directly. Sized from the parent via className.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
        {heading}
      </p>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "rounded-sm text-sm text-white/60 transition-colors hover:text-white",
                focusRing,
              )}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
