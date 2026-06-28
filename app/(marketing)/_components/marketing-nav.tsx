"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
          className="font-display text-lg font-black tracking-tight text-white"
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
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-[#4F7EF7]"
                    : "text-[#A0A0A0] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-block rounded-md border border-[#2A2A2A] bg-[#1A1A1A] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#555]">
            Early beta
          </span>
          <Link
            href="/waitlist"
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B6AE8]"
          >
            Join waitlist
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#111] text-[#A0A0A0] transition-colors hover:border-[#444] hover:text-white md:hidden"
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
                      className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#1A1A1A] text-[#4F7EF7]"
                          : "text-[#A0A0A0] hover:bg-[#111] hover:text-white"
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
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#4F7EF7] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#3B6AE8]"
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
