import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PageHeader from "../components/PageHeader";
import { ChartIcon } from "../components/icons";
import { listLiveboards } from "@/lib/thoughtspot/liveboards";

export const metadata: Metadata = {
  title: "Analytics",
};

const SKELETON_TILES = 6;

const updatedFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

function formatUpdated(epochMs: number | undefined): string {
  return epochMs === undefined ? "Unknown" : `${updatedFormat.format(epochMs)} UTC`;
}

async function LiveboardTiles() {
  let liveboards;
  try {
    liveboards = await listLiveboards();
  } catch (error) {
    console.error(
      "[analytics] Could not list liveboards:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return (
      <p role="alert" className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-muted">
        Liveboards are unavailable right now. Please try again shortly.
      </p>
    );
  }

  if (liveboards.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-muted">
        No liveboards are available to you yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {liveboards.map(({ id, name, description, author, modifiedAt }) => (
        <li key={id} className="flex">
          <Link
            href={`/analytics/${encodeURIComponent(id)}`}
            className="group flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] active:shadow-sm"
          >
            <h2 className="font-semibold transition-colors group-hover:text-brand-600">
              {name}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-muted">
              {description || "No description provided."}
            </p>
            <dl className="mt-auto grid gap-1 pt-5 text-xs text-muted">
              <div className="flex gap-1.5">
                <dt className="font-medium">Author</dt>
                <dd className="min-w-0 truncate">{author}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="font-medium">Updated</dt>
                <dd>{formatUpdated(modifiedAt)}</dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TilesFallback() {
  return (
    <ul aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_TILES }, (_, index) => (
        <li
          key={index}
          className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </ul>
  );
}

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboards"
        title="Analytics"
        description="Explore the liveboards available to you across cards, deposits, lending, and customers."
        icon={<ChartIcon className="size-7" />}
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <Suspense fallback={<TilesFallback />}>
          <LiveboardTiles />
        </Suspense>
      </section>
    </>
  );
}
