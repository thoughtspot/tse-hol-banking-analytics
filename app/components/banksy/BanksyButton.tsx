"use client";

import { ChatIcon } from "../icons";
import { useBanksy } from "./BanksyProvider";

export default function BanksyButton() {
  const { isOpen, openChat, closeChat } = useBanksy();

  return (
    <button
      type="button"
      onClick={isOpen ? closeChat : openChat}
      aria-label={isOpen ? "Close Banksy chat" : "Open Banksy chat"}
      aria-expanded={isOpen}
      className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
    >
      <ChatIcon className="size-5" />
      <span className="hidden sm:inline">Banksy</span>
    </button>
  );
}
