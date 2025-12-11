import config from "@local/config";

export default {
  id: "tokens-by-owner",
  handler: (router: any, { services, getSchema, env }: any) => {
    router.get("/:address", async (req: any, res: any) => {
      try {
        const { address } = req.params;

        if (!address) {
          return res.status(400).json({
            error: "Address parameter is required",
          });
        }

        // Format address to lowercase for consistent querying
        const normalizedAddress = address.toLowerCase();

        const schema = await getSchema();
        const { ItemsService } = services;

        // Check if codex collection exists
        if (!schema.collections.codex) {
          return res.status(500).json({
            error: "Codex collection not found in schema",
          });
        }

        const codexService = new ItemsService("codex", {
          schema,
          accountability: req.accountability,
        });

        // Query codex items where owner matches the address (case-insensitive)
        const codexItems = await codexService.readByQuery({
          filter: {
            owner: {
              _eq: normalizedAddress,
            },
          },
          fields: [ "id", "name" ],
        });

        // Format response to match Directus standard items endpoint structure
        const filterCount = codexItems.length;

        // Get total count for meta (same as filter_count in this case since we're filtering)
        const totalCount = filterCount;

        // Get API base URL from environment or config
        const apiBaseUrl = env.PUBLIC_URL || config.api?.baseUrl || "http://localhost:8055";

        // Add OpenSea URL and codex API URL to each item
        const itemsWithUrls = codexItems.map((item: any) => ({
          ...item,
          opensea_url: `https://opensea.io/item/ethereum/0x97f69e1f54a4b10d934ff67e65b7ecfbab6ec652/${item.id}`,
          codex_api_url: `${apiBaseUrl}/items/codex/${item.id}`,
        }));

        res.json({
          data: itemsWithUrls,
          meta: {
            filter_count: filterCount,
            total_count: totalCount,
          },
        });
      } catch (error: any) {
        res.status(500).json({
          error: "Internal server error",
          message: error?.message || String(error),
        });
      }
    });
  },
};
