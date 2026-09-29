import { defineHook } from "@directus/extensions-sdk";

const THE_GRAPH_SUBGRAPH_ID = "G39v7PFNz911KNWga8erpgei622XKQLW7P6JBmm6fC97";

interface SubgraphEndpoint {
  name: string;
  url: string;
  headers: Record<string, string>;
}

type GraphToken = { id: string; tokenId: string; owner: string };

/**
 * Gets The Graph API URL. The API key is sent as a Bearer header, not in the path:
 * Cloudflare blocks the key-in-path URL for our key + subgraph (403 from any IP).
 */
function getTheGraphApiUrl(gatewayUrl?: string): string {
  const base = (gatewayUrl || "https://gateway.thegraph.com").replace(/\/+$/, "");
  return `${base}/api/subgraphs/id/${THE_GRAPH_SUBGRAPH_ID}`;
}

/**
 * Subgraph endpoints in the order they are tried: The Graph gateway (needs THE_GRAPH_API_KEY), then
 * THE_GRAPH_FALLBACK_URL, our self-hosted graph-node serving the same deployment without an API key
 */
function getSubgraphEndpoints(env: any): SubgraphEndpoint[] {
  const endpoints: SubgraphEndpoint[] = [];
  if (env.THE_GRAPH_API_KEY) {
    endpoints.push({
      name: "The Graph gateway",
      url: getTheGraphApiUrl(env.THE_GRAPH_GATEWAY_URL),
      headers: { Authorization: `Bearer ${env.THE_GRAPH_API_KEY}` },
    });
  }
  if (env.THE_GRAPH_FALLBACK_URL) {
    endpoints.push({ name: "fallback graph-node", url: env.THE_GRAPH_FALLBACK_URL, headers: {} });
  }
  return endpoints;
}

/**
 * Fetches tokens from a subgraph endpoint with pagination
 * @param lastTokenId - The last tokenId from the previous batch (for pagination)
 * @param endpoint - The subgraph endpoint to query
 * @returns Promise with tokens array and last tokenId
 */
