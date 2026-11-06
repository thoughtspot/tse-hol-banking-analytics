"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { BanksyEvent, WireMessage } from "@/lib/banksy/protocol";
import BanksyChat from "./BanksyChat";
import { askBanksy, BanksyRequestError, type BanksyMessage } from "./askBanksy";

/** What the agent is doing right now, and when the request began. */
export type BanksyStatus = {
  label: string;
  /** `performance.now()` at the moment the question was sent. */
  startedAt: number;
};

type BanksyContextValue = {
  isOpen: boolean;
  isThinking: boolean;
  status: BanksyStatus | null;
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

function toolLabel(tool: string): string {
  return tool.replace(/_/g, " ");
}

function statusLabel(event: BanksyEvent): string | undefined {
  switch (event.type) {
    case "status":
      if (event.phase === "connecting") return "Connecting…";
      if (event.phase === "thinking") return "Thinking…";
      return `Running ${toolLabel(event.tool ?? "tool")}…`;
    case "progress": {
      const detail =
        event.message ??
        (event.total ? `${event.progress} of ${event.total}` : `step ${event.progress}`);
      return `${toolLabel(event.tool)}: ${detail}`;
    }
    case "text":
      return "Writing answer…";
    default:
      return undefined;
  }
}

export default function BanksyProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<BanksyStatus | null>(null);
  const [messages, setMessages] = useState<BanksyMessage[]>([]);

  // The full transcript (including tool calls and results) lives here and is
  // sent with every request; the server keeps no conversation state.
  const transcriptRef = useRef<WireMessage[]>([]);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);

  const ask = useCallback(async (question: string) => {
    const content = question.trim();
    if (!content || busyRef.current) return;
    busyRef.current = true;

    const startedAt = performance.now();
    const controller = new AbortController();
    abortRef.current = controller;

    transcriptRef.current = [...transcriptRef.current, { role: "user", content }];
    setIsOpen(true);
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content }]);
    setStatus({ label: "Connecting…", startedAt });

    let replyId: string | undefined;
    let startNewParagraph = false;

    function appendText(delta: string) {
      if (!replyId) {
        const id = crypto.randomUUID();
        replyId = id;
        setMessages((prev) => [...prev, { id, role: "assistant", content: delta }]);
        return;
      }
      const id = replyId;
      const text = startNewParagraph ? `\n\n${delta}` : delta;
      startNewParagraph = false;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)),
      );
    }

    function showError(message: string) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: message, isError: true },
      ]);
    }

    function handleEvent(event: BanksyEvent) {
      const label = statusLabel(event);
      if (label) setStatus({ label, startedAt });

      switch (event.type) {
        case "text":
          appendText(event.delta);
          break;
        case "step":
          startNewParagraph = replyId !== undefined;
          break;
        case "turn":
          transcriptRef.current = [...transcriptRef.current, ...event.messages];
          break;
        case "error":
          showError(event.message);
          break;
        default:
          break;
      }
    }

    try {
      await askBanksy(transcriptRef.current, handleEvent, controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) {
        showError(
          error instanceof BanksyRequestError
            ? error.message
            : "Banksy ran into a problem. Please try again.",
        );
      }
    } finally {
      busyRef.current = false;
      setStatus(null);
    }
  }, []);

  const isThinking = status !== null;

  const value = useMemo(
    () => ({ isOpen, isThinking, status, messages, openChat, closeChat, ask }),
    [isOpen, isThinking, status, messages, openChat, closeChat, ask],
  );

  return (
    <BanksyContext value={value}>
      {children}
      <BanksyChat />
    </BanksyContext>
  );
}
