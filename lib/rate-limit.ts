// Rate limiter. Uses Upstash Redis (sliding window) when both
// UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set; otherwise falls
// back to an in-memory Map so local dev works without Upstash credentials.
// The in-memory limiter is per-runtime-instance, so under horizontal scaling
// each instance keeps its own counter. Fine for local dev, not safe for
// production.
//
// On Upstash error this fails open: the request is allowed and the error is
// logged. Failing closed would mean an Upstash outage locks every visitor out
// of the site.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSeconds: number };

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  upstashUrl && upstashToken
    ? new Redis({ url: upstashUrl, token: upstashToken })
    : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. Falling back to per-instance in-memory rate limiting, which is not safe under horizontal scaling.",
  );
}

// Cache Ratelimit instances by (limit, windowMs). The library is designed for
// fixed-config limiters, so caching avoids re-creating one per request while
// still supporting our heterogeneous call sites.
const limiters = new Map<string, Ratelimit>();
function getLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  const cached = limiters.get(cacheKey);
  if (cached) return cached;
  const instance = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms` as `${number} ms`),
    prefix: "velo:rl",
    analytics: false,
  });
  limiters.set(cacheKey, instance);
  return instance;
}

// In-memory fallback used when Upstash creds are not configured.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt < now) buckets.delete(key);
  });
}

function checkInMemory(
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

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!redis) return checkInMemory(key, limit, windowMs);

  try {
    const limiter = getLimiter(limit, windowMs);
    const result = await limiter.limit(key);
    if (result.success) {
      return { ok: true, remaining: result.remaining };
    }
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    return { ok: false, retryAfterSeconds };
  } catch (err) {
    // Fail open so an Upstash outage doesn't lock the site.
    console.error("[rate-limit] Upstash error, allowing request:", err);
    return { ok: true, remaining: limit - 1 };
  }
}

// Best-effort client IP extraction. Production reverse proxies (Vercel, etc.)
// set x-forwarded-for as a comma-separated chain; the leftmost entry is the
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
