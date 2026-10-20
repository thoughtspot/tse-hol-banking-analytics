import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CardIcon,
  ChartIcon,
  CheckingIcon,
  HomeLoanIcon,
  SavingsIcon,
  SparkleIcon,
  WealthIcon,
} from "./components/icons";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const REPORTING_PERIOD = "Q3 2026";

const HEADLINE_METRICS = [
  { label: "Total deposits", value: "$412.6B", change: "+3.4% QoQ" },
  { label: "Active cardholders", value: "18.4M", change: "+1.2% QoQ" },
  { label: "Net interest margin", value: "3.12%", change: "+6 bps QoQ" },
  { label: "Digital adoption", value: "78.5%", change: "+2.1 pts QoQ" },
] as const;

const LINES_OF_BUSINESS: {
  name: string;
  description: string;
  metric: string;
  metricLabel: string;
  icon: IconComponent;
}[] = [
  {
    name: "Credit Cards",
    description: "Spend, revolve rates, rewards redemption, and delinquency.",
    metric: "$38.9B",
    metricLabel: "Quarterly purchase volume",
    icon: CardIcon,
  },
  {
    name: "Checking",
    description: "Account growth, primacy, direct deposit, and fee income.",
    metric: "11.2M",
    metricLabel: "Active accounts",
    icon: CheckingIcon,
  },
  {
    name: "Savings & CDs",
    description: "Balances, rate sensitivity, maturities, and attrition.",
    metric: "$146.3B",
    metricLabel: "Savings and CD balances",
    icon: SavingsIcon,
  },
  {
    name: "Mortgages & Lending",
    description: "Originations, pipeline, auto and personal loan performance.",
    metric: "$4.7B",
    metricLabel: "Quarterly originations",
    icon: HomeLoanIcon,
  },
  {
    name: "Small Business",
    description: "Business checking, merchant services, and credit lines.",
    metric: "862K",
    metricLabel: "Business clients",
    icon: BriefcaseIcon,
  },
  {
    name: "Wealth Management",
    description: "Assets under management, advisor book, and net flows.",
    metric: "$94.1B",
    metricLabel: "Assets under management",
    icon: WealthIcon,
  },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-700 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-brand-500/20 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-200">
              Enterprise Analytics
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Insight across every account, card, and customer.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-100/90">
              One place to understand performance across consumer and business
              banking — from card spend to deposit growth to lending pipelines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-brand-500/30 transition-colors hover:bg-brand-600"
              >
                Explore Analytics
                <ArrowRightIcon className="size-4" />
              </Link>
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold ring-1 ring-white/25 transition-colors hover:bg-white/15"
              >
                <SparkleIcon className="size-4" />
                Ask Bankalytics AI
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Bank at a glance</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-brand-200">
                {REPORTING_PERIOD}
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {HEADLINE_METRICS.map(({ label, value, change }) => (
                <div key={label} className="rounded-xl bg-navy-950/40 p-4">
                  <dt className="text-xs text-brand-200">{label}</dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                    {value}
                  </dd>
                  <dd className="mt-1 text-xs font-medium text-emerald-300">
                    {change}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Lines of business
            </h2>
            <p className="mt-1 text-muted">
              Performance snapshots for each product family.
            </p>
          </div>
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-navy-800"
          >
            View all dashboards
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LINES_OF_BUSINESS.map(
            ({ name, description, metric, metricLabel, icon: Icon }) => (
              <li
                key={name}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-brand-50 p-2.5 text-brand-600 ring-1 ring-brand-100">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-semibold">{name}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted">{description}</p>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-navy-900">
                    {metric}
                  </p>
                  <p className="text-xs text-muted">{metricLabel}</p>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-2">
          <FeaturePanel
            href="/analytics"
            icon={ChartIcon}
            title="Analytics"
            description="Curated dashboards for portfolio health, card spend, deposit trends, and customer segments — with drill-down to the account level."
            cta="Open Analytics"
          />
          <FeaturePanel
            href="/ai"
            icon={SparkleIcon}
            title="Bankalytics AI"
            description="Ask questions in plain English — “Which regions grew checking balances fastest this quarter?” — and get answers with charts in seconds."
            cta="Start a conversation"
          />
        </div>
      </section>
    </>
  );
}

function FeaturePanel({
  href,
  icon: Icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: IconComponent;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl bg-gradient-to-br from-brand-50 to-white p-8 ring-1 ring-brand-100 transition-shadow hover:shadow-lg hover:shadow-brand-500/10"
    >
      <span className="w-fit rounded-xl bg-navy-900 p-3 text-white">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 flex-1 text-muted">{description}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
        {cta}
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
