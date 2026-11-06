import "server-only";

import {
  createBearerAuthenticationConfig,
  ThoughtSpotRestApi,
} from "@thoughtspot/rest-api-sdk";
import { FETCH_TABLE_ROWS } from "@/lib/thoughtspot/answer-table";
import { thoughtSpotHost } from "@/lib/thoughtspot/host";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";

export type VisualizationRows = {
  column_names: string[];
  data_rows: unknown[][];
};

/** Fetches the first rows of one visualization of a liveboard through the REST API. */
export async function fetchVisualizationRows(
  liveboardId: string,
  vizId: string,
): Promise<VisualizationRows> {
  const host = thoughtSpotHost(process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST);
  if (!host) throw new Error("NEXT_PUBLIC_THOUGHTSPOT_HOST is missing or invalid");

  const { token } = await getThoughtSpotToken();
  const client = new ThoughtSpotRestApi(
    createBearerAuthenticationConfig(`https://${host}`, async () => token),
  );
  const response = await client.fetchLiveboardData({
    metadata_identifier: liveboardId,
    visualization_identifiers: [vizId],
    data_format: "COMPACT",
    record_offset: 0,
    record_size: FETCH_TABLE_ROWS,
  });

  const content = response.contents?.[0];
  return {
    column_names: content?.column_names ?? [],
    data_rows: (content?.data_rows ?? []).filter(Array.isArray).slice(0, FETCH_TABLE_ROWS),
  };
}
