Wire the Banksy chat (app/components/banksy/) to the ThoughtSpot MCP server at TS_MCP_URL,
following ARCHITECTURE.md (/api/banksy route, streamed NDJSON, browser holds the transcript).

LLM: Anthropic TS SDK → LiteLLM proxy (LITELLM_URL / \_API_KEY / \_MODEL / \_MAX_TOKENS).
Don't print .env.local values; normalize them defensively (scheme, slashes, /v1, quotes).

Auth: trusted-auth token for TS_USERNAME from TOKEN_SERVICE_URL, sent with
x-ts-host = host of NEXT_PUBLIC_THOUGHTSPOT_HOST.

Tools: load all; report any the server withholds and its stated reason.
Multi-step tools (create/modify_dashboard, analysis and model sessions) return
needs_input / in_progress + task_id: keep the full transcript across turns, never
confirm a plan for the user, never retry a failed dashboard without asking.
Whenever a liveboard is created, always give it a description: use the user's wording if
given, otherwise write one short sentence summarizing it. Pass it through the tool's
description field if the tool schema has one; if it doesn't, say so in your report
and add it to the system prompt so the model includes one in the request.

UX: stream text; status line with elapsed time (connecting, thinking, each tool,
MCP progress). Logging: tool name, only — tell me where logs land.
Cache Components is on: never call Date.now() / new Date() / Math.random() during render
or in a useState initializer. Record start times in event handlers or useEffect, and
time with performance.now(). Don't run `next build` to check this.

Banksy users have no direct access to ThoughtSpot: never render links to ThoughtSpot, or to
a liveboard or answer that was created. Describe the result in text only.
Tool replies come back as markdown: render it properly (headings, lists, tables, bold, code),
sanitized, with no raw HTML. Close the chat when I click outside it.

Testing, keep it minimal: run typecheck and lint, then ONE Node script (fetch, no browser,
no Playwright or other headless browser) against {{DEV_URL}} that sends a simple question to
/api/banksy and checks that it streams a reply. Don't create liveboards as a test.

Don't commit.
