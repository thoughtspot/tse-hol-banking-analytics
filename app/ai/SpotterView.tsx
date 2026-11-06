"use client";

import dynamic from "next/dynamic";

const SpotterSkeleton = () => (
  <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />
);

// The Visual Embed SDK warns when loaded during server rendering, so the embed
// is only ever loaded in the browser.
const SpotterFrame = dynamic(() => import("./SpotterFrame"), {
  ssr: false,
  loading: SpotterSkeleton,
});

export default function SpotterView({ modelId }: { modelId: string }) {
  return <SpotterFrame modelId={modelId} />;
}
