import type { Metadata } from "next";
import { Suspense } from "react";
import LiveboardView from "./LiveboardView";

export const metadata: Metadata = {
  title: "Liveboard",
};

async function LiveboardContent({
  params,
}: {
  params: PageProps<"/analytics/[liveboardId]">["params"];
}) {
  const { liveboardId } = await params;
  return <LiveboardView liveboardId={liveboardId} />;
}

export default function LiveboardPage({
  params,
}: PageProps<"/analytics/[liveboardId]">) {
  return (
    <div className="relative flex-1">
      <Suspense
        fallback={
          <div className="absolute inset-0 animate-pulse bg-surface" aria-hidden="true" />
        }
      >
        <LiveboardContent params={params} />
      </Suspense>
    </div>
  );
}
