"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import BanksyChat from "./BanksyChat";
import { askBanksy, type BanksyMessage } from "./askBanksy";

type BanksyContextValue = {
  isOpen: boolean;
  isThinking: boolean;
  messages: readonly BanksyMessage[];
  openChat: () => void;
  closeChat: () => void;
  ask: (question: string) => Promise<void>;
};

const BanksyContext = createContext<BanksyContextValue | null>(null);

export function useBanksy() {
  const context = useContext(BanksyContext);
  if (!context) {
    throw new Error("useBanksy must be used within a BanksyProvider");
  }
  return context;
}

export default function BanksyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<BanksyMessage[]>([]);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const ask = useCallback(
    async (question: string) => {
      const content = question.trim();
      if (!content) return;

      const userMessage: BanksyMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      setIsOpen(true);
      setMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);
      try {
        const reply = await askBanksy(content, [...messages, userMessage]);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: reply },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages],
  );

  const value = useMemo(
    () => ({ isOpen, isThinking, messages, openChat, closeChat, ask }),
    [isOpen, isThinking, messages, openChat, closeChat, ask],
  );

  return (
    <BanksyContext value={value}>
      {children}
      <BanksyChat />
    </BanksyContext>
  );
}
