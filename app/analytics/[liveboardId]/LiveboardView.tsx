"use client";

import { useEffect, useState } from "react";
import { whenThoughtSpotInitialized } from "../../components/thoughtspot/sdk-ready";

// Instances older than this redirect to the home page when asked for the
// Spotter 2026.11 experience, so that option is only sent to 26.11 and newer.
const SPOTTER_2026_11_MIN_RELEASE = { major: 26, minor: 11 } as const;

type Sdk = typeof import("@thoughtspot/visual-embed-sdk/react");

type EmbedState = {
  sdk: Sdk;
  supportsSpotter2026_11: boolean;
};

/** Parses a release such as "26.11.0.cl"; returns false when it cannot be read. */
function isAtLeastSpotter2026_11(releaseVersion: string | undefined): boolean {
  const match = /^(\d+)\.(\d+)/.exec(releaseVersion ?? "");
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return (
    major > SPOTTER_2026_11_MIN_RELEASE.major ||
    (major === SPOTTER_2026_11_MIN_RELEASE.major &&
      minor >= SPOTTER_2026_11_MIN_RELEASE.minor)
  );
}

export default function LiveboardView({ liveboardId }: { liveboardId: string }) {
  const [state, setState] = useState<EmbedState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        // Imported here because the SDK warns when loaded during server rendering.
        const sdk = await import("@thoughtspot/visual-embed-sdk/react");
        await whenThoughtSpotInitialized();
        let supportsSpotter2026_11 = false;
        try {
          const session = await sdk.getSessionInfo();
          supportsSpotter2026_11 = isAtLeastSpotter2026_11(session.releaseVersion);
        } catch (error) {
          // Fall back to the base Spotter 3 option rather than blocking the embed.
          console.warn(
            "[liveboard] Could not read the ThoughtSpot release:",
            error instanceof Error ? error.message : "Unknown error",
          );
        }
        if (!cancelled) setState({ sdk, supportsSpotter2026_11 });
      } catch (error) {
        console.error(
          "[liveboard] Could not load the embed SDK:",
          error instanceof Error ? error.message : "Unknown error",
        );
        if (!cancelled) setFailed(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <p role="alert" className="absolute inset-0 grid place-items-center text-sm text-muted">
        The liveboard could not be loaded.
      </p>
    );
  }

  if (!state) {
    return <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />;
  }

  const { sdk, supportsSpotter2026_11 } = state;
  const { Action, LiveboardEmbed, SpotterExperienceVersion } = sdk;

  return (
    <div className="absolute inset-0">
      <LiveboardEmbed
        liveboardId={liveboardId}
        frameParams={{ width: "100%", height: "100%" }}
        style={{ height: "100%" }}
        // Explore is hidden; Action.AskAi (Spotter on each visualization) stays visible.
        hiddenActions={[Action.Explore]}
        // Always on: this is the option that turns on the Spotter 3 chat.
        updatedSpotterChatPrompt={true}
        {...(supportsSpotter2026_11
          ? { spotterExperienceVersion: SpotterExperienceVersion.SPOTTER_2026_11 }
          : {})}
      />
    </div>
  );
}
