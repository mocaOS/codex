/**
 * import-souls.ts
 *
 * Imports soul and identity data from JSON files into the codex database
 * using the Directus SDK. Data is stored in the `moltbot` field with versioning.
 *
 * Usage: bun run scripts/import-souls.ts
 *
 * Options:
 *   --dry-run      Preview changes without writing to database
 *   --limit=N      Only process first N records
 *   --id=N         Process only a specific codex ID
 *   --version=X    Version string (default: "v0.1")
 */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createDirectus, readItem, rest, staticToken, updateItem } from "@directus/sdk";

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const SOULS_JSON_DIR = join(__dirname, "souls_json");
const DEFAULT_VERSION = "v0.1";

// Directus configuration
const isProduction = process.env.NODE_ENV === "production";
const DIRECTUS_URL = process.env.PUBLIC_URL || (isProduction ? "https://api.decc0s.com" : "http://localhost:8055");
const DIRECTUS_TOKEN = process.env.ADMIN_TOKEN || "";

// Types
interface SoulData {
  id: number;
  soul: string;
  identity: string;
}

interface MoltbotVersionData {
  soul: string;
  identity: string;
}

interface MoltbotData {
  [version: string]: MoltbotVersionData;
}

// Directus schema types
interface CodexItem {
  id: number;
  moltbot: MoltbotData | null;
  [key: string]: unknown;
}

interface DirectusSchema {
  codex: CodexItem[];
}

/**
 * Parse command line arguments
 */
function parseArgs(): { dryRun: boolean; limit?: number; id?: number; version: string } {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const limitArg = args.find(a => a.startsWith("--limit="));
  const limit = limitArg ? Number.parseInt(limitArg.split("=")[1]) : undefined;

  const idArg = args.find(a => a.startsWith("--id="));
  const id = idArg ? Number.parseInt(idArg.split("=")[1]) : undefined;

  const versionArg = args.find(a => a.startsWith("--version="));
  const version = versionArg ? versionArg.split("=")[1] : DEFAULT_VERSION;

  return { dryRun, limit, id, version };
}

/**
 * Main function
 */
async function main() {
  const { dryRun, limit, id, version } = parseArgs();

  console.log("🔍 Import Souls to Database (Directus SDK)");
  console.log(`   Version: ${version}`);
  console.log(`   Directus URL: ${DIRECTUS_URL}`);
  if (dryRun) console.log("   Mode: DRY RUN (no changes will be made)");
  if (limit) console.log(`   Limit: ${limit} records`);
  if (id) console.log(`   Single ID: ${id}`);
  console.log("");

  // Validate token
  if (!dryRun && !DIRECTUS_TOKEN) {
    console.error("❌ ADMIN_TOKEN environment variable is required");
    console.error("   Set it in your .env file or pass it as an environment variable");
    process.exit(1);
  }

  // Read all JSON files
  console.log("📂 Reading JSON files...");
  const files = await readdir(SOULS_JSON_DIR);
  let jsonFiles = files.filter(f => f.endsWith(".json")).sort();

  // Filter by ID if specified
  if (id) {
    const idStr = id.toString().padStart(5, "0");
    jsonFiles = jsonFiles.filter(f => f.startsWith(idStr));
    if (jsonFiles.length === 0) {
      console.error(`❌ No JSON file found for ID ${id}`);
      process.exit(1);
    }
  }

  // Apply limit
  if (limit) {
    jsonFiles = jsonFiles.slice(0, limit);
  }

  console.log(`   Found ${jsonFiles.length} files to process`);

  // Create Directus client
  const client = createDirectus<DirectusSchema>(DIRECTUS_URL)
    .with(staticToken(DIRECTUS_TOKEN))
    .with(rest());

  // Process files
  console.log("\n📥 Importing souls...");
  const startTime = Date.now();
  let processed = 0;
  let updated = 0;
  let errors = 0;

  for (const file of jsonFiles) {
    const filePath = join(SOULS_JSON_DIR, file);

    try {
      // Read and parse JSON
      const content = await readFile(filePath, "utf-8");
      const parsed: SoulData = JSON.parse(content);

      // Build the moltbot data with versioning
      const versionData: MoltbotVersionData = {
        soul: parsed.soul,
        identity: parsed.identity,
      };

      if (dryRun) {
        // Dry run - just show what would happen
        if (processed < 3) {
          console.log(`   Would update codex ID ${parsed.id}:`);
          console.log(`     moltbot.${version}.soul: ${parsed.soul.substring(0, 50).replace(/\n/g, "\\n")}...`);
          console.log(`     moltbot.${version}.identity: ${parsed.identity.substring(0, 50).replace(/\n/g, "\\n")}...`);
        } else if (processed === 3) {
          console.log("   ... (more records)");
        }
        updated++;
      } else {
        // Fetch existing moltbot data to merge with new version
        try {
          let existingMoltbot: MoltbotData = {};

          try {
            const existing = await client.request(
              readItem("codex", parsed.id, { fields: ["moltbot"] }),
            );
            if (existing?.moltbot && typeof existing.moltbot === "object") {
              existingMoltbot = existing.moltbot as MoltbotData;
            }
          } catch {
            // Item might not exist or moltbot might be null, that's fine
          }

          // Merge new version into existing moltbot data
          const newMoltbot: MoltbotData = {
            ...existingMoltbot,
            [version]: versionData,
          };

          await client.request(
            updateItem("codex", parsed.id, {
              moltbot: newMoltbot,
            }),
          );
          updated++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes("Item doesn't exist") || errorMessage.includes("403")) {
            console.warn(`   ⚠️  Codex ID ${parsed.id} not found or access denied`);
          } else {
            throw error;
          }
        }
      }

      processed++;

      // Progress update every 100 items (more frequent due to network latency)
      if (processed % 100 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const rate = (processed / Number.parseFloat(elapsed)).toFixed(1);
        console.log(`   ⏳ Processed ${processed}/${jsonFiles.length} (${elapsed}s, ${rate}/s)`);
      }
    } catch (error) {
      errors++;
      console.error(`   ❌ Error processing ${file}:`, error instanceof Error ? error.message : error);
    }
  }

  // Summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Import complete!`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Updated: ${updated}`);
  if (errors > 0) console.log(`   Errors: ${errors}`);
  console.log(`   Time: ${totalTime}s`);

  if (dryRun) {
    console.log(`\n💡 This was a dry run. Run without --dry-run to apply changes.`);
  }
}

main().catch(console.error);
