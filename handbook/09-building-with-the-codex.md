# 9. Building with the Codex

> Getting started guide, API examples, SOUL.md integration patterns, and remixing the Codex for other collections.

---

## Getting Started

The Codex API is open and requires no authentication for read operations. You can start making requests immediately with any HTTP client.

### Prerequisites

- A tool for making HTTP requests (`curl`, Postman, any HTTP client, or any programming language)
- That's it — no API keys, no registration, no authentication

### Base URL

```
https://api.decc0s.com
```

### Your First Request

Verify the API is reachable and get your first character:

```bash
# Get character #1 (Parvata)
curl https://api.decc0s.com/items/codex/1
```

You'll receive a JSON response with the full character data:

```json
{
  "data": {
    "id": 1,
    "name": "Parvata",
    "ancestor": "...",
    "description": "...",
    "biography": "...",
    "whatness": ["curator", "philosopher", "guardian"],
    "moltbot": { "v0.1": { "soul": "...", "identity": "..." } }
  }
}
```

### Full Documentation

For interactive documentation with a playground environment, visit [docs.decc0s.com](https://docs.decc0s.com).

---

## API Examples

### Basic Queries

**Get a specific character by ID:**
```bash
curl https://api.decc0s.com/items/codex/42
```

**List the first 10 characters with selected fields:**
```bash
curl "https://api.decc0s.com/items/codex?fields=id,name,description&limit=10"
```

**Search for characters by name:**
```bash
curl "https://api.decc0s.com/items/codex?search=Korka"
```

**Get total collection count:**
```bash
curl "https://api.decc0s.com/items/codex?limit=1&meta=total_count"
```

### Filtering

**By cultural affiliation:**
```bash
curl "https://api.decc0s.com/items/codex?filter[cultural_affiliation][_contains]=Japanese&fields=id,name,cultural_affiliation"
```

**By DNA trait:**
```bash
curl "https://api.decc0s.com/items/codex?filter[dna1][_eq]=Medici&fields=id,name,dna1&limit=100"
```

**By mood:**
```bash
curl "https://api.decc0s.com/items/codex?filter[mood][_contains]=contemplative&fields=id,name,mood"
```

**By art style preference:**
```bash
curl "https://api.decc0s.com/items/codex?filter[artstyle_loved][_contains]=Surrealism&fields=id,name,artstyle_loved"
```

**By owner address (must be lowercase with 0x prefix):**
```bash
curl "https://api.decc0s.com/items/codex?filter[owner][_eq]=0x614a61a3b7f2fd8750acaad63b2a0cfe8b8524f1&fields=id,name,owner&meta=*"
```

> **Important:** Owner addresses must be **lowercase**. Ethereum addresses are case-insensitive on the blockchain, but Directus requires lowercase for consistent querying. Always include the `0x` prefix.

**Characters with non-null ancestors:**
```bash
curl "https://api.decc0s.com/items/codex?filter[ancestor][_nnull]=true&fields=id,name,ancestor&limit=20"
```

**Characters with IDs between 100 and 200:**
```bash
curl "https://api.decc0s.com/items/codex?filter[id][_between]=100,200&fields=id,name"
```

### Combining Filters

**Multiple filters (AND logic with bracket notation):**
```bash
curl "https://api.decc0s.com/items/codex?filter[mood][_contains]=contemplative&filter[artstyle_loved][_contains]=Surrealism&fields=id,name,mood,artstyle_loved"
```

**Complex logic (AND/OR with JSON syntax):**
```bash
curl "https://api.decc0s.com/items/codex?filter={\"_and\":[{\"owner\":{\"_eq\":\"0x614a61a3b7f2fd8750acaad63b2a0cfe8b8524f1\"}},{\"id\":{\"_gte\":100}}]}&fields=id,name,owner"
```

**OR filtering:**
```bash
curl "https://api.decc0s.com/items/codex?filter={\"_or\":[{\"name\":{\"_eq\":\"Parvata\"}},{\"name\":{\"_eq\":\"Korka\"}}]}&fields=id,name"
```

### Sorting

**Alphabetical by name:**
```bash
curl "https://api.decc0s.com/items/codex?sort=name&fields=id,name&limit=10"
```

**Newest first:**
```bash
curl "https://api.decc0s.com/items/codex?sort=-timestamp_created&fields=id,name,timestamp_created&limit=10"
```

**Multiple sort criteria:**
```bash
curl "https://api.decc0s.com/items/codex?sort=-timestamp_created,name&fields=id,name&limit=10"
```

### Pagination

```bash
# Page 1 (items 1–10)
curl "https://api.decc0s.com/items/codex?limit=10&offset=0&fields=id,name&meta=*"

# Page 2 (items 11–20)
curl "https://api.decc0s.com/items/codex?limit=10&offset=10&fields=id,name&meta=*"

# Page 3 (items 21–30)
curl "https://api.decc0s.com/items/codex?limit=10&offset=20&fields=id,name&meta=*"
```

Use the `meta` response to calculate total pages:
```
Total Pages  = ceil(total_count / limit)
Current Page = floor(offset / limit) + 1
```

### Full-Text Search

**Search across all fields:**
```bash
curl "https://api.decc0s.com/items/codex?search=curator&fields=id,name,description"
```

**Combine search with filters:**
```bash
curl "https://api.decc0s.com/items/codex?search=art&filter[id][_gte]=10&sort=-timestamp_created&fields=id,name,description&limit=10"
```

### AI Agent Data

**Get SOUL.md data for a specific character:**
```bash
curl "https://api.decc0s.com/items/codex/42?fields=id,name,moltbot"
```

**Get ElizaOS agent profiles:**
```bash
curl "https://api.decc0s.com/items/codex/42?fields=id,name,agent_profiles"
```

**Batch fetch moltbot data:**
```bash
curl "https://api.decc0s.com/items/codex?fields=id,name,moltbot&limit=100"
```

**Fetch specific characters' agent data:**
```bash
curl "https://api.decc0s.com/items/codex?fields=id,name,moltbot&filter[id][_in]=1,42,100,7777"
```

### Image Assets

**Get a character thumbnail (512px, WebP):**
```bash
curl "https://api.decc0s.com/assets/{file-id}?key=s512&format=webp"
```

**Custom size and quality:**
```bash
curl "https://api.decc0s.com/assets/{file-id}?width=800&height=600&fit=cover&format=webp&quality=80"
```

**Apply visual effects:**
```bash
curl "https://api.decc0s.com/assets/{file-id}?transforms=[[\"grayscale\"],[\"sharpen\"]]"
```

**Rotate and blur:**
```bash
curl "https://api.decc0s.com/assets/{file-id}?transforms=[[\"rotate\",90],[\"blur\",5]]"
```

### Files Metadata

**List all image files:**
```bash
curl "https://api.decc0s.com/files?filter[type][_starts_with]=image/&fields=id,title,type,width,height&limit=20"
```

**Get file metadata by UUID:**
```bash
curl "https://api.decc0s.com/files/{uuid}"
```

**Recently uploaded files:**
```bash
curl "https://api.decc0s.com/files?sort=-created_on&fields=id,title,type,created_on&limit=5"
```

---

## Working with SOUL.md in Your Agent

### JavaScript / TypeScript

```javascript
// Fetch a character's personality data
async function getCharacterPersonality(id, version = 'v0.1') {
  const response = await fetch(
    `https://api.decc0s.com/items/codex/${id}?fields=id,name,moltbot`
  );
  const { data } = await response.json();

  const soul = data.moltbot[version].soul;
  const identity = data.moltbot[version].identity;

  return {
    name: data.name,
    systemPrompt: `${soul}\n\n${identity}`,
    soul,
    identity
  };
}

