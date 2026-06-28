import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { marketingTheme } from "./_lib/shared";
import { MarketingNav } from "./_components/marketing-nav";
import { Footer } from "./_components/footer";
import { MarketingChrome } from "./_components/marketing-chrome";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./_lib/marketing.css";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={marketingTheme}
      className={`marketing-root ${GeistSans.variable} ${GeistMono.variable} relative min-h-screen bg-[#0A0A0A] text-[#FAFAFA] antialiased selection:bg-[#4F7EF7] selection:text-white`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:border focus:border-[#4F7EF7] focus:bg-[#4F7EF7] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <MarketingChrome />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
