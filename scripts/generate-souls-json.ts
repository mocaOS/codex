/**
 * generate-souls-json.ts
 *
 * Reconstructs the moltbot SOUL.md / IDENTITY.md payloads (version v0.1) for
 * every Art DeCC0 directly from the Codex API and writes them as
 * `souls_json/{id}.json` files in the format expected by import-souls.ts:
 *
 *   { id: number, soul: string, identity: string }
 *
 * Use this when the original scripts/souls/ markdown files are not available.
 * The output is deterministic given the codex data.
 *
 * Usage: bun run scripts/generate-souls-json.ts
 *
 * Options:
 *   --limit=N   Only generate the first N entries
 *   --ids=1,2   Only generate the given codex IDs
 *   --out=DIR   Output directory (default: scripts/souls_json)
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_URL = process.env.PUBLIC_URL || "https://api.decc0s.com";
const OUTPUT_DIR = process.env.SOULS_JSON_DIR || join(__dirname, "souls_json");
const PAGE_SIZE = 500;

const FIELDS = [
  "id",
  "name",
  "gender",
  "self_identity",
  "municipality_residence",
  "latlon_residence",
  "municipality_significant",
  "latlon_significant",
  "cultural_affiliation",
  "ancestor",
  "kindred",
  "characterization",
  "agent_profiles",
  "mood",
  "personality_mood",
  "personality_problem_solving",
  "personality_tradart_view",
  "writing_style",
  "ideolectal_words",
  "writing_sentence_complexity",
  "writing_questions",
  "writing_comma",
  "writing_ellipses",
  "writing_exclamation",
  "writing_quotation_marks",
  "writing_flavor",
  "writing_flavor_cultural",
  "writing_quirks",
  "citation",
  "confession",
  "favorite_role",
  "favorite_cryptoartist",
  "favorite_book",
  "favourite_color",
  "favourite_animal",
  "artstyle_loved",
  "artstyle_liked",
  "artstyle_disliked",
  "cryptoart_focus",
  "philosophical_affiliation",
  "expression_style",
  "fiery",
  "whatness",
  "metaphor_domain",
  "multiplicity",
].join(",");

type Scalar = string | number | null;
type Value = Scalar | Scalar[] | Record<string, unknown> | null;

interface CodexItem {
  id: number;
  [key: string]: Value;
}

interface SoulData {
  id: number;
  soul: string;
  identity: string;
}

function parseArgs(): { limit?: number; ids?: Set<number>; out: string } {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith("--limit="));
  const idsArg = args.find(a => a.startsWith("--ids="));
  const outArg = args.find(a => a.startsWith("--out="));
  return {
    limit: limitArg ? Number.parseInt(limitArg.split("=")[1], 10) : undefined,
    ids: idsArg ? new Set(idsArg.split("=")[1].split(",").map(v => Number.parseInt(v, 10))) : undefined,
    out: outArg ? outArg.split("=")[1] : OUTPUT_DIR,
  };
}

/** Fields in the codex schema may be strings or single-element arrays. */
function flat(value: Value): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(v => (v === null || v === undefined ? "" : String(v))).join("; ");
  if (typeof value === "object") return "";
  return String(value);
}

function adjectives(item: CodexItem): string[] {
  const profiles = item.agent_profiles;
  if (profiles && typeof profiles === "object" && !Array.isArray(profiles)) {
    const first = Object.values(profiles as Record<string, unknown>)[0] as Record<string, unknown> | undefined;
    const adjs = first?.adjectives;
    if (Array.isArray(adjs)) return adjs.filter((a): a is string => typeof a === "string");
  }
  return [];
}

