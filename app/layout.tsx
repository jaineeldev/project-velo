import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedClerkProvider } from "@/components/clerk-provider";
import "./globals.css";

// Single sans-serif typeface across the marketing surface and the app. Inter
// carries every weight from 100 to 900 so we can drive hierarchy through
// weight + size + tracking, not through a second font family.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const description =
  "Send proposals, get approvals, track projects, and invoice clients, all in one place. Built for freelance developers and dev agencies.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Velo · Ship code, not spreadsheets",
    template: "%s · Velo",
  },
  description,
  applicationName: "Velo",
  openGraph: {
    title: "Velo · Ship code, not spreadsheets",
    description,
    type: "website",
    siteName: "Velo",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velo · Ship code, not spreadsheets",
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <ThemedClerkProvider>{children}</ThemedClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
