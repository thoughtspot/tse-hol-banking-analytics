"use client";

import dynamic from "next/dynamic";

// The Visual Embed SDK warns when loaded during server rendering, so the embed
// is only ever loaded in the browser.
const LiveboardFrame = dynamic(() => import("./LiveboardFrame"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />,
});

export default function LiveboardView({ liveboardId }: { liveboardId: string }) {
  return <LiveboardFrame liveboardId={liveboardId} />;
}
