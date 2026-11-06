import "server-only";

import {
  createBearerAuthenticationConfig,
  ThoughtSpotRestApi,
} from "@thoughtspot/rest-api-sdk";
import { thoughtSpotHost } from "@/lib/thoughtspot/host";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

export type LiveboardSummary = {
  id: string;
  name: string;
  description: string;
  author: string;
  /** Last modified time in epoch milliseconds, when ThoughtSpot reports it. */
  modifiedAt: number | undefined;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** `metadata_header` is untyped in the REST SDK, so read it defensively. */
function toSummary(
  id: string,
  fallbackName: string,
  header: unknown,
): LiveboardSummary {
  const h = (typeof header === "object" && header !== null ? header : {}) as Record<
    string,
    unknown
  >;
  const modified = h.modified;
  return {
    id,
    name: text(h.name) || fallbackName || "Untitled liveboard",
    description: text(h.description),
    author: text(h.authorDisplayName) || text(h.authorName) || "Unknown",
    modifiedAt: typeof modified === "number" ? modified : undefined,
  };
}

/** Lists every liveboard the configured lab user can see, newest first. */
export async function listLiveboards(): Promise<LiveboardSummary[]> {
  const host = thoughtSpotHost(process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST);
  if (!host) throw new Error("NEXT_PUBLIC_THOUGHTSPOT_HOST is missing or invalid");

  const { token } = await getThoughtSpotToken();
  const client = new ThoughtSpotRestApi(
    createBearerAuthenticationConfig(`https://${host}`, async () => token),
  );

  const liveboards: LiveboardSummary[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const results = await client.searchMetadata({
      metadata: [{ type: "LIVEBOARD" }],
      include_headers: true,
      record_offset: page * PAGE_SIZE,
      record_size: PAGE_SIZE,
      sort_options: { field_name: "MODIFIED", order: "DESC" },
    });
    for (const item of results) {
      if (!item.metadata_id) continue;
      liveboards.push(
        toSummary(item.metadata_id, item.metadata_name ?? "", item.metadata_header),
      );
    }
    if (results.length < PAGE_SIZE) break;
  }
  return liveboards;
}
