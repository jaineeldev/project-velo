import { faqs, plans } from "../_lib/data";

type SchemaKind = "home" | "pricing" | "default";

// JSON-LD per route. The homepage carries the SoftwareApplication entity;
// /pricing additionally carries the FAQPage entity. Other pages get the
// minimal SoftwareApplication object only.
export function StructuredData({ kind = "default" }: { kind?: SchemaKind }) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Velo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Send proposals, get approvals, track projects, and invoice clients, all in one place. Built for freelance developers and dev agencies.",
    url: appUrl,
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: String(plan.monthlyPrice),
      priceCurrency: "AUD",
      category: "subscription",
    })),
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const data =
    kind === "home"
      ? [software]
      : kind === "pricing"
        ? [software, faqPage]
        : [software];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
