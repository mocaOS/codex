/**
 * generate-decc0-mds.ts
 *
 * Generates one Markdown file per Art DeCC0 (10,000 total) from the Codex API,
 * laid out like the explorer page, for ingestion into a dedicated knowledge
 * base that agents can query. Each document mirrors the explorer layout: the
 * trait list, image links (optimized API thumbnails and original IPFS sources),
 * and all narrative data.
 *
 * Agent-framework payloads (moltbot SOUL.md/IDENTITY.md and ElizaOS agent_profiles)
 * are intentionally excluded — they are derivative data and not needed here.
 *
 * The output folder is gitignored; documents are reconstructed deterministically
 * from the API at any time by re-running this script.
 *
 * Usage: bun run scripts/generate-decc0-mds.ts
 *
 * Options:
 *   --limit=N        Only generate the first N documents
 *   --ids=1,2,437    Only generate the given codex IDs
 *   --out=DIR        Output directory (default: <repo>/decc0-mds)
 *   --dry-run        Preview counts without writing files
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Configuration
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const API_URL = process.env.PUBLIC_URL || "https://api.decc0s.com";
const IPFS_GATEWAY = "https://ipfs.qwellcode.de/ipfs/";
const DEFAULT_OUT_DIR = join(REPO_ROOT, "decc0-mds");
const PAGE_SIZE = 500;

// "Alien" and "Ape" are ultra-rare character types stored on-chain in the
// background_category trait slot (see codex-explorer README).
const CHARACTER_IN_BACKGROUND = new Set(["Alien", "Ape"]);

// Types
interface CodexItem {
  id: number;
  name?: string | string[];
  description?: string;
  confession?: string;
  decc0_type?: string;
  background_category?: string;
  background_texture?: string;
  mood?: string;
  dna1?: string;
  dna2?: string;
  dna3?: string;
  dna4?: string;
  citation?: string;
  ancestor?: string;
  kindred?: string;
  cultural_affiliation?: string;
  municipality_significant?: string;
  latlon_significant?: string;
  municipality_residence?: string;
  latlon_residence?: string;
  philosophical_affiliation?: string;
  expression_style?: string;
  whatness?: string | string[];
  gender?: string | string[];
  self_identity?: string;
  multiplicity?: number | string;
  soul?: number | string;
  x?: number | string;
  artstyle_loved?: string;
  artstyle_liked?: string;
  artstyle_disliked?: string;
  cryptoart_focus?: string;
  personality_tradart_view?: string;
  fiery?: string;
  biography?: string | string[];
  biography_addendum?: string;
  character_image_summary?: string;
  character_image_description?: string;
  paired_art_image_summary?: string;
  paired_art_image_description?: string;
  paired_art_placement?: string;
  favorite_role?: string;
  favorite_cryptoartist?: string;
  favorite_book?: string;
  favourite_color?: string;
  favourite_animal?: string;
  metaphor_domain?: string;
  writing_style?: string | string[];
  personality_mood?: string;
  personality_problem_solving?: string;
  ideolectal_words?: string | string[];
  writing_flavor?: string;
  writing_flavor_cultural?: string;
  writing_quirks?: string;
  writing_sentence_complexity?: string;
  writing_questions?: string;
  writing_comma?: string;
  writing_ellipses?: string;
  writing_exclamation?: string;
  writing_quotation_marks?: string;
  characterization?: string;
  ipfs_final?: string;
  ipfs_character?: string;
  ipfs_background?: string;
  thumbnail?: string;
  thumbnail_character?: string;
  thumbnail_background?: string;
  owner?: string;
  timestamp_created?: string;
  price?: string | number | null;
}

/**
 * Parse command line arguments
 */
interface Options {
  limit?: number;
  ids?: number[];
  outDir: string;
  dryRun: boolean;
}

