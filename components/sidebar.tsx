"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/proposals", label: "Proposals" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/clients", label: "Clients" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Velo
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                "block rounded-md px-3 py-1.5 text-sm transition-colors " +
                (active
                  ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100")
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <SignOutButton>
          <button className="w-full rounded-md px-3 py-1.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100">
            Sign out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
