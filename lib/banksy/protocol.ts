/**
 * Wire format shared by the browser and `/api/banksy`.
 *
 * The browser holds the full transcript (including tool calls and results) and
 * sends it with every request; the server keeps no conversation state. The
 * server replies with newline-delimited JSON, one `BanksyEvent` per line.
 */

export type WireBlock =
  | { type: "text"; text: string }
  | { type: "tool_use"; id: string; name: string; input: unknown }
  | { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean };

export type WireMessage = {
  role: "user" | "assistant";
  content: string | WireBlock[];
};

export type BanksyEvent =
  /** The agent moved to a new phase. */
  | { type: "status"; phase: "connecting" | "thinking" | "tool"; tool?: string }
  /** MCP progress notification for the running tool. */
  | { type: "progress"; tool: string; message?: string; progress: number; total?: number }
  /** A new model step began; text from it should start a new paragraph. */
  | { type: "step" }
  /** A streamed piece of the assistant's reply. */
  | { type: "text"; delta: string }
  /** Messages to append to the transcript (assistant turn, tool results). */
  | { type: "turn"; messages: WireMessage[] }
  | { type: "done" }
  | { type: "error"; message: string };

export const BANKSY_ENDPOINT = "/api/banksy";

export const MAX_TRANSCRIPT_MESSAGES = 200;
export const MAX_REQUEST_BYTES = 4_000_000;
