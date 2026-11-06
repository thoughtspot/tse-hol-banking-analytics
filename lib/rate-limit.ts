import "server-only";

/**
 * Per-key fixed-window rate limiter held in memory. Best effort: each server
 * instance keeps its own counts.
 */
export type RateLimiter = (key: string) => { allowed: boolean; retryAfterSeconds: number };

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const windows = new Map<string, { start: number; count: number }>();

  return (key) => {
    const now = Date.now();
    for (const [k, w] of windows) {
      if (now - w.start >= windowMs) windows.delete(k);
    }

    const window = windows.get(key) ?? { start: now, count: 0 };
    window.count += 1;
    windows.set(key, window);

    const retryAfterSeconds = Math.ceil((window.start + windowMs - now) / 1000);
    return { allowed: window.count <= limit, retryAfterSeconds };
  };
}

/** Best-effort client identifier for rate limiting. */
export function clientKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}
