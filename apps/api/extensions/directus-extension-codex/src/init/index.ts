import { promisify } from "node:util";
import { exec } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineHook } from "@directus/extensions-sdk";

const execAsync = promisify(exec);

/**
 * Generates individual seed data files from IPFS codex files
 * @param gateway - IPFS gateway URL
 * @param hash - IPFS hash of the folder containing codex files
 * @param seedDir - Directory to save the seed data files
 */
async function generateSeedData(gateway: string, hash: string, seedDir: string) {
  console.log("🌱 Starting seed data generation...");

  const totalFiles = 10000;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Ensure the seed directory exists
  if (!existsSync(seedDir)) {
    mkdirSync(seedDir, { recursive: true });
  }

  // Process files in batches to avoid overwhelming the system
  const batchSize = 50;

  for (let i = 1; i <= totalFiles; i += batchSize) {
    const batchPromises = [];

    for (let j = i; j < Math.min(i + batchSize, totalFiles + 1); j++) {
      const fileNum = String(j).padStart(5, "0");
      const fileName = `Art_DeCC0_${fileNum}.codex.json`;
      const seedFilePath = join(seedDir, `codex-${fileNum}.json`);

      // Check if seed file already exists
      if (existsSync(seedFilePath)) {
        skippedCount++;
        batchPromises.push(Promise.resolve({ skipped: true, fileNum }));
        continue;
      }

      const fileUrl = `${gateway}/ipfs/${hash}/${fileName}`;

      batchPromises.push(
        fetch(fileUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
          })
          .then((data: any) => {
            // Use the id from the file as _sync_id
            const syncId = data.id ? `codex-${data.id}` : `codex-${j}`;

            // Create seed file structure
            const seedContent = {
              collection: "codex",
              meta: {
                insert_order: 1,
                create: true,
                update: true,
                delete: true,
                preserve_ids: true,
                ignore_on_update: [],
              },
              data: [
                {
                  _sync_id: syncId,
                  ...data,
                },
              ],
            };

            // Write individual seed file
            writeFileSync(seedFilePath, JSON.stringify(seedContent, null, 2));

            return { fileNum, syncId };
          })
          .catch((error: Error) => {
            console.error(`  ⚠ Failed to fetch ${fileName}: ${error.message}`);
            errorCount++;
            return null;
          }),
      );
    }

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => result !== null && !("skipped" in result && result.skipped));
    successCount += validResults.length;

    console.log(`  📦 Processed ${Math.min(i + batchSize - 1, totalFiles)}/${totalFiles} files (${successCount} created, ${skippedCount} skipped, ${errorCount} failed)`);
  }

  console.log("✅ Seed data generation complete!");
  console.log(`   - Total files processed: ${totalFiles}`);
  console.log(`   - Created: ${successCount}`);
  console.log(`   - Skipped (already exist): ${skippedCount}`);
  console.log(`   - Failed: ${errorCount}`);
  console.log(`   - Output directory: ${seedDir}`);
}

export default defineHook(({ action, init }, { env, logger }) => {
  init("app.before", async () => {
    logger.info(`App is running in ${env.NODE_ENV ?? "development"} mode. Initializing...`);

    // Only run setup in production
    if (env.NODE_ENV !== "production") return;

    try {
      // Run Directus bootstrap (includes database install + official migrations)
      logger.info("Running Directus bootstrap (database install + official migrations)...");
      await execAsync("npx directus bootstrap");
      logger.info("✅ Directus bootstrap completed");

      // Run custom migrations if they exist
      const migrationsPath = process.env.MIGRATIONS_PATH || "/directus/migrations";
      logger.info(`Checking for custom migrations in ${migrationsPath}...`);

      try {
        if (existsSync(migrationsPath)) {
          const files = await readdir(migrationsPath);

          if (files.length > 0) {
            logger.info("Found custom migrations, running them...");
            process.env.MIGRATIONS_PATH = migrationsPath;
            await execAsync("npx directus database migrate:latest");
            logger.info("✅ Custom migrations completed");
          } else {
            logger.info("ℹ️ No custom migrations found, skipping...");
          }
        } else {
          logger.info("ℹ️ Migrations directory not found, skipping...");
        }
      } catch (migrationError) {
        logger.warn("Custom migrations check failed (non-fatal):");
        logger.warn(migrationError);
      }

      // Generate seed data from IPFS codex files
      try {
        const ipfsGateway = env.IPFS_GATEWAY || "http://127.0.0.1:8080";
        const ipfsCodexHash = env.IPFS_CODEX_HASH || "QmNdMnuJURo3sFkLR2WLSshPqycfjafbHoAcd2FTdBJ8S5";

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const seedOutputDir = join(__dirname, "..", "seed");

        logger.info("Generating seed data from IPFS codex files...");
        await generateSeedData(ipfsGateway, ipfsCodexHash, seedOutputDir);
        logger.info("✅ Seed data generation completed");
      } catch (seedError) {
        logger.error("Seed data generation failed (non-fatal):");
        logger.error(seedError);
        // Don't throw - seed generation failure is non-fatal
        logger.warn("Continuing startup despite seed generation failure");
      }

      logger.info("Initial setup completed successfully");
    } catch (error) {
      logger.error("Initial setup failed:");
      logger.error(error);
      throw error;
    }
  });

  action("server.start", async () => {
    if (env.NODE_ENV !== "production") return;

    try {
      logger.info("Pushing Directus sync...");
      await execAsync(`npx directus-sync push --force --directus-url ${env.PUBLIC_URL} --directus-token ${env.ADMIN_TOKEN}`);
      logger.info("✅ Sync completed successfully");
    } catch (error) {
      logger.error("Sync failed:");
      logger.error(error);
      // Don't throw - sync failure is non-fatal
      logger.warn("Continuing startup despite sync failure (non-fatal)");
    }
  });
});
