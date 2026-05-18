// In-memory rate limiter. Works on both Node and Edge runtimes (uses only
// Map + Date.now). Caveat: each runtime instance / Edge isolate keeps its own
// Map, so under horizontal scaling the effective limit is per-instance, not
// global. Swap for Upstash Redis before going to production traffic.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Prune expired buckets at most once per minute. Cheap O(n) sweep — fine at
// MVP scale.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt < now) buckets.delete(key);
  });
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count };
}

// Best-effort client IP extraction. Production reverse proxies (Vercel, etc.)
// set x-forwarded-for as a comma-separated chain — the leftmost entry is the
// original client. Falls back to "unknown" so we still produce a bucket key
// and rate-limit at all. Accepts both Fetch `Headers` and Next's
// `ReadonlyHeaders` (from `next/headers`).
export function getClientIp(headers: { get(name: string): string | null }): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
