"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChatIcon, CloseIcon, SendIcon } from "../icons";
import { useBanksy } from "./BanksyProvider";

export default function BanksyChat() {
  const { isOpen, isThinking, messages, closeChat, ask } = useBanksy();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeChat();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeChat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = draft;
    setDraft("");
    void ask(question);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="banksy-chat-title"
      className="fixed inset-x-4 bottom-4 z-40 flex max-h-[min(640px,calc(100vh-7rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-navy-950/20 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px]"
    >
      <div className="flex items-center gap-3 bg-navy-900 px-4 py-3 text-white">
        <span className="rounded-lg bg-white/10 p-1.5 ring-1 ring-white/15">
          <ChatIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="banksy-chat-title" className="text-sm font-semibold">
            Banksy
          </h2>
          <p className="text-xs text-brand-200">Your banking data assistant</p>
        </div>
        <button
          type="button"
          onClick={closeChat}
          aria-label="Close Banksy chat"
          className="rounded-full p-1.5 text-brand-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="size-5" />
        </button>
      </div>

      <div className="min-h-48 flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            Ask Banksy anything about deposits, cards, lending, and more.
          </p>
        )}
        {messages.map(({ id, role, content }) => (
          <div
            key={id}
            className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                role === "user"
                  ? "rounded-br-md bg-brand-500 text-white"
                  : "rounded-bl-md border border-slate-200 bg-white text-ink"
              }`}
            >
              {content}
            </p>
          </div>
        ))}
        {isThinking && (
          <p className="text-xs text-muted" aria-live="polite">
            Banksy is thinking…
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-200 p-3"
      >
        <label htmlFor="banksy-chat-input" className="sr-only">
          Ask Banksy a question
        </label>
        <input
          ref={inputRef}
          id="banksy-chat-input"
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask a question…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-surface px-4 py-2 text-sm outline-none placeholder:text-muted focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isThinking}
          aria-label="Send question"
          className="rounded-full bg-navy-900 p-2.5 text-white transition-colors hover:bg-navy-800 disabled:opacity-40"
        >
          <SendIcon className="size-4" />
        </button>
      </form>
    </div>
  );
}
