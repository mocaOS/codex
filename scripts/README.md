# Scripts

Scripts for managing soul and identity data for the Codex collection.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Directus API running (for import script)
- `ADMIN_TOKEN` environment variable set (for import script)

## Available Scripts

### generate-decc0-mds.ts

Generates one Markdown document per Art DeCC0 (all 10,000) from the Codex API, laid out like the explorer page (https://codex.decc0s.com/{id}): the trait list, an Images section split into Optimized Versions (main image, character layer, and background layer via the API's s512 thumbnails) and Original Source (IPFS gateway links), and all narrative data (description, confession, basic information, personal attributes, art preferences, biography, visual appearance, favorites, writing behavior, characterization) — for ingestion into a dedicated knowledge base that agents can query.

Agent-framework payloads (`moltbot` SOUL.md/IDENTITY.md and ElizaOS `agent_profiles`) are intentionally excluded — they are derivative data and not needed here.

The output folder `decc0-mds/` is gitignored; documents are reconstructed deterministically from the API at any time.

```bash
# Generate all 10,000 documents
bun run scripts/generate-decc0-mds.ts

# Generate only the first N documents (e.g. for a quick check)
bun run scripts/generate-decc0-mds.ts --limit=3

# Generate specific codex IDs
bun run scripts/generate-decc0-mds.ts --ids=1,2,437,227

# Preview without writing files
bun run scripts/generate-decc0-mds.ts --dry-run

# Custom output directory
bun run scripts/generate-decc0-mds.ts --out=/tmp/decc0s-md
```

| Option | Description |
|--------|-------------|
| `--limit=N` | Only process the first N records |
| `--ids=1,2,3` | Only process the given codex IDs |
| `--out=DIR` | Output directory (default: `decc0-mds`) |
| `--dry-run` | Fetch and count, but write no files |

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_URL` | Codex API URL | `https://api.decc0s.com` |

**Output:** one `<repo>/decc0-mds/0001.md` … `10000.md`, named by token ID (zero-padded for stable sorting).

### parse-souls.ts

Reads `IDENTITY.md` and `SOUL.md` files from the `souls/` folder and generates JSON files with the raw markdown content.

```bash
bun run scripts/parse-souls.ts
```

**Input:** `scripts/souls/*/IDENTITY.md` and `scripts/souls/*/SOUL.md`

**Output:** `scripts/souls_json/*.json`

Each output file contains:
```json
{
  "id": 1,
  "soul": "# SOUL.md content...",
  "identity": "# IDENTITY.md content..."
}
```

---

### import-souls.ts

Imports soul and identity data from JSON files into the Directus database. Data is stored in the `moltbot` field with versioning support.

```bash
# Set the admin token
export ADMIN_TOKEN="your_directus_admin_token"

# Import all records with default version (v0.1)
bun run scripts/import-souls.ts

# Import with a specific version
bun run scripts/import-souls.ts --version=v0.2
```

**Options:**

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without writing to database |
| `--limit=N` | Only process first N records |
| `--id=N` | Process only a specific codex ID |
| `--version=X` | Version string (default: `v0.1`) |

**Examples:**

```bash
# Dry run to preview changes
bun run scripts/import-souls.ts --dry-run

# Import only the first 10 records
bun run scripts/import-souls.ts --limit=10

# Import a single codex entry
bun run scripts/import-souls.ts --id=42

# Import with a new version
bun run scripts/import-souls.ts --version=v0.3
```

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_TOKEN` | Directus admin/static token (required) | - |
| `PUBLIC_URL` | Directus API URL (overrides auto-detection) | - |
| `NODE_ENV` | When set to `production`, uses `https://api.decc0s.com` | - |

**URL Resolution:**
- If `PUBLIC_URL` is set, it takes priority
- If `NODE_ENV=production`, uses `https://api.decc0s.com`
- Otherwise, defaults to `http://localhost:8055`

**Database Structure:**

The `moltbot` field in the `codex` table stores versioned data:

```json
{
  "v0.1": {
    "soul": "# SOUL.md — Name\n...",
    "identity": "# IDENTITY.md\n..."
  },
  "v0.2": {
    "soul": "# Updated SOUL.md...",
    "identity": "# Updated IDENTITY.md..."
  }
}
```

New versions are merged with existing data, preserving previous versions.

---

## Typical Workflow

1. **Parse markdown files to JSON:**
   ```bash
   bun run scripts/parse-souls.ts
   ```

2. **Preview the import:**
   ```bash
   bun run scripts/import-souls.ts --dry-run --limit=5
   ```

3. **Import to database:**
   ```bash
   export ADMIN_TOKEN="your_token"
   bun run scripts/import-souls.ts
   ```

4. **Add a new version later:**
   ```bash
   # After updating the markdown files
   bun run scripts/parse-souls.ts
   bun run scripts/import-souls.ts --version=v0.2
   ```
