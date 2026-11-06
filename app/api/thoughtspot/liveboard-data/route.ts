import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guards";
import { fetchVisualizationRows } from "@/lib/thoughtspot/liveboard-data";

const REQUESTS_PER_MINUTE = 30;
const ONE_MINUTE_MS = 60_000;
const MAX_REQUEST_BYTES = 1024;
const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const rateLimit = createRateLimiter(REQUESTS_PER_MINUTE, ONE_MINUTE_MS);

const NO_STORE = { "Cache-Control": "no-store" };

function errorResponse(status: number, error: string, headers: HeadersInit = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}

function parseIds(body: unknown): { liveboardId: string; vizId: string } | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const { liveboardId, vizId } = body as Record<string, unknown>;
  if (typeof liveboardId !== "string" || !GUID.test(liveboardId)) return undefined;
  if (typeof vizId !== "string" || !GUID.test(vizId)) return undefined;
  return { liveboardId, vizId };
}

/**
 * Returns the first rows of one liveboard visualization as
 * `{ column_names, data_rows }`. Only same-origin browser requests are accepted.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "Forbidden");

  const { allowed, retryAfterSeconds } = rateLimit(clientKey(request));
  if (!allowed) {
    return errorResponse(429, "Too many requests", {
      "Retry-After": String(retryAfterSeconds),
    });
  }

  const raw = await request.text();
  if (raw.length > MAX_REQUEST_BYTES) return errorResponse(413, "Request too large");

  let ids: ReturnType<typeof parseIds>;
  try {
    ids = parseIds(JSON.parse(raw));
  } catch {
    ids = undefined;
  }
  if (!ids) return errorResponse(400, "Invalid request");

  try {
    const rows = await fetchVisualizationRows(ids.liveboardId, ids.vizId);
    return Response.json(rows, { headers: NO_STORE });
  } catch (error) {
    console.error(
      "[liveboard-data]",
      error instanceof Error ? error.message : "Unknown error",
    );
    return errorResponse(502, "Unable to load the visualization data");
  }
}
