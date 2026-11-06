import { BanksyError, runBanksyAgent } from "@/lib/banksy/agent";
import {
  MAX_REQUEST_BYTES,
  MAX_TRANSCRIPT_MESSAGES,
  type BanksyEvent,
  type WireBlock,
  type WireMessage,
} from "@/lib/banksy/protocol";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-guards";

// Spotter analysis and dashboard builds can take minutes.
export const maxDuration = 800;

const REQUESTS_PER_MINUTE = 20;
const ONE_MINUTE_MS = 60_000;
const rateLimit = createRateLimiter(REQUESTS_PER_MINUTE, ONE_MINUTE_MS);

const NO_STORE = { "Cache-Control": "no-store" };
const GENERIC_ERROR = "Banksy ran into a problem. Please try again.";

function errorResponse(status: number, error: string, headers: HeadersInit = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...headers } });
}

function isWireBlock(value: unknown): value is WireBlock {
  if (typeof value !== "object" || value === null) return false;
  const b = value as Record<string, unknown>;
  switch (b.type) {
    case "text":
      return typeof b.text === "string";
    case "tool_use":
      return typeof b.id === "string" && typeof b.name === "string";
    case "tool_result":
      return typeof b.tool_use_id === "string" && typeof b.content === "string";
    default:
      return false;
  }
}

function parseTranscript(body: unknown): WireMessage[] | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_TRANSCRIPT_MESSAGES) {
    return undefined;
  }
  for (const message of messages) {
    if (typeof message !== "object" || message === null) return undefined;
    const { role, content } = message as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return undefined;
    const valid =
      typeof content === "string"
        ? content.length > 0
        : Array.isArray(content) && content.length > 0 && content.every(isWireBlock);
    if (!valid) return undefined;
  }
  const last = messages[messages.length - 1] as WireMessage;
  return last.role === "user" ? (messages as WireMessage[]) : undefined;
}

/**
 * Runs one Banksy turn and streams the reply as newline-delimited JSON
 * (`BanksyEvent` per line). The browser owns the transcript and sends it in full.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse(403, "Forbidden");

  const { allowed, retryAfterSeconds } = rateLimit(clientKey(request));
  if (!allowed) {
    return errorResponse(429, "Too many requests", { "Retry-After": String(retryAfterSeconds) });
  }

  const raw = await request.text();
  if (raw.length > MAX_REQUEST_BYTES) return errorResponse(413, "Request too large");

  let transcript: WireMessage[] | undefined;
  try {
    transcript = parseTranscript(JSON.parse(raw));
  } catch {
    transcript = undefined;
  }
  if (!transcript) return errorResponse(400, "Invalid request");
  const history = transcript;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (event: BanksyEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          closed = true;
        }
      };

      try {
        await runBanksyAgent(history, emit, request.signal);
        emit({ type: "done" });
      } catch (error) {
        emit({
          type: "error",
          message: error instanceof BanksyError ? error.message : GENERIC_ERROR,
        });
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {
          // The client already disconnected.
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...NO_STORE,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
