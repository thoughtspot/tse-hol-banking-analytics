import "server-only";

/**
 * Defensive readers for `.env.local` values. Hand-edited env files often carry
 * stray quotes, trailing `# comments`, a missing scheme, or extra slashes, so
 * every URL and number goes through these before use.
 */

const DEFAULT_SCHEME = "https://";
const TRAILING_COMMENT = /\s+#.*$/;
const TRAILING_SLASHES = /\/+$/;
const TRAILING_V1 = /\/v1(\/messages)?$/i;

/** Trims whitespace, wrapping quotes, and a trailing ` # comment`. */
export function cleanEnvValue(raw: string | undefined): string {
  let value = (raw ?? "").trim().replace(TRAILING_COMMENT, "").trim();
  while (value.length >= 2 && /^(["'`]).*\1$/.test(value)) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

/** Reads a required, cleaned env var. Throws with the variable name only. */
export function requireEnvValue(name: string): string {
  const value = cleanEnvValue(process.env[name]);
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

/** Adds `https://` when the value has no scheme, and trims trailing slashes. */
export function normalizeUrl(raw: string): string {
  const value = cleanEnvValue(raw);
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `${DEFAULT_SCHEME}${value}`;
  return withScheme.replace(TRAILING_SLASHES, "");
}

/** Normalizes a LiteLLM base URL for the Anthropic SDK, which appends `/v1/messages` itself. */
export function normalizeLlmBaseUrl(raw: string): string {
  const url = normalizeUrl(raw);
  const stripped = url.replace(TRAILING_V1, "").replace(TRAILING_SLASHES, "");
  return stripped;
}

/** Parses a positive integer env var, falling back when it is missing or invalid. */
export function positiveIntEnv(name: string, fallback: number): number {
  const parsed = Number.parseInt(cleanEnvValue(process.env[name]), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
