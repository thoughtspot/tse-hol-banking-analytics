import type { Metadata } from "next";
import { Suspense } from "react";
import PageHeader from "../components/PageHeader";
import { SparkleIcon } from "../components/icons";
import { getBankingModelId } from "@/lib/thoughtspot/banking-model";
import SpotterView from "./SpotterView";

export const metadata: Metadata = {
  title: "Bankalytics AI",
};

const LOAD_FAILED_MESSAGE = "Bankalytics AI could not be loaded. Please try again shortly.";

function SpotterFallback() {
  return <div className="relative min-h-[32rem] flex-1 animate-pulse bg-surface" aria-hidden="true" />;
}

async function Spotter() {
  let modelId: string;
  try {
    modelId = await getBankingModelId();
  } catch (error) {
    console.error("[ai] Banking model lookup failed:", error instanceof Error ? error.message : "unknown");
    return (
      <p role="alert" className="px-4 py-10 text-center text-sm text-muted sm:px-6">
        {LOAD_FAILED_MESSAGE}
      </p>
    );
  }
  return <SpotterView modelId={modelId} />;
}

export default function BankalyticsAiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conversational analytics"
        title="Bankalytics AI"
        description="Ask about customer balances, savings and checking growth, credit ratings, and product holdings, and get answers with charts."
        icon={<SparkleIcon className="size-7" />}
      />
      <div className="flex flex-1 flex-col">
        <Suspense fallback={<SpotterFallback />}>
          <Spotter />
        </Suspense>
      </div>
    </>
  );
}
