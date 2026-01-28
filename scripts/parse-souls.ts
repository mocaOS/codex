/**
 * parse-souls.ts
 *
 * Reads IDENTITY.md and SOUL.md files from the souls folder
 * and generates JSON files with the raw markdown content.
 *
 * Usage: bun run scripts/parse-souls.ts
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOULS_DIR = join(__dirname, "souls");
const OUTPUT_DIR = join(__dirname, "souls_json");

// Types for the output data
interface SoulData {
  id: number;
  soul: string;
  identity: string;
}

/**
 * Extract codex ID from folder name (e.g., "00001-parvata" -> 1)
 */
function extractId(folderName: string): number {
  const match = folderName.match(/^(\d+)-/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Scanning souls directory...");

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Read all directories in souls folder
  const entries = await readdir(SOULS_DIR, { withFileTypes: true });
  const soulFolders = entries
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .sort();

  console.log(`📁 Found ${soulFolders.length} soul folders`);

  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const folder of soulFolders) {
    const folderPath = join(SOULS_DIR, folder);
    const identityPath = join(folderPath, "IDENTITY.md");
    const soulPath = join(folderPath, "SOUL.md");

    try {
      // Read both files as raw markdown
      const [identityContent, soulContent] = await Promise.all([
        readFile(identityPath, "utf-8"),
        readFile(soulPath, "utf-8"),
      ]);

      const id = extractId(folder);

      const data: SoulData = {
        id,
        soul: soulContent,
        identity: identityContent,
      };

      // Write JSON file
      const outputPath = join(OUTPUT_DIR, `${folder}.json`);
      await writeFile(outputPath, JSON.stringify(data, null, 2));

      processed++;

      // Progress update every 500 items
      if (processed % 500 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`  ⏳ Processed ${processed}/${soulFolders.length} (${elapsed}s)`);
      }
    } catch (error) {
      errors++;
      console.error(`  ❌ Error processing ${folder}:`, error instanceof Error ? error.message : error);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! Processed ${processed} souls in ${totalTime}s`);
  if (errors > 0) {
    console.log(`⚠️  ${errors} errors encountered`);
  }
  console.log(`📂 Output written to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
