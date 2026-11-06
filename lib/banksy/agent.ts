import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { normalizeLlmBaseUrl, positiveIntEnv, requireEnvValue } from "@/lib/env";
import { McpSession } from "./mcp";
import { BANKSY_SYSTEM_PROMPT } from "./system-prompt";
import type { BanksyEvent, WireBlock, WireMessage } from "./protocol";

const DEFAULT_MAX_TOKENS = 16_000;
// Dashboard builds are polled with get_dashboard_status, so allow many steps.
const MAX_AGENT_STEPS = 60;

export class BanksyError extends Error {
  /** `message` is safe to show to the user. */
  constructor(message: string) {
    super(message);
    this.name = "BanksyError";
  }
}

type Emit = (event: BanksyEvent) => void;

function createLlmClient(): Anthropic {
  return new Anthropic({
    apiKey: requireEnvValue("LITELLM_API_KEY"),
    baseURL: normalizeLlmBaseUrl(requireEnvValue("LITELLM_URL")),
  });
}

function toAnthropicTools(session: McpSession): Anthropic.Tool[] {
  return session.tools.map((tool) => {
    // `$schema` is metadata the gateway does not need.
    const { $schema: _schema, ...inputSchema } = tool.inputSchema as Record<string, unknown>;
    void _schema;
    return {
      name: tool.name,
      description: tool.description ?? tool.annotations?.title ?? tool.name,
      input_schema: { ...inputSchema, type: "object" } as Anthropic.Tool.InputSchema,
    };
  });
}

function toWireBlocks(content: Anthropic.ContentBlock[]): WireBlock[] {
  const blocks: WireBlock[] = [];
  for (const block of content) {
    if (block.type === "text" && block.text) {
      blocks.push({ type: "text", text: block.text });
    } else if (block.type === "tool_use") {
      blocks.push({ type: "tool_use", id: block.id, name: block.name, input: block.input });
    }
  }
  return blocks;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function runTool(
  session: McpSession,
  block: Extract<WireBlock, { type: "tool_use" }>,
  emit: Emit,
  signal: AbortSignal,
): Promise<WireBlock> {
  emit({ type: "status", phase: "tool", tool: block.name });
  // Only the tool name is logged: arguments and results can contain user data.
  console.info(`[banksy] tool: ${block.name}`);
  try {
    const outcome = await session.callTool(
      block.name,
      isRecord(block.input) ? block.input : {},
      (progress) => emit({ type: "progress", tool: block.name, ...progress }),
      signal,
    );
    return {
      type: "tool_result",
      tool_use_id: block.id,
      content: outcome.text,
      is_error: outcome.isError || undefined,
    };
  } catch (error) {
    if (signal.aborted) throw error;
    return {
      type: "tool_result",
      tool_use_id: block.id,
      content: `The ${block.name} tool failed to run. Tell the user and ask before trying again.`,
      is_error: true,
    };
  }
}

/**
 * Runs one user turn: loads the MCP tools, then loops model -> tools -> model
 * until the model gives a final answer. Streams everything through `emit`.
 * The transcript is owned by the browser; new messages go out as `turn` events.
 */
export async function runBanksyAgent(
  history: readonly WireMessage[],
  emit: Emit,
  signal: AbortSignal,
): Promise<void> {
  emit({ type: "status", phase: "connecting" });

  let llm: Anthropic;
  let session: McpSession;
  try {
    llm = createLlmClient();
  } catch {
    throw new BanksyError("Banksy's AI service is not configured.");
  }
  try {
    session = await McpSession.open(signal);
  } catch {
    if (signal.aborted) return;
    throw new BanksyError("Banksy couldn't connect to the analytics service.");
  }

  try {
    const tools = toAnthropicTools(session);
    const model = requireEnvValue("LITELLM_MODEL");
    const maxTokens = positiveIntEnv("LITELLM_MAX_TOKENS", DEFAULT_MAX_TOKENS);
    const messages = [...history];

    for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
      emit({ type: "status", phase: "thinking" });
      if (step > 0) emit({ type: "step" });

      let reply: Anthropic.Message;
      try {
        const stream = llm.messages.stream(
          {
            model,
            max_tokens: maxTokens,
            system: BANKSY_SYSTEM_PROMPT,
            messages: messages as Anthropic.MessageParam[],
            tools,
          },
          { signal },
        );
        stream.on("text", (delta) => emit({ type: "text", delta }));
        reply = await stream.finalMessage();
      } catch {
        if (signal.aborted) return;
        throw new BanksyError("Banksy couldn't reach its AI service.");
      }

      const assistant: WireMessage = { role: "assistant", content: toWireBlocks(reply.content) };
      const toolCalls = (assistant.content as WireBlock[]).filter(
        (b): b is Extract<WireBlock, { type: "tool_use" }> => b.type === "tool_use",
      );

      if (reply.stop_reason !== "tool_use" || toolCalls.length === 0) {
        if ((assistant.content as WireBlock[]).length > 0) {
          messages.push(assistant);
          emit({ type: "turn", messages: [assistant] });
        }
        if (reply.stop_reason === "max_tokens") {
          throw new BanksyError("The answer was cut off because it was too long. Ask for less detail.");
        }
        return;
      }

      const results: WireBlock[] = [];
      for (const call of toolCalls) {
        results.push(await runTool(session, call, emit, signal));
      }
      const toolResults: WireMessage = { role: "user", content: results };
      messages.push(assistant, toolResults);
      emit({ type: "turn", messages: [assistant, toolResults] });
    }
    throw new BanksyError("Banksy stopped after too many steps. Ask again to continue.");
  } finally {
    await session.close();
  }
}