// Use with any agent framework
const character = await getCharacterPersonality(42);

// Example: Pass to an LLM as system prompt
const agent = createAgent({
  systemPrompt: character.systemPrompt,
  name: character.name,
  // ... framework-specific configuration
});
```

### Python

```python
import requests

def get_character_personality(character_id, version="v0.1"):
    """Fetch a character's SOUL.md and IDENTITY.md from the Codex API."""
    response = requests.get(
        f"https://api.decc0s.com/items/codex/{character_id}",
        params={"fields": "id,name,moltbot"}
    )
    data = response.json()["data"]

    moltbot = data["moltbot"][version]
    return {
        "name": data["name"],
        "soul": moltbot["soul"],
        "identity": moltbot["identity"],
        "system_prompt": f"{moltbot['soul']}\n\n{moltbot['identity']}"
    }

# Fetch character #42
character = get_character_personality(42)

# Use the system prompt with any LLM or agent framework
print(f"Loaded personality for: {character['name']}")
print(f"System prompt length: {len(character['system_prompt'])} characters")
```

### cURL + Shell Script

```bash
#!/bin/bash
# Fetch SOUL.md for a character and save to file

CHARACTER_ID=${1:-42}
VERSION="v0.1"

# Fetch the data
DATA=$(curl -s "https://api.decc0s.com/items/codex/${CHARACTER_ID}?fields=id,name,moltbot")

# Extract name
NAME=$(echo "$DATA" | jq -r '.data.name')

# Extract SOUL.md content
echo "$DATA" | jq -r ".data.moltbot[\"${VERSION}\"].soul" > "${CHARACTER_ID}-${NAME}-SOUL.md"

