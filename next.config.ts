import type { NextConfig } from "next";

/**
 * Content Security Policy.
 *
 * `script-src` includes 'unsafe-inline' because Next.js App Router injects
 * inline bootstrap and flight-data scripts. Removing it requires per-request
 * nonces generated in middleware, which is a worthwhile follow-up but is NOT
 * implemented here — so this policy is honestly described as hardening, not as
 * XSS-proof.
 *
 * What it does buy, and these are real:
 *   - `frame-ancestors 'none'` blocks clickjacking (with X-Frame-Options).
 *   - `object-src 'none'` kills legacy plugin vectors.
 *   - `base-uri 'self'` stops <base> tag injection redirecting relative URLs.
 *   - `form-action 'self'` prevents forms being repointed at an attacker.
 *   - `img-src` is limited to the two allow-listed image hosts.
 *   - No external font or script host is permitted, because fonts are
 *     self-hosted through next/font and the app ships no third-party scripts.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://images.unsplash.com https://res.cloudinary.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/** Security headers applied to every route. */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Photography is served from /public, so no remote host is needed. If the
    // coach ever pastes an external image URL into the admin, add that host
    // here — next/image refuses hosts that are not allow-listed, by design.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
