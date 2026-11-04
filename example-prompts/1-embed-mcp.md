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

UX: stream text; status line with elapsed time (connecting, thinking, each tool,
MCP progress). Logging: tool name, only — tell me where logs land.

Test against my dev server at {{DEV_URL}}. Create a simple liveboard with a max of 5 visualizations about customer accounts. Call it "Customer Info - MCP" and verify it got built.
Test rules: create_dashboard — if it fails for a backend reason, retry at most
once after 5 min, then stop and report. You can run local node scripts to test without prompting.

Don't commit.
