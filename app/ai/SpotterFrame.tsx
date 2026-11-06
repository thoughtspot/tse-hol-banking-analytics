"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HostEvent,
  SpotterEmbed,
  useEmbedRef,
} from "@thoughtspot/visual-embed-sdk/react";
import { whenThoughtSpotInitialized } from "../components/thoughtspot/sdk-ready";
import { SparkleIcon } from "../components/icons";

// Each question uses only columns of the Banking model.
const STARTER_PROMPTS = [
  "Show current checking balance by customer region",
  "Which customer states have the highest current savings balance?",
  "Show number of customers by customer income group",
  "Compare average customer credit score by customer age group",
  "Show savings growth ($) by statement date monthly",
  "What is the current mortgage loan balance by customer credit rating?",
] as const;

// Module constants keep the embed's props referentially stable so it is never rebuilt.
const EMBED_STYLE = { height: "100%" };
const SIDEBAR_CONFIG = {
  enablePastConversationsSidebar: true,
  spotterSidebarDefaultExpanded: false,
  spotterSidebarTitle: "Chat history",
  spotterNewChatButtonTitle: "New conversation",
};

function errorMessage(error: unknown): string {
  if (typeof error !== "object" || error === null) return "Unknown error";
  const { message } = error as { message?: unknown };
  return typeof message === "string" ? message : "Unknown error";
}

export default function SpotterFrame({ modelId }: { modelId: string }) {
  const embedRef = useEmbedRef<typeof SpotterEmbed>();
  const [sdkReady, setSdkReady] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void whenThoughtSpotInitialized().then(() => {
      if (!cancelled) setSdkReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoad = useCallback(() => setEmbedLoaded(true), []);

  const handleError = useCallback((error: unknown) => {
    console.warn("[spotter] Embed error:", errorMessage(error));
  }, []);

  const sendPrompt = useCallback(
    (query: string) => {
      embedRef.current
        ?.trigger(HostEvent.SpotterSearch, { query, executeSearch: true })
        .catch((error: unknown) => {
          console.warn("[spotter] Could not send the prompt:", errorMessage(error));
        });
    },
    [embedRef],
  );

  return (
    <>
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-2" aria-label="Starter prompts">
          {STARTER_PROMPTS.map((prompt) => (
            <li key={prompt}>
              <button
                type="button"
                disabled={!embedLoaded}
                onClick={() => sendPrompt(prompt)}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3.5 py-1.5 text-sm text-ink transition hover:border-brand-500 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <SparkleIcon className="size-3.5" />
                {prompt}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative min-h-[32rem] flex-1">
        {sdkReady ? (
          <div className="absolute inset-0">
            <SpotterEmbed
              ref={embedRef}
              worksheetId={modelId}
              disableSourceSelection={true}
              hideSampleQuestions={true}
              updatedSpotterChatPrompt={true}
              spotterSidebarConfig={SIDEBAR_CONFIG}
              style={EMBED_STYLE}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        ) : (
          <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />
        )}
      </div>
    </>
  );
}
