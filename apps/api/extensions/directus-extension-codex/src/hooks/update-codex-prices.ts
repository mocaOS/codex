import { defineHook } from "@directus/extensions-sdk";
import config from "@local/config";

interface AdoptionPrice {
  tokenId: string;
  price: {
    value: string;
    currency: string;
    decimals: number;
  };
}

interface AdoptionDetailsResponse {
  data: Array<{
    key: string;
    value: string; // JSON stringified array of AdoptionPrice[]
  }>;
}

/**
 * Formats a price value from wei to ETH with max 5 decimal places
 * @param value - The price value as a string (in wei)
 * @param decimals - Number of decimals (typically 18 for ETH)
 * @param currency - Currency symbol (e.g., "ETH")
 * @returns Formatted price string like "1.3372 ETH"
 */
function formatPrice(value: string, decimals: number, currency: string): string {
  const numericValue = BigInt(value);
  const divisor = BigInt(10) ** BigInt(decimals);
  const wholePart = numericValue / divisor;
  const fractionalPart = numericValue % divisor;

  // If there's no fractional part, return whole number
  if (fractionalPart === BigInt(0)) {
    return `${wholePart.toString()} ${currency}`;
  }

  // Convert fractional part to decimal string with leading zeros
  const fractionalString = fractionalPart.toString().padStart(decimals, "0");

  // Take up to 5 digits, removing leading zeros
  let significantDigits = fractionalString.replace(/^0+/, "");

  // Limit to 5 digits
  if (significantDigits.length > 5) {
    significantDigits = significantDigits.substring(0, 5);
  }

  // Remove trailing zeros
  significantDigits = significantDigits.replace(/0+$/, "");

  if (significantDigits === "") {
    return `${wholePart.toString()} ${currency}`;
  }

  return `${wholePart.toString()}.${significantDigits} ${currency}`;
}

/**
 * Fetches adoption details from MOCA API
 */
