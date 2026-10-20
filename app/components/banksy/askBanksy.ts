export type BanksyRole = "user" | "assistant";

export type BanksyMessage = {
  id: string;
  role: BanksyRole;
  content: string;
};

const PLACEHOLDER_REPLY =
  "Banksy isn't connected yet. Once the MCP integration is in place, I'll answer questions about the bank's data here.";

/**
 * Sends a question to Banksy and resolves with the assistant's reply.
 *
 * Placeholder: this will call the MCP-backed chat agent. Keep the signature
 * stable so the UI doesn't need to change when the integration lands.
 */
export async function askBanksy(
  question: string,
  history: readonly BanksyMessage[],
): Promise<string> {
  void question;
  void history;
  return PLACEHOLDER_REPLY;
}
