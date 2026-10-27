import "server-only";

/**
 * Server-side client for ts-embed-lab-token-service, which mints ThoughtSpot
 * trusted-auth tokens so this app never holds the ThoughtSpot secret key.
 * The same token works for the Visual Embed SDK, REST APIs, and the Spotter
 * MCP server.
 */

const TOKEN_PATH = "/api/token";
const REQUEST_TIMEOUT_MS = 10_000;
// Refresh a cached token this long before it expires.
const EXPIRY_MARGIN_MS = 60_000;

export type ThoughtSpotToken = {
  token: string;
  username: string;
  thoughtspotUrl: string;
  expiresAt: number;
};

type TokenServiceResponse = {
  token: string;
  username: string;
  thoughtspot_url: string;
  expiration_time_in_millis: number;
};

type TokenServiceConfig = {
  baseUrl: string;
  apiKey: string;
  instance: string;
  org: string | undefined;
  username: string;
};

export class TokenServiceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "TokenServiceError";
  }
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new TokenServiceError(`Missing environment variable ${name}`);
  }
  return value;
}

function readConfig(): TokenServiceConfig {
  const baseUrl = new URL(requireEnv("TOKEN_SERVICE_URL"));
  if (baseUrl.protocol !== "https:") {
    throw new TokenServiceError("TOKEN_SERVICE_URL must use https");
  }
  return {
    baseUrl: baseUrl.origin,
    apiKey: requireEnv("TOKEN_SERVICE_API_KEY"),
    instance: requireEnv("TS_INSTANCE"),
    org: process.env.TS_ORG?.trim() || undefined,
    username: requireEnv("TS_USERNAME"),
  };
}

function isTokenServiceResponse(body: unknown): body is TokenServiceResponse {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.token === "string" &&
    typeof b.username === "string" &&
    typeof b.thoughtspot_url === "string" &&
    typeof b.expiration_time_in_millis === "number"
  );
}

async function requestToken(config: TokenServiceConfig): Promise<ThoughtSpotToken> {
  const params = new URLSearchParams({
    instance: config.instance,
    username: config.username,
  });
  if (config.org) params.set("org", config.org);

  const response = await fetch(`${config.baseUrl}${TOKEN_PATH}?${params}`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    // The service's error messages are deliberately generic, so they are safe to log.
    const body: unknown = await response.json().catch(() => null);
    const detail =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? `: ${body.error}`
        : "";
    throw new TokenServiceError(
      `Token service returned ${response.status}${detail}`,
      response.status,
    );
  }

  const body: unknown = await response.json();
  if (!isTokenServiceResponse(body)) {
    throw new TokenServiceError("Token service returned an unexpected response");
  }
  return {
    token: body.token,
    username: body.username,
    thoughtspotUrl: body.thoughtspot_url,
    expiresAt: body.expiration_time_in_millis,
  };
}

let cached: ThoughtSpotToken | undefined;
let pending: Promise<ThoughtSpotToken> | undefined;

/**
 * Returns a ThoughtSpot bearer token for the configured lab user, reusing the
 * cached token until it is close to expiring. Concurrent callers share one
 * in-flight request.
 */
export async function getThoughtSpotToken(): Promise<ThoughtSpotToken> {
  if (cached && cached.expiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return cached;
  }
  pending ??= requestToken(readConfig())
    .then((token) => {
      cached = token;
      return token;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