async function fetchAdoptionDetails(baseUrl: string): Promise<AdoptionPrice[]> {
  const url = `${baseUrl}/items/settings?filter={"key":{"_eq":"adoption_details"}}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: AdoptionDetailsResponse = await response.json();

  if (!result.data || result.data.length === 0) {
    return [];
  }

  // Parse the JSON string value
  const adoptionDetailsJson = result.data[0]?.value;
  if (!adoptionDetailsJson) {
    return [];
  }

  const adoptionDetails: AdoptionPrice[] = JSON.parse(adoptionDetailsJson);
  return adoptionDetails;
}

/**
 * Filters adoption details to keep only the lowest price for each tokenId
 */
function getLowestPricesByTokenId(adoptionDetails: AdoptionPrice[]): Map<string, AdoptionPrice> {
  const lowestPrices = new Map<string, AdoptionPrice>();

  for (const detail of adoptionDetails) {
    const tokenId = detail.tokenId;
    const currentPrice = BigInt(detail.price.value);

    const existing = lowestPrices.get(tokenId);
    if (!existing) {
      // First entry for this tokenId
      lowestPrices.set(tokenId, detail);
    } else {
      // Compare prices and keep the lowest
      const existingPrice = BigInt(existing.price.value);
      if (currentPrice < existingPrice) {
        lowestPrices.set(tokenId, detail);
      }
    }
  }

  return lowestPrices;
}

/**
 * Updates codex items with prices from adoption details
 */
async function updateCodexPrices(services: any, getSchema: () => Promise<any>, logger: any) {
  logger.info("💰 Starting codex prices update job...");

  const baseUrl = config.moca?.api?.baseUrl;
  if (!baseUrl) {
    logger.error("❌ moca.api.baseUrl is not configured. Skipping price update.");
    return;
  }

  try {
    const schema = await getSchema();
    const { ItemsService } = services;

    // Check if codex collection exists
    if (!schema.collections.codex) {
      logger.warn("Codex collection not found in schema. Skipping price update.");
      return;
    }

    const codexService = new ItemsService("codex", {
      schema,
      accountability: null,
    });

    // Clear all prices first
    logger.info("Clearing all existing prices from codex items...");
    try {
      // Fetch all codex items that have a price set
      const itemsWithPrice = await codexService.readByQuery({
        filter: {
          price: {
            _nnull: true,
          },
        },
        fields: [ "id" ],
        limit: -1, // Get all items
      });

      const itemsToClear = Array.isArray(itemsWithPrice) ? itemsWithPrice : [];
      let totalCleared = 0;

      // Clear prices in batches
      for (const item of itemsToClear) {
        try {
          await codexService.updateOne(item.id, {
            price: null,
          });
          totalCleared++;
        } catch (clearError: any) {
          logger.warn(`Error clearing price for codex item ${item.id}:`, clearError);
        }
      }

      logger.info(`Cleared prices from ${totalCleared} codex items`);
    } catch (clearAllError: any) {
      logger.warn("Error clearing all prices (non-fatal, continuing with updates):", clearAllError);
    }

    // Fetch adoption details from API
    logger.info("Fetching adoption details from MOCA API...");
    const adoptionDetails = await fetchAdoptionDetails(baseUrl);
    logger.info(`Fetched ${adoptionDetails.length} adoption price entries`);

    // Filter to get only the lowest price for each tokenId
    logger.info("Filtering to lowest prices per tokenId...");
    const lowestPricesMap = getLowestPricesByTokenId(adoptionDetails);
    const uniqueTokenIds = lowestPricesMap.size;
    const duplicatesRemoved = adoptionDetails.length - uniqueTokenIds;
    if (duplicatesRemoved > 0) {
      logger.info(`Found ${duplicatesRemoved} duplicate listings, keeping lowest prices for ${uniqueTokenIds} unique tokenIds`);
    }

    let totalUpdated = 0;
    let totalErrors = 0;
    let totalNotFound = 0;

    // Update codex items with prices (only lowest price per tokenId)
    for (const adoptionDetail of lowestPricesMap.values()) {
      try {
        const tokenId = Number.parseInt(adoptionDetail.tokenId, 10);
        if (Number.isNaN(tokenId)) {
          logger.warn(`Invalid tokenId: ${adoptionDetail.tokenId}`);
          totalErrors++;
          continue;
        }

        // Format the price
        const formattedPrice = formatPrice(
          adoptionDetail.price.value,
          adoptionDetail.price.decimals,
          adoptionDetail.price.currency,
        );

        // Check if codex item exists
        const existing = await codexService.readByQuery({
          filter: { id: { _eq: tokenId } },
          limit: 1,
          fields: [ "id", "price" ],
        });

        if (existing && existing.length > 0) {
          try {
            await codexService.updateOne(tokenId, {
              price: formattedPrice,
            });
            totalUpdated++;
          } catch (updateError: any) {
            // Check if error is due to missing price field
            const errorMessage = updateError?.message || String(updateError);
            if (errorMessage.includes("price") || errorMessage.includes("column") || errorMessage.includes("field")) {
              logger.warn("Price field not found in codex collection. Please add it to the schema first.");
              break;
            }
            throw updateError; // Re-throw if it's a different error
          }
        } else {
          totalNotFound++;
          logger.debug(`Codex item with id ${tokenId} not found. Skipping.`);
        }
      } catch (error) {
        logger.error(`Error updating codex item ${adoptionDetail.tokenId}:`, error);
        totalErrors++;
      }
    }

    logger.info("✅ Codex prices update job completed!");
    logger.info(`   - Total adoption details fetched: ${adoptionDetails.length}`);
    logger.info(`   - Total codex items updated: ${totalUpdated}`);
    logger.info(`   - Total items not found: ${totalNotFound}`);
    logger.info(`   - Total errors: ${totalErrors}`);
  } catch (error) {
    logger.error("❌ Codex prices update job failed:", error);
    if (error instanceof Error) {
      logger.error(error.stack);
    }
  }
}

export default defineHook(({ schedule }, { services, getSchema, logger }) => {
  // Schedule the job to run every minute
  schedule("* * * * *", async () => {
    await updateCodexPrices(services, getSchema, logger);
  });

  logger.info("📅 Codex prices update cron job scheduled (runs every minute)");
});
