import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineHook } from "@directus/extensions-sdk";
import cliProgress from "cli-progress";

export default defineHook(({ init }, { services, getSchema }) => {
  init("app.after", async () => {
    // Defer seeding to next event loop to avoid blocking app initialization
    // This allows Directus to finish initializing and become ready before seeding starts
    setImmediate(async () => {
      console.log("🌱 Codex seed hook: Checking for data to seed...");

      let schema;
      let seedFiles: string[];
      let seedDir: string;

      try {
        schema = await getSchema();

        // Check if codex collection already has 10k items
        const { ItemsService } = services;
        const codexService = new ItemsService("codex", {
          schema,
          accountability: null,
        });

        // Query with limit 10001 to check if we have at least 10k items
        const countResult = await codexService.readByQuery({
          limit: 10001,
          fields: [ "id" ],
        });

        const totalCount = Array.isArray(countResult) ? countResult.length : 0;

        console.log(`   Current codex items count: ${totalCount >= 10001 ? "10,000+" : totalCount}`);

        if (totalCount >= 10000) {
          console.log("   ✅ Codex collection already has 10,000+ items. Skipping seed process.");
          return;
        }

        // Get the seed directory path
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        seedDir = join(__dirname, "..", "seed");

        // Read all seed files
        const files = await readdir(seedDir);
        seedFiles = files.filter(file => file.endsWith(".json"));

        console.log(`   Found ${seedFiles.length} seed files`);
      } catch (error) {
        console.error("❌ Codex seed hook initialization failed:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error) console.error(error.stack);
        console.log("⏭️  Skipping seed process due to initialization error");
        return;
      }

      try {
        const { ItemsService } = services;
        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const totalFiles = seedFiles.length;

        // Create multi-bar container
        const multibar = new cliProgress.MultiBar({
          clearOnComplete: false,
          hideCursor: true,
          format: " {bar} {percentage}% | {value}/{total} | {filename}",
        }, cliProgress.Presets.shades_classic);

        // Create file progress bar
        const filesBar = multibar.create(totalFiles, 0, { filename: "Files" });

        // Process each seed file
        for (let fileIndex = 0; fileIndex < seedFiles.length; fileIndex++) {
          const file = seedFiles[fileIndex]!;
          try {
            const filePath = join(seedDir!, file);
            const fileContent = await readFile(filePath, "utf-8");
            const seedData = JSON.parse(fileContent);

            // Extract the data array from the seed file
            if (!seedData.data || !Array.isArray(seedData.data)) {
              console.warn(`   ⚠ Invalid seed file format: ${file}`);
              errorCount++;
              filesBar.increment();
              continue;
            }

            const totalItems = seedData.data.length;

            // Create item progress bar for this file
            const itemsBar = multibar.create(totalItems, 0, { filename: file });

            // Process each item in the seed file
            for (let itemIndex = 0; itemIndex < seedData.data.length; itemIndex++) {
              const item = seedData.data[itemIndex];

              const { _sync_id, timestamp_created, agent_profiles: _agent_profiles, ...itemData } = item;

              // Convert timestamp_created to PostgreSQL-compatible format
              if (timestamp_created) {
                // Parse "2025-10-11 16:46:41 EDT" format and convert to ISO
                const dateStr = timestamp_created.replace(" EDT", "").replace(" ", "T");
                const parsedDate = new Date(dateStr);
                if (!Number.isNaN(parsedDate.getTime())) {
                  itemData.timestamp_created = parsedDate.toISOString();
                }
              }

              // Check if item already exists
              const codexService = new ItemsService("codex", {
                schema,
                accountability: null,
              });

              // Check by id if it exists
              if (itemData.id) {
                const existing = await codexService.readByQuery({
                  filter: { id: { _eq: itemData.id } },
                  limit: 1,
                });

                if (existing && existing.length > 0) {
                  skippedCount++;
                  itemsBar.increment();
                  continue;
                }
              }

              // Insert the item
              await codexService.createOne(itemData);
              insertedCount++;
              itemsBar.increment();
            }

            // Remove item progress bar and update file progress
            multibar.remove(itemsBar);
            filesBar.increment();
          } catch (error) {
            multibar.stop();
            console.log(error);

            console.error(`   ❌ Error processing ${file}:`, error instanceof Error ? error.message : String(error));
            if (error instanceof Error) console.error(error.stack);
            errorCount++;
            console.log("⏭️  Stopping seed process due to file processing error");
            console.log(`   - Inserted before error: ${insertedCount}`);
            console.log(`   - Skipped before error: ${skippedCount}`);
            console.log(`   - Errors: ${errorCount}`);
            return;
          }
        }

        // Stop the multi-bar
        multibar.stop();

        console.log("\n✅ Codex seed hook completed!");
        console.log(`   - Inserted: ${insertedCount}`);
        console.log(`   - Skipped (already exist): ${skippedCount}`);
        console.log(`   - Errors: ${errorCount}`);
      } catch (error) {
        console.error("❌ Codex seed hook processing failed:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error) console.error(error.stack);
      }
    });
  });
});
