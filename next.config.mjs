/** @type {import('next').NextConfig} */

// CSP allowlist is intentionally permissive on script/style (Next.js inlines
// runtime scripts and Tailwind inlines styles). Tighten with nonces once the
// design pass settles.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // https://*.supabase.co covers both the Auth API (signup/signin/etc, hit
  // directly from the browser via supabase-js) and the Postgres/Storage REST
  // endpoints, even though the app's own DB queries go server-side through
  // postgres.js rather than the browser - Session 13 migration.
  "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com https://api.resend.com https://*.neon.tech wss://*.neon.tech https://*.supabase.co wss://*.supabase.co",
  "frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    // Vercel Blob serves uploaded avatars from per-store subdomains under
    // *.public.blob.vercel-storage.com (public access) and
    // *.blob.vercel-storage.com (private access, requires signed URL query
    // string). Whitelisting both lets next/image optimise either kind.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
