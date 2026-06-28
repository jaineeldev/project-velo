import type { Metadata } from "next";
import { StructuredData } from "./_components/structured-data";
import { Hero } from "./_components/hero";
import { TrustStrip } from "./_components/trust-strip";
import { HowItWorks } from "./_components/how-it-works";
import { ReplaceWithVelo } from "./_components/replace-with-velo";
import { ProductAreas } from "./_components/product-areas";
import { AutomationChain } from "./_components/automation-chain";
import { PricingPreview } from "./_components/pricing-preview";
import { HomeFinalCta } from "./_components/home-final-cta";

export const metadata: Metadata = {
  title: "Velo · Turn approved work into paid projects",
  description:
    "Create the proposal once. When your client approves it, the project, milestones and deposit invoice are ready automatically. Built for freelance developers and dev studios in Australia.",
};

export default function HomePage() {
  return (
    <>
      <StructuredData kind="home" />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <ReplaceWithVelo />
      <ProductAreas />
      <AutomationChain />
      <PricingPreview />
      <HomeFinalCta />
    </>
  );
}
