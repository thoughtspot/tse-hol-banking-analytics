import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import { ChartIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Analytics",
};

const DASHBOARDS = [
  {
    title: "Portfolio Overview",
    description: "Balances, revenue, and growth across all lines of business.",
  },
  {
    title: "Credit Card Performance",
    description: "Spend by category, revolve rates, rewards, and delinquency.",
  },
  {
    title: "Deposit Trends",
    description: "Checking and savings inflows, outflows, and rate sensitivity.",
  },
  {
    title: "Customer Segments",
    description: "Household profitability, product penetration, and churn risk.",
  },
] as const;

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Dashboards"
        title="Analytics"
        description="Explore curated dashboards across cards, deposits, lending, and customers."
        icon={<ChartIcon className="size-7" />}
      />
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <ul className="grid gap-5 sm:grid-cols-2">
          {DASHBOARDS.map(({ title, description }) => (
            <li
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-semibold">{title}</h2>
                <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 ring-1 ring-brand-100">
                  Coming soon
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{description}</p>
              <div
                aria-hidden="true"
                className="mt-5 h-36 rounded-xl border border-dashed border-slate-200 bg-surface"
              />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
