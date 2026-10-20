"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon, ChatIcon } from "../icons";
import { useBanksy } from "./BanksyProvider";

export default function BanksyBar() {
  const { ask, openChat } = useBanksy();
  const [question, setQuestion] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      openChat();
      return;
    }
    void ask(question);
    setQuestion("");
  }

  return (
    <section className="border-b border-slate-200 bg-white">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
      >
        <label
          htmlFor="banksy-bar-input"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-navy-900"
        >
          <span className="rounded-lg bg-brand-50 p-1.5 text-brand-600 ring-1 ring-brand-100">
            <ChatIcon className="size-5" />
          </span>
          Ask Banksy
        </label>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-surface py-1.5 pl-5 pr-1.5 focus-within:border-brand-500">
          <input
            id="banksy-bar-input"
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="e.g. Which regions grew checking balances fastest this quarter?"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
          >
            Go
            <ArrowRightIcon className="size-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
