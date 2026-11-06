import type { Metadata } from "next";
import PageHeader from "../components/PageHeader";
import { SendIcon, SparkleIcon } from "../components/icons";

export const metadata: Metadata = {
  title: "Bankalytics AI",
};

const SUGGESTED_QUESTIONS = [
  "What was credit card spend by category last quarter?",
  "Which regions grew checking balances the fastest?",
  "Show savings attrition by customer tenure",
  "Compare mortgage originations to last year",
] as const;

export default function BankalyticsAiPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conversational analytics"
        title="Bankalytics AI"
        description="Ask questions about the bank's data in plain English and get answers with charts."
        icon={<SparkleIcon className="size-7" />}
      />
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
        <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="rounded-2xl bg-gradient-to-br from-navy-900 to-brand-500 p-3.5 text-white">
              <SparkleIcon className="size-7" />
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              What would you like to know?
            </h2>
            <p className="mt-1 text-sm text-muted">
              Try one of these to get started.
            </p>
            <ul className="mt-6 grid w-full gap-3 sm:grid-cols-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <li
                  key={question}
                  className="rounded-xl border border-slate-200 bg-surface px-4 py-3 text-left text-sm text-ink"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-slate-200 p-4">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-surface py-1.5 pl-5 pr-1.5">
              <label htmlFor="ai-question" className="sr-only">
                Ask a question
              </label>
              <input
                id="ai-question"
                type="text"
                disabled
                placeholder="Bankalytics AI is not connected yet"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted disabled:cursor-not-allowed"
              />
              <button
                type="button"
                disabled
                aria-label="Send question"
                className="rounded-full bg-navy-900 p-2.5 text-white disabled:opacity-40"
              >
                <SendIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
