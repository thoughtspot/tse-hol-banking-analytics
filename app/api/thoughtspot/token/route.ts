import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guards";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";

const REQUESTS_PER_MINUTE = 30;
const ONE_MINUTE_MS = 60_000;

const rateLimit = createRateLimiter(REQUESTS_PER_MINUTE, ONE_MINUTE_MS);

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(status: number, error: string, headers: HeadersInit = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}

/**
 * Returns a ThoughtSpot token for the Visual Embed SDK's `getAuthToken`.
 * Only same-origin browser requests from this app are accepted.
 */
export async function GET(request: Request) {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "Forbidden");
  }

  const { allowed, retryAfterSeconds } = rateLimit(clientKey(request));
  if (!allowed) {
    return errorResponse(429, "Too many requests", {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  try {
    const { token } = await getThoughtSpotToken();
    return Response.json({ token }, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[thoughtspot-token]",
      error instanceof Error ? error.message : "Unknown error",
    );
    return errorResponse(502, "Unable to get a ThoughtSpot token");
  }
}
