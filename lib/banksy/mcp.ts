import "server-only";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { normalizeUrl, requireEnvValue } from "@/lib/env";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";
import { thoughtSpotHost } from "@/lib/thoughtspot/host";

const CLIENT_INFO = { name: "bankalytics-banksy", version: "1.0.0" };
// Spotter analysis and dashboard builds can run for minutes; progress
// notifications keep resetting the per-request timeout up to the total cap.
const TOOL_TIMEOUT_MS = 120_000;
const TOOL_TOTAL_TIMEOUT_MS = 600_000;
const MAX_TOOL_PAGES = 20;
const MAX_TOOL_RESULT_CHARS = 60_000;

export type McpProgress = { message?: string; progress: number; total?: number };

export type ToolOutcome = { text: string; isError: boolean };

export class McpSession {
  private constructor(
    private readonly client: Client,
    readonly tools: readonly Tool[],
  ) {}

  /**
   * Connects to the Spotter MCP server as the configured lab user and loads
   * every tool it offers, following pagination. Throws on failure; callers map
   * that to a generic message.
   */
  static async open(signal?: AbortSignal): Promise<McpSession> {
    const { token } = await getThoughtSpotToken();
    const host = thoughtSpotHost(process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST);
    if (!host) throw new Error("NEXT_PUBLIC_THOUGHTSPOT_HOST is missing or invalid");

    const transport = new StreamableHTTPClientTransport(
      new URL(normalizeUrl(requireEnvValue("TS_MCP_URL"))),
      { requestInit: { headers: { Authorization: `Bearer ${token}`, "x-ts-host": host } } },
    );
    const client = new Client(CLIENT_INFO);
    await client.connect(transport, { signal });

    try {
      const tools: Tool[] = [];
      let cursor: string | undefined;
      for (let page = 0; page < MAX_TOOL_PAGES; page += 1) {
        const result = await client.listTools(cursor ? { cursor } : undefined, { signal });
        tools.push(...result.tools);
        cursor = result.nextCursor;
        if (!cursor) break;
      }
      return new McpSession(client, tools);
    } catch (error) {
      await client.close().catch(() => undefined);
      throw error;
    }
  }

  /** Calls a tool and flattens its result to text for the model. */
  async callTool(
    name: string,
    args: Record<string, unknown>,
    onProgress: (progress: McpProgress) => void,
    signal?: AbortSignal,
  ): Promise<ToolOutcome> {
    const result = await this.client.callTool({ name, arguments: args }, undefined, {
      onprogress: (p) => onProgress({ message: p.message, progress: p.progress, total: p.total }),
      timeout: TOOL_TIMEOUT_MS,
      resetTimeoutOnProgress: true,
      maxTotalTimeout: TOOL_TOTAL_TIMEOUT_MS,
      signal,
    });

    const parts: string[] = [];
    const content = Array.isArray(result.content) ? result.content : [];
    for (const block of content) {
      if (block && typeof block === "object" && "type" in block) {
        parts.push(
          block.type === "text" && "text" in block && typeof block.text === "string"
            ? block.text
            : `[${String(block.type)} content omitted]`,
        );
      }
    }
    if (parts.length === 0 && result.structuredContent) {
      parts.push(JSON.stringify(result.structuredContent));
    }

    let text = parts.join("\n");
    if (text.length > MAX_TOOL_RESULT_CHARS) {
      text = `${text.slice(0, MAX_TOOL_RESULT_CHARS)}\n\n[Result truncated]`;
    }
    return { text: text || "(no content)", isError: result.isError === true };
  }

  async close(): Promise<void> {
    await this.client.close().catch(() => undefined);
  }
}