async function fetchTokensFromGraph(lastTokenId: number = 0, endpoint: SubgraphEndpoint): Promise<{ tokens: GraphToken[]; lastTokenId: number }> {
  const query = `
    query Tokens($lastTokenId: Int) {
      tokens(
        where: { revealed: true, tokenId_gt: $lastTokenId },
        orderBy: tokenId,
        orderDirection: asc,
        first: 1000
      ) {
        id
        tokenId
        owner
      }
    }
  `;

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        ...endpoint.headers,
        "Content-Type": "application/json",
        // Cloudflare blocks requests without a User-Agent (403 challenge page)
        "User-Agent": "codex-owner-sync/1.0 (+https://github.com/mocaOS/codex)",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { lastTokenId },
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      const isCloudflareBlock = body.includes("cloudflare") || body.includes("Attention Required");
      const detail = isCloudflareBlock
        ? "blocked by Cloudflare (IP or request flagged, not an auth error)"
        : body.slice(0, 500);
      throw new Error(`HTTP error! status: ${response.status} - ${detail}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    const tokens = result.data?.tokens || [];
    const lastId = tokens.length > 0 ? Number.parseInt(tokens[tokens.length - 1]?.tokenId || "0", 10) : lastTokenId;

    return { tokens, lastTokenId: lastId };
  } catch (error) {
    console.error(`Error fetching tokens from ${endpoint.name}:`, error);
    throw error;
  }
}

/**
 * Fetches a batch from the first endpoint that answers, starting with the one that answered the
 * previous batch, so a failing endpoint costs one failed request per run instead of one per batch
 */
async function fetchTokensWithFallback(lastTokenId: number, endpoints: SubgraphEndpoint[], startIndex: number): Promise<{ tokens: GraphToken[]; lastTokenId: number; endpointIndex: number }> {
  let lastError: unknown;
  for (const endpoint of [ ...endpoints.slice(startIndex), ...endpoints.slice(0, startIndex) ]) {
    try {
      const result = await fetchTokensFromGraph(lastTokenId, endpoint);
      return { ...result, endpointIndex: endpoints.indexOf(endpoint) };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Updates codex items with owner information from The Graph
 */
async function updateCodexOwners(services: any, getSchema: () => Promise<any>, logger: any, env: any) {
  logger.info("🔄 Starting codex owners update job...");

  const endpoints = getSubgraphEndpoints(env);
  if (endpoints.length === 0) {
    logger.error("❌ Neither THE_GRAPH_API_KEY nor THE_GRAPH_FALLBACK_URL is set. Skipping owner update.");
    return;
  }

  try {
    const schema = await getSchema();
    const { ItemsService } = services;

    // Check if codex collection exists
    if (!schema.collections.codex) {
      logger.warn("Codex collection not found in schema. Skipping owner update.");
      return;
    }

    const codexService = new ItemsService("codex", {
      schema,
      accountability: null,
    });

    let totalFetched = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    let lastTokenId = 0;
    let hasMore = true;
    let consecutiveFetchFailures = 0;
    let activeEndpoint = 0;
    const MAX_CONSECUTIVE_FETCH_FAILURES = 6;
    const FETCH_RETRY_DELAYS_MS = [2000, 5000, 10000, 20000, 40000, 60000];

    // Fetch all tokens in batches
    while (hasMore) {
      try {
        const { tokens, lastTokenId: newLastTokenId, endpointIndex } = await fetchTokensWithFallback(lastTokenId, endpoints, activeEndpoint);
        if (endpointIndex !== activeEndpoint) {
          logger.warn(`⚠️ ${endpoints[activeEndpoint]?.name} failed, continuing with ${endpoints[endpointIndex]?.name}`);
          activeEndpoint = endpointIndex;
        }
        consecutiveFetchFailures = 0;
        totalFetched += tokens.length;

        if (tokens.length === 0) {
          hasMore = false;
          break;
        }

        // Update codex items in batch
        for (const token of tokens) {
          try {
            const tokenId = Number.parseInt(token.tokenId, 10);
            if (Number.isNaN(tokenId)) {
              logger.warn(`Invalid tokenId: ${token.tokenId}`);
              totalErrors++;
              continue;
            }

            // Check if codex item exists
            const existing = await codexService.readByQuery({
              filter: { id: { _eq: tokenId } },
              limit: 1,
              fields: [ "id", "owner" ],
            });

            if (existing && existing.length > 0) {
              const codexItem = existing[0];
              // Only update if owner has changed
              if (codexItem.owner !== token.owner) {
                try {
                  await codexService.updateOne(tokenId, {
                    owner: token.owner,
                  });
                  totalUpdated++;
                } catch (updateError: any) {
                  // Check if error is due to missing owner field
                  const errorMessage = updateError?.message || String(updateError);
                  if (errorMessage.includes("owner") || errorMessage.includes("column") || errorMessage.includes("field")) {
                    logger.warn("Owner field not found in codex collection. Please add it to the schema first.");
                    hasMore = false; // Stop processing
                    break;
                  }
                  throw updateError; // Re-throw if it's a different error
                }
              }
            } else {
              logger.debug(`Codex item with id ${tokenId} not found. Skipping.`);
            }
          } catch (error) {
            logger.error(`Error updating codex item ${token.tokenId}:`, error);
            totalErrors++;
          }
        }

        // Check if we got less than 1000 tokens, meaning we're done
        if (tokens.length < 1000) {
          hasMore = false;
        } else {
          lastTokenId = newLastTokenId;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        consecutiveFetchFailures++;
        totalErrors++;
        if (consecutiveFetchFailures >= MAX_CONSECUTIVE_FETCH_FAILURES) {
          logger.error(`❌ ${consecutiveFetchFailures} consecutive batch fetches failed. Aborting owners update to prevent infinite retry loop. First error:`, error);
          break;
        }
        logger.error("Error fetching batch from all subgraph endpoints:", error);
        // Retry the same batch with growing backoff (Cloudflare blocks are often transient)
        await new Promise(resolve => setTimeout(resolve, FETCH_RETRY_DELAYS_MS[Math.min(consecutiveFetchFailures - 1, FETCH_RETRY_DELAYS_MS.length - 1)]));
      }
    }

    logger.info("✅ Codex owners update job completed!");
    logger.info(`   - Source: ${totalFetched > 0 ? endpoints[activeEndpoint]?.name : "none (all endpoints failed)"}`);
    logger.info(`   - Total tokens fetched: ${totalFetched}`);
    logger.info(`   - Total codex items updated: ${totalUpdated}`);
    logger.info(`   - Total errors: ${totalErrors}`);
  } catch (error) {
    logger.error("❌ Codex owners update job failed:", error);
    if (error instanceof Error) {
      logger.error(error.stack);
    }
  }
}

export default defineHook(({ schedule }, { services, getSchema, logger, env }) => {
  // Schedule the job to run every hour
  schedule("0 * * * *", async () => {
    await updateCodexOwners(services, getSchema, logger, env);
  });

  logger.info("📅 Codex owners update cron job scheduled (runs every hour)");
});
