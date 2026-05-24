import type { ReactNode } from "react";
import { marketingTheme } from "./_lib/shared";
import { MarketingNav } from "./_components/marketing-nav";
import { Footer } from "./_components/footer";
import { MarketingChrome } from "./_components/marketing-chrome";

export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={marketingTheme}
      className="dark-surface min-h-screen bg-[#0d0d0f] text-white antialiased selection:bg-primary/30 selection:text-white"
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <MarketingChrome />
      <MarketingNav />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
    </div>
  );
}
