"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Action,
  CustomActionsPosition,
  CustomActionTarget,
  getSessionInfo,
  LiveboardEmbed,
  SpotterExperienceVersion,
} from "@thoughtspot/visual-embed-sdk/react";
import type { CustomAction } from "@thoughtspot/visual-embed-sdk";
import { whenThoughtSpotInitialized } from "../../components/thoughtspot/sdk-ready";
import {
  loadTable,
  LOAD_FAILED_MESSAGE,
  NO_DATA_MESSAGE,
  type CustomActionMessage,
} from "./load-table";
import TableDialog, { type TableDialogState } from "./TableDialog";

// Instances older than this redirect to the home page when asked for the
// Spotter 2026.11 experience, so that option is only sent to 26.11 and newer.
const SPOTTER_2026_11_MIN_RELEASE = { major: 26, minor: 11 } as const;

const VIEW_AS_TABLE_ID = "view-as-table";
const DEFAULT_TABLE_TITLE = "Table";
const FATAL_ERROR_CODES = new Set(["INIT_ERROR", "LOGIN_FAILED"]);

// Module constants keep the embed's props referentially stable so it is never rebuilt.
// Explore is hidden (Action.AskAi, Spotter on each visualization, stays visible), as is all TML.
const HIDDEN_ACTIONS = [
  Action.Explore,
  Action.TML,
  Action.ExportTML,
  Action.ImportTML,
  Action.UpdateTML,
  Action.EditTML,
];

// Unscoped, so it appears on every visualization.
const CUSTOM_ACTIONS: CustomAction[] = [
  {
    id: VIEW_AS_TABLE_ID,
    name: "View as table",
    position: CustomActionsPosition.MENU,
    target: CustomActionTarget.VIZ,
  },
];

const FRAME_PARAMS = { width: "100%", height: "100%" };
const EMBED_STYLE = { height: "100%" };

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

function errorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const { code } = error as { code?: unknown };
  return typeof code === "string" ? code : undefined;
}

function errorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) return "Unknown error";
  const { message } = error as { message?: unknown };
  return typeof message === "string" ? message : "Unknown error";
}

type Dialog = { id: number; state: TableDialogState };

export default function LiveboardFrame({ liveboardId }: { liveboardId: string }) {
  // undefined until the SDK is initialized and the release is known.
  const [supportsSpotter2026_11, setSupportsSpotter2026_11] = useState<boolean | undefined>();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const latestRequest = useRef(0);

  useEffect(() => {
    let cancelled = false;
    async function detectRelease() {
      await whenThoughtSpotInitialized();
      let supported = false;
      try {
        const session = await getSessionInfo();
        supported = isAtLeastSpotter2026_11(session.releaseVersion);
      } catch (error) {
        // Fall back to the base Spotter 3 option rather than blocking the embed.
        console.warn("[liveboard] Could not read the ThoughtSpot release:", errorMessage(error));
      }
      if (!cancelled) setSupportsSpotter2026_11(supported);
    }
    void detectRelease();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCustomAction = useCallback(
    (payload: CustomActionMessage) => {
      if (payload.data?.id !== VIEW_AS_TABLE_ID) return;

      const id = latestRequest.current + 1;
      latestRequest.current = id;
      const rawName: unknown = payload.data?.embedAnswerData?.name;
      const title = typeof rawName === "string" && rawName ? rawName : DEFAULT_TABLE_TITLE;

      // Open right away so the click always shows something.
      setDialog({ id, state: { status: "loading", title } });

      const update = (state: TableDialogState) =>
        setDialog((current) => (current?.id === id ? { id, state } : current));

      loadTable(payload, liveboardId).then(
        (table) =>
          update(
            table
              ? { status: "ready", title, table }
              : { status: "error", title, message: NO_DATA_MESSAGE },
          ),
        (error: unknown) => {
          console.error("[view-as-table]", errorMessage(error));
          update({ status: "error", title, message: LOAD_FAILED_MESSAGE });
        },
      );
    },
    [liveboardId],
  );

  const handleCloseDialog = useCallback(() => setDialog(null), []);

  // Only logs: the embed is never destroyed from here.
  const handleError = useCallback((error: unknown) => {
    const code = errorCode(error);
    const log = code && FATAL_ERROR_CODES.has(code) ? console.error : console.warn;
    log("[liveboard] Embed error:", code ?? "UNKNOWN", errorMessage(error));
  }, []);

  if (supportsSpotter2026_11 === undefined) {
    return <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />;
  }

  return (
    <div className="absolute inset-0">
      <LiveboardEmbed
        liveboardId={liveboardId}
        frameParams={FRAME_PARAMS}
        style={EMBED_STYLE}
        hiddenActions={HIDDEN_ACTIONS}
        customActions={CUSTOM_ACTIONS}
        onCustomAction={handleCustomAction}
        onError={handleError}
        // Always on: this is the option that turns on the Spotter 3 chat.
        updatedSpotterChatPrompt={true}
        {...(supportsSpotter2026_11
          ? { spotterExperienceVersion: SpotterExperienceVersion.SPOTTER_2026_11 }
          : {})}
      />
      {dialog && <TableDialog key={dialog.id} state={dialog.state} onClose={handleCloseDialog} />}
    </div>
  );
}
