import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";
import { Buffer } from "node:buffer";
import { defineHook } from "@directus/extensions-sdk";
import cliProgress from "cli-progress";
import config from "@local/config";

/**
 * Fetches from IPFS with timeout and retry logic
 * @param url - The IPFS URL to fetch
 * @param timeoutMs - Timeout in milliseconds (default: 10000)
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise<Response | null>
 */
async function fetchFromIPFS(url: string, timeoutMs: number = 10000, maxRetries: number = 3): Promise<Response | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        } else if (attempt < maxRetries) {
          console.warn(`IPFS fetch attempt ${attempt}/${maxRetries} failed with status ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        } else {
          return response;
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxRetries) {
        const isTimeout = lastError.name === "AbortError" || lastError.message.includes("timeout");
        console.warn(`IPFS fetch attempt ${attempt}/${maxRetries} failed${isTimeout ? " (timeout)" : ""}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }

  console.error(`Failed to fetch from IPFS after ${maxRetries} attempts:`, lastError?.message);
  return null;
}

export default defineHook(({ init }, { services, getSchema }) => {
  init("app.after", async () => {
    // Defer seeding to next event loop to avoid blocking app initialization
    // This allows Directus to finish initializing and become ready before seeding starts
    setImmediate(async () => {
      console.log("🌱 Codex seed hook: Checking for data to seed...");

      let schema;
      let seedFiles: string[];
      let seedDir: string;
      let folderId: string | null = null;

      try {
        schema = await getSchema();

        // Check if codex collection exists in schema
        if (!schema.collections.codex) {
          console.log("   ⏭️  Codex collection not found in schema yet. Skipping seed process.");
          console.log("   ℹ️  Collection will be created by directus-sync. Seed will run on next startup.");
          return;
        }

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

        // Check if seed directory exists
        if (!existsSync(seedDir)) {
          console.log(`   ⏭️  Seed directory not found at ${seedDir}. Skipping seed process.`);
          console.log("   ℹ️  Seed directory will be created on next deployment.");
          return;
        }

        // Read all seed files
        const files = await readdir(seedDir);
        seedFiles = files.filter(file => file.endsWith(".json"));

        if (seedFiles.length === 0) {
          console.log("   ℹ️  No seed files found in seed directory. Skipping seed process.");
          return;
        }

        console.log(`   Found ${seedFiles.length} seed files`);
      } catch (error) {
        // Check if error is due to collection not existing
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("primary") || errorMessage.includes("Cannot read properties")) {
          console.log("   ⏭️  Codex collection not ready yet. Skipping seed process.");
          console.log("   ℹ️  Collection will be created by directus-sync. Seed will run on next startup.");
          return;
        }

        // Check if error is due to directory not existing (ENOENT)
        if (errorMessage.includes("ENOENT") || errorMessage.includes("no such file or directory")) {
          console.log("   ⏭️  Seed directory not found. Skipping seed process.");
          console.log("   ℹ️  Seed directory will be created on next deployment.");
          return;
        }

        console.error("❌ Codex seed hook initialization failed:", errorMessage);
        if (error instanceof Error) console.error(error.stack);
        console.log("⏭️  Skipping seed process due to initialization error");
        return;
      }

      try {
        const { ItemsService, FilesService, FoldersService } = services;
        let insertedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const totalFiles = seedFiles.length;

        // Ensure Codex folder exists
        if (FoldersService) {
          try {
            const foldersService = new (FoldersService as any)({ schema, accountability: null });
            const folderName = config.directus?.codexFolderName || "Codex";

            // Use folder ID from config if provided, otherwise look it up
            if (config.directus?.codexFolderId) {
              folderId = config.directus.codexFolderId as string;
            } else {
              const folders = await foldersService.readByQuery({
                filter: { name: { _eq: folderName }, parent: { _null: true } },
                limit: 1,
                fields: [ "id" ],
              });

              if (folders && folders.length > 0) {
                folderId = folders[0].id as string;
              } else {
                folderId = await foldersService.createOne({ name: folderName }) as string;
              }
            }
          } catch (err) {
            console.error("   ❌ Failed to get/create Codex folder:", err);
          }
        }

        // Calculate total items across all files for accurate progress
        let totalItemsAcrossAllFiles = 0;
        for (const file of seedFiles) {
          try {
            const filePath = join(seedDir!, file);
            const fileContent = await readFile(filePath, "utf-8");
            const seedData = JSON.parse(fileContent);
            if (seedData.data && Array.isArray(seedData.data)) {
              totalItemsAcrossAllFiles += seedData.data.length;
            }
          } catch {
            // Skip files that can't be read for counting
          }
        }

        // Create multi-bar container
        const multibar = new cliProgress.MultiBar({
          clearOnComplete: false,
          hideCursor: true,
          format: " {bar} {percentage}% | {value}/{total} | {filename}",
        }, cliProgress.Presets.shades_classic);

        // Create file progress bar
        const filesBar = multibar.create(totalFiles, 0, { filename: `Files (${totalFiles} total)` });

        // Create overall items progress bar
        const overallItemsBar = multibar.create(totalItemsAcrossAllFiles, 0, { filename: "All Items" });

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
            const itemsBar = multibar.create(totalItems, 0, { filename: `File: ${file}` });

            // Process each item in the seed file
            for (let itemIndex = 0; itemIndex < seedData.data.length; itemIndex++) {
              const item = seedData.data[itemIndex];

              const { _sync_id, timestamp_created, ...itemData } = item;

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
                  overallItemsBar.increment();
                  continue;
                }
              }

              // Process Images (Thumbnail, Background, Character)
              if (FilesService && folderId) {
                const filesService = new (FilesService as any)({ schema, accountability: null });

                const uploadImage = async (buffer: Buffer, filename: string, type: string) => {
                  try {
                    const stream = Readable.from(buffer);
                    return await filesService.uploadOne(stream, {
                      filename_download: filename,
                      type,
                      folder: folderId,
                      storage: "local",
                    });
                  } catch (e) {
                    console.error(`Error uploading ${filename}:`, e);
                    return null;
                  }
                };

                // 1. Thumbnail
                if (itemData.thumbnail && typeof itemData.thumbnail === "string" && itemData.thumbnail.startsWith("data:")) {
                  try {
                    const matches = itemData.thumbnail.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const type = matches[1];
                      const buffer = Buffer.from(matches[2], "base64");
                      const filename = `codex-${itemData.id}-thumbnail.jpg`;
                      const fileId = await uploadImage(buffer, filename, type);
                      if (fileId) itemData.thumbnail = fileId;
                    }
                  } catch (e) {
                    console.error(`Failed to process thumbnail for ${itemData.id}:`, e);
                    itemData.thumbnail = null;
                  }
                }

                // 2. Thumbnail Background
                if (itemData.thumbnail_background && typeof itemData.thumbnail_background === "string" && itemData.thumbnail_background.startsWith("data:")) {
                  try {
                    const matches = itemData.thumbnail_background.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    if (matches && matches.length === 3) {
                      const type = matches[1];
                      const buffer = Buffer.from(matches[2], "base64");
                      const filename = `codex-${itemData.id}-background.jpg`;
                      const fileId = await uploadImage(buffer, filename, type);
                      if (fileId) itemData.thumbnail_background = fileId;
                    }
                  } catch (e) {
                    console.error(`Failed to process thumbnail_background for ${itemData.id}:`, e);
                    itemData.thumbnail_background = null;
                  }
                }

                // 3. Thumbnail Character (from IPFS)
                if (itemData.ipfs_character && !itemData.thumbnail_character) {
                  try {
                    const ipfsGateway = config.directus?.ipfsGateway || "http://ipfs.qwellcode.de";
                    const url = `${ipfsGateway}/ipfs/${itemData.ipfs_character}`;
                    const response = await fetchFromIPFS(url, 10000, 3);
                    if (response && response.ok) {
                      const arrayBuffer = await response.arrayBuffer();
                      const buffer = Buffer.from(arrayBuffer);
                      const filename = `codex-${itemData.id}-character.jpg`;
                      const fileId = await uploadImage(buffer, filename, "image/jpeg");
                      if (fileId) itemData.thumbnail_character = fileId;
                    } else {
                      console.warn(`Failed to fetch IPFS image for ${itemData.id} after retries`);
                    }
                  } catch (e) {
                    console.error(`Failed to process thumbnail_character for ${itemData.id}:`, e);
                  }
                }
              }

              // Insert the item
              await codexService.createOne(itemData);
              insertedCount++;
              itemsBar.increment();
              overallItemsBar.increment();
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

        // Check for codex items missing thumbnail_character and update them
        console.log("\n🔄 Checking for codex items missing thumbnail_character...");
        try {
          const codexService = new ItemsService("codex", {
            schema,
            accountability: null,
          });

          const itemsWithoutThumbnail = await codexService.readByQuery({
            filter: {
              _and: [
                { ipfs_character: { _nnull: true } },
                { thumbnail_character: { _null: true } },
              ],
            },
            limit: 1000,
            fields: [ "id", "ipfs_character" ],
          });

          if (itemsWithoutThumbnail && itemsWithoutThumbnail.length > 0) {
            console.log(`   Found ${itemsWithoutThumbnail.length} items missing thumbnail_character`);
            let updatedCount = 0;
            let failedCount = 0;

            // Create a new multibar for the update process
            const updateMultibar = new cliProgress.MultiBar({
              clearOnComplete: false,
              hideCursor: true,
              format: " {bar} {percentage}% | {value}/{total} | {filename}",
            }, cliProgress.Presets.shades_classic);

            const updateBar = updateMultibar.create(itemsWithoutThumbnail.length, 0, { filename: "Updating missing thumbnails" });

            if (FilesService && folderId) {
              const filesService = new (FilesService as any)({ schema, accountability: null });

              const uploadImage = async (buffer: Buffer, filename: string, type: string) => {
                try {
                  const stream = Readable.from(buffer);
                  return await filesService.uploadOne(stream, {
                    filename_download: filename,
                    type,
                    folder: folderId,
                    storage: "local",
                  });
                } catch (e) {
                  console.error(`Error uploading ${filename}:`, e);
                  return null;
                }
              };

              for (const item of itemsWithoutThumbnail) {
                try {
                  if (item.ipfs_character) {
                    const ipfsGateway = config.directus?.ipfsGateway || "http://ipfs.qwellcode.de";
                    const url = `${ipfsGateway}/ipfs/${item.ipfs_character}`;
                    const response = await fetchFromIPFS(url, 10000, 3);

                    if (response && response.ok) {
                      const arrayBuffer = await response.arrayBuffer();
                      const buffer = Buffer.from(arrayBuffer);
                      const filename = `codex-${item.id}-character.jpg`;
                      const fileId = await uploadImage(buffer, filename, "image/jpeg");

                      if (fileId) {
                        await codexService.updateOne(item.id, { thumbnail_character: fileId });
                        updatedCount++;
                      } else {
                        failedCount++;
                      }
                    } else {
                      failedCount++;
                    }
                  }
                } catch (e) {
                  console.error(`Failed to update thumbnail_character for ${item.id}:`, e);
                  failedCount++;
                }
                updateBar.increment();
              }

              updateMultibar.remove(updateBar);
              updateMultibar.stop();
              console.log("\n✅ Thumbnail update completed!");
              console.log(`   - Updated: ${updatedCount}`);
              console.log(`   - Failed: ${failedCount}`);
            }
          } else {
            console.log("   ✅ All items have thumbnail_character");
          }
        } catch (error) {
          console.error("❌ Failed to check/update missing thumbnail_character:", error instanceof Error ? error.message : String(error));
        }
      } catch (error) {
        console.error("❌ Codex seed hook processing failed:", error instanceof Error ? error.message : String(error));
        if (error instanceof Error) console.error(error.stack);
      }
    });
  });
});
