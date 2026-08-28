import "server-only";

/**
 * Fixed-window in-memory rate limiter.
 *
 * KNOWN LIMITATION (docs/DECISIONS.md D-005): this state is per-instance and
 * does not survive serverless scale-out, so under load an attacker can obtain
 * more than `limit` requests. It reliably stops casual abuse and naive bots,
 * which is the real MVP threat model for a single coach's inquiry form.
 *
 * Everything goes through `checkRateLimit`, so swapping in Upstash Redis later
 * is a change to this file alone.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

/** Bounded so a flood of unique keys cannot grow the map without limit. */
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number): void {
  for (const [key, window] of buckets) {
    if (window.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) sweep(now);

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: limit - existing.count, retryAfter };
}

export const RATE_LIMITS = {
  booking: { limit: 5, windowMs: 10 * 60 * 1000 },
  contact: { limit: 5, windowMs: 10 * 60 * 1000 },
  login: { limit: 5, windowMs: 10 * 60 * 1000 },
} as const;

/**
 * Best-effort client IP.
 *
 * On Vercel `x-forwarded-for` is set by the platform edge and its leftmost
 * entry is the real client. This header is spoofable when the app is deployed
 * behind an untrusted proxy — acceptable here because the limiter is an abuse
 * speed-bump, not an authorisation control.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}

/** Test-only. Never called from application code. */
export function __resetRateLimits(): void {
  buckets.clear();
}