function buildSoul(item: CodexItem): string {
  const name = flat(item.name) || `DeCC0 #${item.id}`;
  const adjs = adjectives(item);
  const lines: string[] = [];

  lines.push(`# SOUL.md — ${name}`, "");
  lines.push(`You are ${name}. Stay consistent with your identity.`, "");

  if (adjs.length > 0) {
    lines.push("## Core Temperament");
    lines.push(`${adjs.join("; ")}.`, "");
  }

  const voiceRules: string[] = [];
  if (flat(item.writing_style)) voiceRules.push(`Style: ${flat(item.writing_style)}`);
  if (flat(item.writing_sentence_complexity)) voiceRules.push(`Sentence structure: ${flat(item.writing_sentence_complexity)}`);
  if (flat(item.writing_comma)) voiceRules.push(`Comma usage: ${flat(item.writing_comma)}`);
  if (flat(item.writing_ellipses)) voiceRules.push(`Ellipses: ${flat(item.writing_ellipses)}`);
  if (flat(item.writing_exclamation)) voiceRules.push(`Exclamations: ${flat(item.writing_exclamation)}`);
  if (flat(item.writing_questions)) voiceRules.push(`Questions: ${flat(item.writing_questions)}`);
  if (flat(item.writing_quotation_marks)) voiceRules.push(`Quotation marks: ${flat(item.writing_quotation_marks)}`);
  if (flat(item.writing_flavor)) voiceRules.push(`Flavor: ${flat(item.writing_flavor)}`);
  if (flat(item.writing_flavor_cultural)) voiceRules.push(`Cultural influence: ${flat(item.writing_flavor_cultural)}`);
  if (flat(item.writing_quirks)) voiceRules.push(`Quirks: ${flat(item.writing_quirks)}`);
  if (flat(item.expression_style)) voiceRules.push(`Expression style: ${flat(item.expression_style)}`);
  const ideolect = flat(item.ideolectal_words);
  if (ideolect) voiceRules.push(`Characteristic vocabulary: ${ideolect}`);

  if (voiceRules.length > 0) {
    lines.push("## Voice Rules");
    for (const rule of voiceRules) lines.push(`- ${rule}`);
    lines.push("");
  }

  const exemplars: string[] = [];
  if (flat(item.citation)) exemplars.push(flat(item.citation));
  if (flat(item.confession)) exemplars.push(flat(item.confession));
  if (exemplars.length > 0) {
    lines.push("## Style Exemplars");
    for (const e of exemplars) lines.push(`"${e}"`, "");
  }

  const behavior: string[] = [];
  if (flat(item.personality_mood)) behavior.push(`Mood: ${flat(item.personality_mood)}`);
  if (flat(item.personality_problem_solving)) behavior.push(`Problem solving: ${flat(item.personality_problem_solving)}`);
  if (flat(item.personality_tradart_view)) behavior.push(`View on traditional art: ${flat(item.personality_tradart_view)}`);
  if (flat(item.metaphor_domain)) behavior.push(`Metaphors drawn from: ${flat(item.metaphor_domain)}`);
  if (flat(item.philosophical_affiliation)) behavior.push(`Philosophy: ${flat(item.philosophical_affiliation)}`);
  if (flat(item.cryptoart_focus)) behavior.push(`Cryptoart focus: ${flat(item.cryptoart_focus)}`);
  if (flat(item.artstyle_loved)) behavior.push(`Loves: ${flat(item.artstyle_loved)}`);
  if (flat(item.artstyle_liked)) behavior.push(`Likes: ${flat(item.artstyle_liked)}`);
  if (flat(item.artstyle_disliked)) behavior.push(`Dislikes: ${flat(item.artstyle_disliked)}`);
  if (flat(item.favorite_role)) behavior.push(`Favorite role in the scene: ${flat(item.favorite_role)}`);
  if (flat(item.favorite_cryptoartist)) behavior.push(`Favorite cryptoartist: ${flat(item.favorite_cryptoartist)}`);
  if (flat(item.favorite_book)) behavior.push(`Favorite book: ${flat(item.favorite_book)}`);
  if (flat(item.favourite_color)) behavior.push(`Favorite color: ${flat(item.favourite_color)}`);
  if (flat(item.favourite_animal)) behavior.push(`Favorite animal: ${flat(item.favourite_animal)}`);
  if (flat(item.fiery)) behavior.push(`Fiery streak: ${flat(item.fiery)}`);
  if (flat(item.whatness)) behavior.push(`Whatness: ${flat(item.whatness)}`);
  if (flat(item.multiplicity)) behavior.push(`Multiplicity: ${flat(item.multiplicity)}`);

  if (behavior.length > 0) {
    lines.push("## Behavioral Guidelines");
    for (const b of behavior) lines.push(`- ${b}`);
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function buildIdentity(item: CodexItem): string {
  const name = flat(item.name) || `DeCC0 #${item.id}`;
  const lines: string[] = [];

  lines.push("# IDENTITY.md", "");
  lines.push(`Name: ${name}`);
  if (flat(item.gender)) lines.push(`Gender: ${flat(item.gender)}`);
  if (flat(item.self_identity)) lines.push(`Self-identity: ${flat(item.self_identity)}`);
  if (flat(item.municipality_residence)) lines.push(`Residence: ${flat(item.municipality_residence)}`);
  if (flat(item.latlon_residence)) lines.push(`Coordinates: ${flat(item.latlon_residence)}`);
  if (flat(item.municipality_significant)) lines.push(`Significant place: ${flat(item.municipality_significant)}`);
  if (flat(item.latlon_significant)) lines.push(`Significant coordinates: ${flat(item.latlon_significant)}`);
  if (flat(item.cultural_affiliation)) lines.push(`Cultural Affiliation: ${flat(item.cultural_affiliation)}`);
  if (flat(item.ancestor)) lines.push(`Ancestry: ${flat(item.ancestor)}`);
  if (flat(item.kindred)) lines.push(`Kindred: ${flat(item.kindred)}`);
  if (flat(item.mood)) lines.push(`Mood: ${flat(item.mood)}`);
  lines.push("");

  const characterization = flat(item.characterization);
  if (characterization) {
    lines.push(`Characterization: ${characterization}`, "");
  }

  return lines.join("\n").trimEnd() + "\n";
}

async function main() {
  const { limit, ids, out } = parseArgs();

  console.log("🔍 Generating souls_json from Codex API");
  console.log(`   API: ${API_URL}`);
  console.log(`   Output: ${out}`);
  console.log("");

  await mkdir(out, { recursive: true });

  let generated = 0;
  let skipped = 0;
  let errors = 0;
  let offset = 0;
  const startTime = Date.now();

  while (true) {
    const url = `${API_URL}/items/codex?fields=${FIELDS}&limit=${PAGE_SIZE}&offset=${offset}&sort=id`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} fetching items at offset ${offset}: ${await res.text()}`);
    }
    const json = await res.json();
    const items: CodexItem[] = json.data ?? [];

    if (items.length === 0) break;

    for (const item of items) {
      if (ids && !ids.has(item.id)) {
        skipped++;
        continue;
      }
      if (limit !== undefined && generated >= limit) break;

      try {
        const data: SoulData = {
          id: item.id,
          soul: buildSoul(item),
          identity: buildIdentity(item),
        };
        const filePath = join(out, `${String(item.id).padStart(5, "0")}-soul.json`);
        await writeFile(filePath, JSON.stringify(data, null, 2));
        generated++;
      } catch (error) {
        errors++;
        console.error(`  ❌ Error processing ID ${item.id}:`, error instanceof Error ? error.message : error);
      }
    }

    if (limit !== undefined && generated >= limit) break;
    offset += PAGE_SIZE;
    console.log(`  ⏳ Fetched ${offset} items (generated: ${generated})`);
  }

  const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ Done! Generated ${generated} soul files in ${totalSeconds}s (skipped: ${skipped}, errors: ${errors})`);
  console.log(`📂 Output written to: ${out}`);
  if (errors > 0) process.exitCode = 1;
}

main().catch(console.error);
