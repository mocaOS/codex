const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.ADMIN_TOKEN) {
  throw new Error("ADMIN_TOKEN is not set");
}

/**
 * Generates individual seed data files from IPFS codex files
 * @param {string} gateway - IPFS gateway URL
 * @param {string} hash - IPFS hash of the folder containing codex files
 * @param {string} seedDir - Directory to save the seed data files
 */
async function generateSeedData(gateway, hash, seedDir) {
  console.log("🌱 Starting seed data generation...");

  const totalFiles = 10000;
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Ensure the seed directory exists
  if (!fs.existsSync(seedDir)) {
    fs.mkdirSync(seedDir, { recursive: true });
  }

  // Process files in batches to avoid overwhelming the system
  const batchSize = 50;

  for (let i = 1; i <= totalFiles; i += batchSize) {
    const batchPromises = [];

    for (let j = i; j < Math.min(i + batchSize, totalFiles + 1); j++) {
      const fileNum = String(j).padStart(5, "0");
      const fileName = `Art_DeCC0_${fileNum}.codex.json`;
      const seedFilePath = path.join(seedDir, `codex-${fileNum}.json`);

      // Check if seed file already exists
      if (fs.existsSync(seedFilePath)) {
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
          .then((data) => {
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
            fs.writeFileSync(seedFilePath, JSON.stringify(seedContent, null, 2));

            return { fileNum, syncId };
          })
          .catch((error) => {
            console.error(`  ⚠ Failed to fetch ${fileName}: ${error.message}`);
            errorCount++;
            return null;
          }),
      );
    }

    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => result !== null && !result.skipped);
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

module.exports = {
  debug: true,
  directusUrl: process.env.PUBLIC_URL || "http://localhost:8055",
  directusToken: process.env.ADMIN_TOKEN,
  hooks: {
    snapshot: {
      /**
       * Hook executed during push and diff processes.
       * Generates seed data from IPFS codex files.
       *
       * @param {Object} snapshot - The snapshot object containing collections, fields, and relations
       * @returns {Object} The snapshot object
       */
      onLoad: async (snapshot) => {
        try {
          // Get config values from environment or defaults
          const ipfsGateway = process.env.IPFS_GATEWAY || "http://127.0.0.1:8080";
          const ipfsCodexHash = process.env.IPFS_CODEX_HASH || "QmNdMnuJURo3sFkLR2WLSshPqycfjafbHoAcd2FTdBJ8S5";

          const seedOutputDir = path.join(__dirname, "extensions", "directus-extension-codex", "seed");

          await generateSeedData(
            ipfsGateway,
            ipfsCodexHash,
            seedOutputDir,
          );
        } catch (error) {
          console.error("❌ Error generating seed data:", error.message);
          console.error(error.stack);
        }

        return snapshot;
      },
    },
  },
};