# Extract IDENTITY.md content
echo "$DATA" | jq -r ".data.moltbot[\"${VERSION}\"].identity" > "${CHARACTER_ID}-${NAME}-IDENTITY.md"

echo "Saved SOUL.md and IDENTITY.md for ${NAME} (ID: ${CHARACTER_ID})"
```

### Batch Download

```javascript
// Download SOUL.md files for multiple characters
async function downloadBatch(ids) {
  const idList = ids.join(',');
  const response = await fetch(
    `https://api.decc0s.com/items/codex?fields=id,name,moltbot&filter[id][_in]=${idList}`
  );
  const { data } = await response.json();

  return data.map(character => ({
    id: character.id,
    name: character.name,
    soul: character.moltbot?.['v0.1']?.soul,
    identity: character.moltbot?.['v0.1']?.identity
  }));
}

// Download personalities for characters 1, 42, 100, and 7777
const characters = await downloadBatch([1, 42, 100, 7777]);
```

---

## Remixing the Codex for Other Collections

The entire Codex infrastructure is open source and designed to be remixed. You can create a Codex for any other NFT collection by forking and adapting the codebase.

### Step 1: Fork the Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/codex.git
cd codex
bun install
```

**Repositories to fork:**
- [github.com/mocaOS/codex](https://github.com/mocaOS/codex) — API & infrastructure
- [github.com/mocaOS/codex-explorer](https://github.com/mocaOS/codex-explorer) — Frontend explorer

### Step 2: Replace the Data

Swap `data/decc0s.json` with your collection's token IDs and names:

```json
[
  { "id": 1, "name": "Your Character 1" },
  { "id": 2, "name": "Your Character 2" }
]
```

Update `data/locations.json` if your collection includes geographic data.

### Step 3: Adapt the Schema

Modify the Directus collection fields in `apps/api/directus-config/` to match your collection's metadata. You can:

- Add new fields specific to your collection
- Remove fields that don't apply
- Change field types to match your data structure
- Update the TypeScript types in `packages/types/directus.d.ts`

### Step 4: Generate Personality Data

Create SOUL.md and IDENTITY.md files for your characters:

1. Design your personality generation pipeline (using LLMs, manual writing, or a hybrid)
2. Place files in `scripts/souls/{id}-{name}/`
3. Run `bun run scripts/parse-souls.ts` to parse to JSON
4. Run `bun run scripts/import-souls.ts` to import to the database

### Step 5: Update IPFS References

Point to your collection's image assets:
- Update IPFS hashes in the configuration
- Modify the init hook to fetch your images
- Update thumbnail generation settings

### Step 6: Configure Blockchain Integration

Update The Graph subgraph queries for your contract:
- Modify `apps/api/extensions/directus-extension-codex/src/hooks/update-codex-owners.ts`
- Point to your collection's subgraph
- Update the GraphQL query to match your contract's token structure

### Step 7: Deploy

Use the provided Docker configuration:

```bash
# Build the Docker image
docker build -t your-codex .

# Run with Docker Compose
docker-compose up -d
```

Or deploy to any platform that supports Docker or Node.js.

### Step 8: Adapt the Explorer

Fork and customize the Codex Explorer:

1. Update API endpoint to point to your Codex API
2. Modify filter categories to match your collection's traits
3. Update branding, colors, and UI to match your project
4. Adjust the character profile layout for your data schema

---

## Best Practices

### API Usage

| Do | Don't |
|----|-------|
| Use field selection to minimize response size | Fetch all fields when you only need a few |
| Include `meta=*` when building pagination UI | Use high limits without pagination |
| Use specific filters instead of fetching all data | Forget to URL-encode special characters |
| Use lowercase for Ethereum addresses | Use case-sensitive matching for addresses |
| Cache responses when data doesn't change frequently | Make redundant API calls for the same data |

### SOUL.md Integration

| Do | Don't |
|----|-------|
| Use a specific version key (e.g., `v0.1`) | Assume the moltbot structure without checking |
| Combine SOUL.md and IDENTITY.md for full personality | Use only SOUL.md without IDENTITY.md context |
| Test agent behavior with multiple characters | Assume all characters will behave identically |
| Check for null moltbot data before accessing | Access deeply nested fields without null checks |

### Remixing

| Do | Don't |
|----|-------|
| Start with the existing schema and modify incrementally | Rewrite everything from scratch |
| Keep the versioning system for personality data | Remove moltbot versioning for simplicity |
| Maintain the Docker deployment pattern | Ignore containerization for production |
| Test with a small subset before full import | Import 10,000 records without testing first |

---

*Previous: [Technical Architecture](./08-technical-architecture.md) | Next: [The Documentation Site](./10-documentation-site.md)*
