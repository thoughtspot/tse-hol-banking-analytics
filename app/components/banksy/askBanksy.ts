import {
  BANKSY_ENDPOINT,
  type BanksyEvent,
  type WireMessage,
} from "@/lib/banksy/protocol";

export type BanksyRole = "user" | "assistant";

export type BanksyMessage = {
  id: string;
  role: BanksyRole;
  content: string;
  isError?: boolean;
};

const HTTP_TOO_MANY_REQUESTS = 429;
const GENERIC_FAILURE = "Banksy ran into a problem. Please try again.";
const RATE_LIMITED = "Too many questions in a short time. Please wait a moment and try again.";

export class BanksyRequestError extends Error {}

/**
 * Sends the full transcript to `/api/banksy` and calls `onEvent` for each
 * streamed event. Resolves when the stream ends; throws `BanksyRequestError`
 * (with a user-safe message) if the request itself fails.
 */
export async function askBanksy(
  transcript: readonly WireMessage[],
  onEvent: (event: BanksyEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(BANKSY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: transcript }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new BanksyRequestError(GENERIC_FAILURE);
  }

  if (!response.ok || !response.body) {
    throw new BanksyRequestError(
      response.status === HTTP_TOO_MANY_REQUESTS ? RATE_LIMITED : GENERIC_FAILURE,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";

  function dispatch(line: string) {
    if (!line.trim()) return;
    try {
      onEvent(JSON.parse(line) as BanksyEvent);
    } catch {
      // Ignore a malformed line rather than dropping the whole reply.
    }
  }

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    lines.forEach(dispatch);
  }
  dispatch(buffered + decoder.decode());
}
