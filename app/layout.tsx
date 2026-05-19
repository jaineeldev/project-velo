import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedClerkProvider } from "@/components/clerk-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const description =
  "Send proposals, get approvals, track projects, and invoice clients — all in one place. Built for freelance developers and dev agencies.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Velo · Client work, handled.",
    template: "%s · Velo",
  },
  description,
  applicationName: "Velo",
  openGraph: {
    title: "Velo · Client work, handled.",
    description,
    type: "website",
    siteName: "Velo",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velo · Client work, handled.",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-neutral-50 font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <ThemeProvider>
          <ThemedClerkProvider>{children}</ThemedClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
