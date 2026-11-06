import type { AnswerService, MessagePayload } from "@thoughtspot/visual-embed-sdk";
import {
  describeShape,
  FETCH_TABLE_ROWS,
  parseAnswerData,
  type AnswerTable,
} from "@/lib/thoughtspot/answer-table";

/** The SDK attaches `answerService` to the callback payload at runtime. */
export type CustomActionMessage = MessagePayload & { answerService?: AnswerService };

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA_ROUTE = "/api/thoughtspot/liveboard-data";

export const NO_DATA_MESSAGE = "This visualization has no data to show.";
export const LOAD_FAILED_MESSAGE = "The table could not be loaded. Please try again.";

/** Tries a source; logs only the structure of one that yields no rows. */
function tryParse(source: string, value: unknown): AnswerTable | undefined {
  const result = parseAnswerData(value);
  if (result.ok) return result.table;
  console.warn(`[view-as-table] ${source} returned no rows (${result.reason}):`, describeShape(value));
  return undefined;
}

async function fetchFromServer(liveboardId: string, vizId: string): Promise<unknown> {
  const response = await fetch(DATA_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liveboardId, vizId }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Data route returned ${response.status}`);
  return response.json();
}

/**
 * Gets the table for a custom action click, trying in order: the data on the
 * event, the answer service, then (only with a GUID vizId) the server route.
 * Resolves to `undefined` when no source had rows; rejects when a request failed
 * and nothing else produced rows.
 */
export async function loadTable(
  payload: CustomActionMessage,
  liveboardId: string,
): Promise<AnswerTable | undefined> {
  const fromEvent = tryParse("embedAnswerData", payload.data?.embedAnswerData);
  if (fromEvent) return fromEvent;

  let failed = false;

  if (payload.answerService) {
    try {
      const fromService = tryParse(
        "answerService",
        await payload.answerService.fetchData(0, FETCH_TABLE_ROWS),
      );
      if (fromService) return fromService;
    } catch (error) {
      failed = true;
      console.warn("[view-as-table] answerService failed:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  const vizId: unknown = payload.data?.vizId;
  if (typeof vizId === "string" && GUID.test(vizId)) {
    try {
      const fromServer = tryParse("liveboard-data route", await fetchFromServer(liveboardId, vizId));
      if (fromServer) return fromServer;
    } catch (error) {
      failed = true;
      console.warn("[view-as-table] data route failed:", error instanceof Error ? error.message : "Unknown error");
    }
  }

  if (failed) throw new Error(LOAD_FAILED_MESSAGE);
  return undefined;
}