function parseArgs(): Options {
  const options: Options = { outDir: DEFAULT_OUT_DIR, dryRun: false };

  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg.startsWith("--limit=")) {
      options.limit = Number.parseInt(arg.split("=")[1], 10);
    } else if (arg.startsWith("--ids=")) {
      options.ids = arg
        .split("=")[1]
        .split(",")
        .map((value) => Number.parseInt(value.trim(), 10))
        .filter((value) => Number.isFinite(value));
    } else if (arg.startsWith("--out=")) {
      options.outDir = resolve(arg.split("=")[1]);
    } else {
      console.warn(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

/**
 * Fetch all codex items from the Directus API (paginated), or only the
 * requested IDs. The query string is built deterministically; long text
 * fields make full payload paging the fastest reliable approach.
 */
async function fetchCodexItems(options: Options): Promise<CodexItem[]> {
  const items: CodexItem[] = [];

  if (options.ids?.length) {
    const chunks: number[][] = [];
    for (let i = 0; i < options.ids.length; i += PAGE_SIZE) {
      chunks.push(options.ids.slice(i, i + PAGE_SIZE));
    }

    for (const chunk of chunks) {
      const params = new URLSearchParams();
      params.set("fields", "*");
      params.set("limit", String(PAGE_SIZE));
      params.set("filter[id][_in]", chunk.join(","));

      const response = await fetch(`${API_URL}/items/codex?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const json = (await response.json()) as { data: CodexItem[] };
      items.push(...json.data);
    }

    return items;
  }

  const total = await fetchTotalCount();
  console.log(`Fetching ${total.toLocaleString()} codex items from ${API_URL} ...`);

  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    const params = new URLSearchParams();
    params.set("fields", "*");
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    params.set("sort", "id");

    const response = await fetch(`${API_URL}/items/codex?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    const json = (await response.json()) as { data: CodexItem[] };
    items.push(...json.data);
    console.log(`  fetched ${items.length}/${total}`);
  }

  if (options.limit !== undefined) {
    return items.slice(0, options.limit);
  }

  return items;
}

async function fetchTotalCount(): Promise<number> {
  const params = new URLSearchParams();
  params.set("fields", "id");
  params.set("limit", "1");
  params.set("meta", "filter_count");
  const response = await fetch(`${API_URL}/items/codex?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  const json = (await response.json()) as { meta: { filter_count: number } };
  return json.meta.filter_count;
}

// Formatting helpers

/**
 * Sanitize lone surrogate pairs (e.g. Linear B glyphs in some ancestor
 * fields) so the Markdown is always valid UTF-8.
 */
function sanitize(value: string): string {
  return value.toWellFormed();
}

function toList(value: string | string[] | undefined): string[] {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map((v) => String(v).trim()).filter(Boolean);
}

function toText(value: string | string[] | undefined, separator = " "): string {
  const list = toList(value);
  return sanitize(list.join(separator));
}

function paragraph(text: string | string[] | undefined): string {
  return toText(text);
}

/**
 * A labeled field, mirroring the explorer's uppercase label + value pairs.
 * Rendered as a list item so consecutive fields stay on separate lines:
 * "- **Mood**: baseline"
 */
function field(label: string, value: string | undefined | null): string {
  if (!value || !String(value).trim()) return "";
  return `- **${label}**: ${sanitize(String(value))}`;
}

/**
 * Build the Markdown document for a single DeCC0, mirroring the layout of
 * https://codex.decc0s.com/{id} (traits list, image links, then the merged
 * aggregated data sections in the same order).
 */
function renderMarkdown(item: CodexItem): string {
  const id = item.id;
  const name = toText(item.name) || `#${id}`;
  const nameAliases = toList(item.name);
  const sections: string[][] = [];

  const add = (...lines: string[]) => sections.push(lines.filter((l, i) => l !== "" || (i > 0 && lines[i - 1] !== "")));

  // --- Header (title, like the explorer header) ---
  add(`# Art DeCC0 #${id} — ${name}`);

  // --- Traits (the ul trait grid under the title) ---
  const backgroundTrait = item.background_category || "";
  const traits = [
    field("Background", backgroundTrait) || "- **Background**: N/A",
    field("Background Texture", item.background_texture) || "- **Background Texture**: N/A",
    field("Character", item.decc0_type) || "- **Character**: N/A",
    field("Lineage", item.dna1) || "- **Lineage**: N/A",
    field("Memetic", item.dna2) || "- **Memetic**: N/A",
    field("Artist Self-Portrait", item.dna3) || "- **Artist Self-Portrait**: N/A",
    field("MOCA Collection", item.dna4) || "- **MOCA Collection**: N/A",
    field("Character Citation", item.citation) || "- **Character Citation**: N/A",
    field("Mood", item.mood) || "- **Mood**: N/A",
  ];
  if (CHARACTER_IN_BACKGROUND.has(backgroundTrait)) {
    traits.push(
      `- **Note**: \`${backgroundTrait}\` is an ultra-rare character type stored on-chain in the \`background_category\` trait slot.`,
    );
  }
  add("## Traits", "", ...traits);

  // --- Images (optimized API previews + original IPFS sources, like the explorer) ---
  const optimized: string[] = [
    item.thumbnail ? field("Main Image", `${API_URL}/assets/${item.thumbnail}?key=s512`) : "",
    item.thumbnail_character
      ? field("Character Layer", `${API_URL}/assets/${item.thumbnail_character}?key=s512`)
      : "",
    item.thumbnail_background
      ? field("Background Layer", `${API_URL}/assets/${item.thumbnail_background}?key=s512`)
      : "",
  ].filter(Boolean);
  const originals: string[] = [
    item.ipfs_final ? field("Main Image", `${IPFS_GATEWAY}${item.ipfs_final}`) : "",
    item.ipfs_character ? field("Character Layer", `${IPFS_GATEWAY}${item.ipfs_character}`) : "",
    item.ipfs_background
      ? field("Background Layer", `${IPFS_GATEWAY}${item.ipfs_background}`)
      : "",
  ].filter(Boolean);
  const imageLinks: string[] = [];
  if (optimized.length) {
    imageLinks.push("### Optimized Versions", "", ...optimized);
  }
  if (originals.length) {
    if (imageLinks.length) imageLinks.push("");
    imageLinks.push("### Original Source (IPFS)", "", ...originals);
  }
  imageLinks.push();
  add("## Images", "", ...imageLinks);

  // --- Description & Confession ---
  const description = paragraph(item.description);
  if (description) add("## Description", "", description);
  const confession = paragraph(item.confession);
  if (confession) add("## Confession", "", confession);

  // --- Basic Information (explorer column 1) ---
  const basic: string[] = [];
  if (nameAliases.length > 1) {
    basic.push(field("Name", nameAliases[0] || ""));
    basic.push(field("Aliases", nameAliases.slice(1).join(", ")));
  } else if (nameAliases.length === 1) {
    basic.push(field("Name", nameAliases[0]));
  }
  basic.push(field("Cultural Affiliation", item.cultural_affiliation));
  if (item.municipality_significant) {
    basic.push(field("Municipality Significant", item.municipality_significant));
    if (item.latlon_significant) {
      basic.push(
        `  - Coordinates: ${sanitize(item.latlon_significant)} · [View on Map](https://map.decc0s.com/#${id}s)`,
      );
    }
  }
  if (item.municipality_residence) {
    basic.push(field("Municipality Residence", item.municipality_residence));
    if (item.latlon_residence) {
      basic.push(
        `  - Coordinates: ${sanitize(item.latlon_residence)} · [View on Map](https://map.decc0s.com/#${id}r)`,
      );
    }
  }
  basic.push(field("Ancestor", item.ancestor));
  basic.push(field("Kindred", item.kindred));
  if (basic.filter(Boolean).length) add("## Basic Information", "", ...basic.filter(Boolean));

  // --- Personal Attributes (explorer column 2) ---
  const attributes: string[] = [
    field("Philosophical Affiliation", item.philosophical_affiliation),
    field("Expression Style", item.expression_style),
  ];
  const whatness = toList(item.whatness);
  const gender = toList(item.gender);
  for (let i = 0; i < Math.max(whatness.length, gender.length); i++) {
    const what = whatness[i] || "N/A";
    const gen = gender[i] || "N/A";
    attributes.push(field(i === 0 ? "Whatness / Gender" : "Whatness / Gender (additional)", `${what} / ${gen}`));
  }
  attributes.push(field("Self Identity", item.self_identity));
  const multiplicityParts = [
    item.multiplicity !== undefined && item.multiplicity !== null && String(item.multiplicity) !== ""
      ? String(item.multiplicity)
      : "",
    item.soul !== undefined && item.soul !== null && String(item.soul) !== "" ? String(item.soul) : "",
    item.x !== undefined && item.x !== null && String(item.x) !== "" ? String(item.x) : "",
  ].filter(Boolean);
  if (multiplicityParts.length) {
    attributes.push(field("Multiplicity / Soul / X", multiplicityParts.join(" / ")));
  }
  if (attributes.filter(Boolean).length) {
    add("## Personal Attributes", "", ...attributes.filter(Boolean));
  }

  // --- Art Preferences (explorer column 3-4) ---
  const artPrefs: string[] = [];
  if (item.artstyle_loved || item.artstyle_liked || item.artstyle_disliked) {
    artPrefs.push("- **Art Style Preferences**");
    if (item.artstyle_loved) artPrefs.push(`  - Loved: ${sanitize(item.artstyle_loved)}`);
    if (item.artstyle_liked) artPrefs.push(`  - Liked: ${sanitize(item.artstyle_liked)}`);
    if (item.artstyle_disliked) artPrefs.push(`  - Disliked: ${sanitize(item.artstyle_disliked)}`);
  }
  artPrefs.push(field("Cryptoart Focus", item.cryptoart_focus));
  artPrefs.push(field("Traditional Art View", item.personality_tradart_view));
  artPrefs.push(field("Fiery", item.fiery));
  if (artPrefs.filter(Boolean).length) {
    add("## Art Preferences", "", ...artPrefs.filter(Boolean));
  }

  // --- Biography (+ Addendum) ---
  const biography = paragraph(item.biography);
  const addendum = paragraph(item.biography_addendum);
  if (biography || addendum) {
    const bio: string[] = [];
    if (biography) bio.push(biography, "");
    if (addendum) bio.push("**Addendum**", "", addendum);
    add("## Biography", "", ...bio);
  }

  // --- Visual Appearance ---
  const visual: string[] = [];
  if (item.character_image_summary) {
    visual.push("**Character Summary**", "", paragraph(item.character_image_summary), "");
  }
  if (item.paired_art_image_summary) {
    const placement = item.paired_art_placement || "background";
    visual.push(
      `**Paired Art Summary** (${placement} layer)`,
      "",
      paragraph(item.paired_art_image_summary),
    );
  }
  if (visual.length) add("## Visual Appearance", "", ...visual);

  // --- Favorite Things ---
  const favorites: string[] = [
    field("Favorite Role", item.favorite_role),
    field("Favorite Cryptoartist", item.favorite_cryptoartist),
    field("Favorite Book", item.favorite_book),
    field("Favorite Color", item.favourite_color),
    field("Favorite Animal", item.favourite_animal),
  ].filter(Boolean);
  if (favorites.length) add("## Favorite Things", "", ...favorites);

  // --- Writing Behavior ---
  const writing: string[] = [];
  writing.push(field("Metaphor Domain", item.metaphor_domain));
  const writingStyle = toList(item.writing_style);
  if (writingStyle.length) {
    writing.push("- **Writing Style**");
    for (const style of writingStyle) writing.push(`  - ${sanitize(style)}`);
  }
  writing.push(field("Personality Mood", item.personality_mood));
  writing.push(field("Problem Solving", item.personality_problem_solving));
  const ideolectal = toList(item.ideolectal_words);
  if (ideolectal.length) {
    writing.push(`- **Ideolectal Words**: ${ideolectal.map((w) => `\`${sanitize(w)}\``).join(" · ")}`);
  }
  const writingMetadata = [
    field("Flavor", item.writing_flavor),
    field("Cultural Flavor", item.writing_flavor_cultural),
    field("Quirks", item.writing_quirks),
  ].filter(Boolean);
  if (writingMetadata.length) {
    writing.push("- **Writing Metadata**");
    writing.push(...writingMetadata.map((line) => `  ${line}`));
  }
  const punctuation = [
    field("Comma Style", item.writing_comma),
    field("Ellipses Style", item.writing_ellipses),
    field("Exclamation Style", item.writing_exclamation),
    field("Writing Questions", item.writing_questions),
    field("Quotation Marks", item.writing_quotation_marks),
    field("Sentence Complexity", item.writing_sentence_complexity),
  ].filter(Boolean);
  if (punctuation.length) {
    writing.push("- **Writing Punctuation**");
    writing.push(...punctuation.map((line) => `  ${line}`));
  }
  if (writing.filter(Boolean).length) add("## Writing Behavior", "", ...writing.filter(Boolean));

  // --- Additional Characterization ---
  const additional: string[] = [];
  if (item.characterization) {
    additional.push("**Characterization**", "", paragraph(item.characterization), "");
  }
  if (item.character_image_description) {
    additional.push("**Character Details**", "", paragraph(item.character_image_description), "");
  }
  if (item.paired_art_image_description) {
    additional.push("**Paired Art Details**", "", paragraph(item.paired_art_image_description));
  }
  if (additional.length) add("## Additional Characterization", "", ...additional);

  // --- Codex Page (footer link) ---
  add(field("Codex Page", `https://codex.decc0s.com/${id}`));

  // Join sections with blank lines between them, trimming excess blanks inside.
  return sanitize(
    sections
      .map((section) => {
        const trimmed = [...section];
        while (trimmed.length && trimmed[trimmed.length - 1] === "") trimmed.pop();
        return trimmed.join("\n");
      })
      .join("\n\n") + "\n",
  );
}

/**
 * Main
 */
async function main(): Promise<void> {
  const options = parseArgs();

  const items = await fetchCodexItems(options);
  console.log(`Fetched ${items.length} codex item(s).`);

  if (options.dryRun) {
    console.log("Dry run — no files written.");
    return;
  }

  await mkdir(options.outDir, { recursive: true });

  let written = 0;
  for (const item of items) {
    const fileName = `${String(item.id).padStart(4, "0")}.md`;
    const filePath = join(options.outDir, fileName);
    const markdown = renderMarkdown(item);
    await writeFile(filePath, markdown, "utf-8");
    written++;
    if (written % 500 === 0) {
      console.log(`  wrote ${written}/${items.length}`);
    }
  }

  console.log(`Done. Wrote ${written} markdown file(s) to ${options.outDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
