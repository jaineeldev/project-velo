"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { focusRing } from "../_lib/shared";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "About", href: "/about" },
  { label: "For clients", href: "/clients" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 w-full border-b border-[#2A2A2A] bg-[#0A0A0A]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="Velo home"
          className={`font-display text-lg font-black tracking-tight text-white ${focusRing} rounded-sm`}
        >
          Velo
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
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
                className={`relative rounded-sm text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-[width] after:duration-300 after:ease-out ${focusRing} ${
                  active
                    ? "text-[#4F7EF7] after:w-full"
                    : "text-[#A0A0A0] after:w-0 hover:text-white hover:after:w-full"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block rounded-md border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#F59E0B]">
            In development
          </span>
          <Link
            href="/waitlist"
            className={`hidden md:inline-flex items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-1.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] ${focusRing}`}
          >
            Join waitlist
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111] text-[#A0A0A0] transition-colors hover:border-[#444] hover:text-white md:hidden ${focusRing}`}
          >
            <span className="sr-only">Menu</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
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
          className="border-t border-[#2A2A2A] bg-[#0A0A0A] md:hidden"
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
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${focusRing} ${
                        active
                          ? "bg-[#1A1A1A] text-[#4F7EF7]"
                          : "text-[#A0A0A0] hover:bg-[#111] hover:text-white motion-safe:hover:translate-x-0.5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-3">
                <Link
                  href="/waitlist"
                  className={`inline-flex w-full items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#3B6AE8] motion-safe:active:scale-[0.98] ${focusRing}`}
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
