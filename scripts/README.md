# Scripts

Scripts for managing soul and identity data for the Codex collection.

## Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Directus API running (for import script)
- `ADMIN_TOKEN` environment variable set (for import script)

## Available Scripts

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
