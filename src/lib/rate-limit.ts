// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * IMPORTANT:
 * - Do NOT create Redis client at module import time unless env vars are valid.
 * - During Vercel build / Next "collect page data", modules can be evaluated.
 * - If Upstash isn't configured, we fall back to an in-memory limiter.
 */

function hasValidUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;
  if (!url.startsWith("https://")) return false;
  return true;
}

/** Simple in-memory limiter (good for local/dev, safe fallback for build). */
function memoryLimiter({ requests, windowSeconds }: { requests: number; windowSeconds: number }) {
  const store = new Map<string, { count: number; resetAt: number }>();

  return {
    async limit(key: string) {
      const now = Date.now();
      const existing = store.get(key);

      if (!existing || now > existing.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
        return { success: true };
      }

      if (existing.count >= requests) return { success: false };

      existing.count += 1;
      store.set(key, existing);
      return { success: true };
    },
  };
}

function createUpstashLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: "ohs",
  });
}

/**
 * Export your limiters here.
 * If Upstash not configured, use memory fallback.
 */

export const contactLimiter = (() => {
  // Contact form: 5 requests per 10 minutes per IP
  if (hasValidUpstashConfig()) {
    return createUpstashLimiter(5, "10 m");
  }
  // fallback (dev/build safe)
  return memoryLimiter({ requests: 5, windowSeconds: 10 * 60 });
})();

export const authLimiter = (() => {
  // Example: login attempts: 10 per 15 minutes
  if (hasValidUpstashConfig()) {
    return createUpstashLimiter(10, "15 m");
  }
  return memoryLimiter({ requests: 10, windowSeconds: 15 * 60 });
})();
