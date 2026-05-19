import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth-gated and public-token routes shouldn't be crawled: dashboards
        // require sign-in, share links are unguessable tokens we never want
        // indexed, and API routes have no user-facing content.
        disallow: ["/dashboard/", "/onboarding/", "/share/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
