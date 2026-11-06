"use client";

import { useEffect } from "react";

const TOKEN_ROUTE = "/api/thoughtspot/token";

async function getAuthToken(): Promise<string> {
  const response = await fetch(TOKEN_ROUTE, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }
  const { token } = (await response.json()) as { token: string };
  return token;
}

/**
 * Initializes the Visual Embed SDK once for the app. Tokens are fetched from
 * this app's server, which gets them from the token service, so no credentials
 * reach the browser beyond the short-lived token itself.
 */
export default function ThoughtSpotInit({ username }: { username: string }) {
  useEffect(() => {
    const thoughtSpotHost = process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST;
    if (!thoughtSpotHost) {
      console.error("NEXT_PUBLIC_THOUGHTSPOT_HOST is not set");
      return;
    }
    // Imported here because the SDK warns when loaded during server rendering.
    import("@thoughtspot/visual-embed-sdk").then(({ AuthType, init }) => {
      init({
        thoughtSpotHost,
        authType: AuthType.TrustedAuthTokenCookieless,
        username,
        getAuthToken,
      });
    });
  }, [username]);

  return null;
}
