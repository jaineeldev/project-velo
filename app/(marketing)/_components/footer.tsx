import Link from "next/link";
import { cn, focusRing } from "@/lib/utils";
import { Wordmark } from "./wordmark";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
];

const accountLinks = [
  { label: "Sign in", href: "/sign-in" },
  { label: "Start free trial", href: "/sign-up" },
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
            <a
              href="mailto:jaineelk.dev@gmail.com"
              className={cn(
                "mt-8 inline-block rounded-sm text-sm text-white/60 underline-offset-2 hover:text-white hover:underline",
                focusRing,
              )}
            >
              jaineelk.dev@gmail.com
            </a>
          </div>

          <FooterCol heading="Product" links={productLinks} />
          <FooterCol heading="Account" links={accountLinks} />
          <FooterCol heading="Legal" links={legalLinks} />
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-white/[0.06] pt-8 text-xs sm:flex-row sm:items-center">
          <p className="text-white/40">
            &copy; 2026 Velo. All rights reserved. Built in Brisbane.
          </p>
        </div>
      </div>
    </footer>
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
