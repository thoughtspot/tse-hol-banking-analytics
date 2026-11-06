import "server-only";

import {
  createBearerAuthenticationConfig,
  ThoughtSpotRestApi,
} from "@thoughtspot/rest-api-sdk";
import { thoughtSpotHost } from "@/lib/thoughtspot/host";
import { getThoughtSpotToken } from "@/lib/thoughtspot/token-service";

const BANKING_MODEL_NAME = "Banking";
const SEARCH_PAGE_SIZE = 50;

/**
 * Finds the Banking model by exact name and returns its id. The name pattern
 * search is a "contains" match, so results are filtered to the exact name.
 * Throws when it is missing or ambiguous rather than guessing.
 */
export async function getBankingModelId(): Promise<string> {
  const host = thoughtSpotHost(process.env.NEXT_PUBLIC_THOUGHTSPOT_HOST);
  if (!host) throw new Error("NEXT_PUBLIC_THOUGHTSPOT_HOST is missing or invalid");

  const { token } = await getThoughtSpotToken();
  const client = new ThoughtSpotRestApi(
    createBearerAuthenticationConfig(`https://${host}`, async () => token),
  );

  const results = await client.searchMetadata({
    metadata: [{ type: "LOGICAL_TABLE", name_pattern: BANKING_MODEL_NAME }],
    record_size: SEARCH_PAGE_SIZE,
  });
  const matches = results.filter(
    (item) => item.metadata_name === BANKING_MODEL_NAME && item.metadata_id,
  );
  if (matches.length !== 1 || !matches[0].metadata_id) {
    throw new Error(
      `Expected exactly one "${BANKING_MODEL_NAME}" model, found ${matches.length}`,
    );
  }
  return matches[0].metadata_id;
}
