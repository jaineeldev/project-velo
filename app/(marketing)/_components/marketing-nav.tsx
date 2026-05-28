"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, focusRing } from "@/lib/utils";
import { navLinks } from "../_lib/data";
import { Wordmark } from "./wordmark";

// Static dark navigation. Sticks to the top with a hairline border. No
// transition between transparent and solid because every marketing page has
// a dark hero, so the nav blends into the section above the fold and floats
// over light content below.
export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile sheet on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0d0d0f]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Velo home"
            className={cn("rounded-sm", focusRing)}
          >
            <Wordmark />
          </Link>
          <Link
            href="/about"
            aria-label="Velo is in early beta, read more on the about page"
            className={cn(
              "hidden items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300 transition-colors hover:bg-emerald-500/[0.12] sm:inline-flex",
              focusRing,
            )}
          >
            <span
              aria-hidden
              className="relative flex h-1.5 w-1.5"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Early beta
          </Link>
        </div>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 sm:flex"
        >
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "text-white"
                    : "text-white/60 hover:text-white",
                  focusRing,
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/waitlist"
            className={cn(
              "hidden items-center justify-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 sm:inline-flex",
              focusRing,
            )}
          >
            Join waitlist
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:text-white sm:hidden",
              focusRing,
            )}
          >
            <span className="sr-only">Menu</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5"
            >
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M4 8h16M4 16h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          aria-label="Mobile"
          className="border-t border-white/[0.06] bg-[#0d0d0f] sm:hidden"
        >
          <div className="mx-auto max-w-7xl px-6 py-4">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "block rounded-md px-3 py-2 text-base transition-colors",
                        active
                          ? "text-white"
                          : "text-white/65 hover:text-white",
                        focusRing,
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-2">
                <Link
                  href="/waitlist"
                  className={cn(
                    "inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90",
                    focusRing,
                  )}
                >
                  Join waitlist
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
