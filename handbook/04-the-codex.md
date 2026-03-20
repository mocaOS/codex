# 4. The Codex

> The 105-million-word knowledge base, data architecture, API, querying, image transformations, and blockchain integration.

---

## What Is the Codex?

The Codex is the comprehensive knowledge base and API infrastructure that houses all data about the 10,000 Art Decc0s. It is simultaneously:

- A **data repository** — Over 105 million words of character information spanning biographies, personalities, artistic preferences, communication styles, cultural contexts, and visual descriptions
- A **RESTful API** — Built on Directus (an open-source headless CMS), providing programmatic access to all character data at `https://api.decc0s.com`
- A **documentation platform** — Interactive API documentation at [docs.decc0s.com](https://docs.decc0s.com)
- The **backbone** for MOCA's agentic AI operating system — The data layer that powers SOUL.md files, ElizaOS agent profiles, and all downstream agent integrations
- A **living document** — Designed to evolve through versioned updates without losing history

The Codex is not just a database. As the project states: "as long as we have access to a DeCC0's Codex page, we don't need the generation program's input files (or indeed the generation program itself); but could rather undertake selective and thoughtful revisions." The Codex is the canonical source of truth about who each Art Decc0 is.

---

## The 100-Million-Word Knowledge Base

### Generation Process

The text generation process for the Codex was led by DaïmAlYad using a sophisticated multi-phase approach, written in Go and executed through 260,000+ API calls to Comput3AI's inference services over approximately 2.5 days.

### Phase 1: Visual Description Development

DaïmAlYad initially attempted using vision models directly on finished composite artwork, but found them inadequate for capturing the complex, chaotic nature of the pieces. The solution involved:

1. **Separating character images from backgrounds** for independent analysis
2. **Requesting detailed descriptions** of each isolated component
3. **Using on-chain metadata context** to guide and anchor the descriptions
4. **Combining descriptions** with the character's DNA information to produce richer, more accurate visual profiles

This separation proved critical — the composite images were too visually dense for a single-pass analysis to capture meaningful detail.

### Phase 2: Gender and Identity Determination

Rather than a simple single-question approach, DaïmAlYad designed an iterative identity determination system:

1. Each character's **masculinity** was rated **8 times independently**
2. Each character's **femininity** was rated **8 times independently**
3. Results were **averaged and weighed** against each other
4. The final determination aligned with human perception far better than single-pass evaluation

This approach:
- Reduces the impact of any single model hallucination
- Produces more nuanced identity representations
- Respects the intentional ambiguity designed into many characters
- Creates results that human reviewers consistently agreed with

### Phase 3: Personality Architecture

Over 20 metadata vectors were generated per character, each requiring its own generation pipeline and quality checks:

**Ancestral connections** — Characters reference historical art collectors (industrialists, kings, sultans, bankers) whose patronage influence continues to shape their modern perspectives. A character descended from a Medici patron might express different views on art commissioning than one descended from a Soviet propagandist.

**Artistic preferences** — Each DeCC0 expresses:
- Enthusiasm for lesser-known art movements (paired with disdain for mainstream movements)
- Specific crypto art interests and passions
- A favorite Genesis Collection crypto artist (mentioned unprompted in natural conversation)
- Individual stances on traditional versus digital art

**Cultural and philosophical traits:**
- Global cultural affiliations drawn from real-world cultures
- Special city connections with precise latitude/longitude coordinates
- Post-modern, cosmopolitan worldviews shaped by their DNA heritage
- Philosophical affiliations influencing how they reason about art and life

**Behavioral attributes:**
- Amiability versus aloofness on a continuous spectrum
- Trust levels and skepticism tendencies
- Spontaneity versus deliberation preferences
- Verbosity ranges from terse to expansive
- Punctuation habits (comma density, ellipsis usage, exclamation frequency, question patterns)
- Unique ideolectal vocabulary — words specific to each character

### Phase 4: The Sanity Review

Rather than manual review of 10,000 characters (impossible at this scale) or rigid algorithmic rules (too blunt), DaïmAlYad implemented an **AI-driven "sanity review"** stage:

1. Raw metadata was evaluated for **internal consistency and coherence**
2. Contradictions were **automatically identified and revised** (e.g., a character described as "terse" but given highly verbose writing examples)
3. Metadata variability was **enriched** while maintaining bespoke uniqueness
4. The review prevented **AI bias-driven convergence** — the tendency for large-scale generation to collapse toward standard character archetypes

This quality assurance stage was essential. Without it, the natural biases of the inference models would have produced 10,000 characters that all felt suspiciously similar — articulate, empathetic, and politically moderate. The sanity review injected the chaos and specificity that makes each character genuinely distinct.

### Generation at Scale

| Metric | Value |
|--------|-------|
| Total words generated | 105,561,738 |
| API calls | 260,000+ |
| Processing time | ~2.5 days continuous |
| Remote AI calls per character | 20 |
| Input data types per character | 24+ |
| Average words per character | ~10,000 |
| Total structured data | 800+ MB |
| Inference provider | Comput3AI |
| Programming language | Go |
| Additional local processing | Weeks |
| Debugging sessions | Extended (one midnight–5AM) |

---

## Character Data Architecture

Every Codex entry contains extensive structured data across multiple domains. The full schema is defined in the Directus database and accessible through the API.

### Identity & Biography

These fields define who each character is at the most fundamental level.

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier (1–10,000) |
| `name` | string/array | Character name (e.g., "Parvata", "Bar", "Wachi-Ruq") |
| `ancestor` | string | Ancestral lineage information (e.g., "Slovenian king") |
| `description` | string | Brief one-sentence description of the character |
| `biography` | string/json | Detailed multi-paragraph biographical narrative |
| `biography_addendum` | string | Additional biographical context and backstory |
| `characterization` | string | Physical and personality characterization summary |
| `whatness` | array | Array of role/characteristic descriptors (e.g., `["curator", "philosopher", "guardian"]`) |
| `citation` | string | Citation or attribution information |
| `timestamp_created` | datetime | When the record was created |

### Personality & Psychology

These fields capture the inner life of each character — how they think, feel, and relate to the world.

| Field | Type | Description |
|-------|------|-------------|
| `personality_mood` | string | Dominant mood characteristics |
| `personality_problem_solving` | string | How the character approaches challenges and decisions |
| `personality_tradart_view` | string | View on traditional art — ranging from reverent to dismissive |
| `mood` | string | General temperament and emotional baseline |
| `expression_style` | string | How the character expresses themselves |
| `philosophical_affiliation` | string | Philosophical school or worldview |
| `self_identity` | string | How the character perceives and describes themselves |
| `confession` | string | A personal confession or vulnerable admission |

### Artistic Preferences

Each character has a detailed relationship with art — what they love, like, and actively dislike.

| Field | Type | Description |
|-------|------|-------------|
| `artstyle_loved` | string | Art styles the character is passionate about |
| `artstyle_liked` | string | Art styles the character appreciates but doesn't champion |
| `artstyle_disliked` | string | Art styles the character actively dislikes or critiques |
| `favorite_cryptoartist` | string | Their favorite crypto artist from the MOCA Genesis Collection |
| `favorite_role` | string | The role they most identify with in the art world |
| `cryptoart_focus` | string | Their specific area of interest within crypto art |

### Writing & Communication Style

One of the most distinctive aspects of each character — their unique linguistic fingerprint.

| Field | Type | Description |
|-------|------|-------------|
| `writing_style` | array/string | Overall writing style characteristics |
| `writing_flavor` | string | The general "flavor" or register of their writing |
| `writing_flavor_cultural` | string | Cultural influences on writing style |
| `writing_comma` | string | How they use commas (sparse, heavy, Oxford-style, etc.) |
| `writing_ellipses` | string | How they use ellipses (never, frequently, dramatically, etc.) |
| `writing_exclamation` | string | Exclamation mark frequency and context |
| `writing_questions` | string | How and when they pose questions |
| `writing_quotation_marks` | string | Quotation mark usage patterns |
| `writing_sentence_complexity` | string | Sentence structure (simple, compound, labyrinthine, etc.) |
| `writing_quirks` | string | Unique writing quirks and idiosyncrasies |
| `ideolectal_words` | array | Character-specific vocabulary — words unique to this character's speech |

### Cultural & Location Data

Each character is grounded in real-world geography and culture.

| Field | Type | Description |
|-------|------|-------------|
| `cultural_affiliation` | string | Cultural background and connections |
| `municipality_residence` | string | Where the character "lives" |
| `municipality_significant` | string | A municipality significant to the character's story |
| `latlon_residence` | string | Latitude/longitude of residence |
| `latlon_significant` | string | Latitude/longitude of significant location |

### DNA & Traits

The genetic building blocks of each character, plus their personal favorites.

| Field | Type | Description |
|-------|------|-------------|
| `dna1` | string | Lineage DNA — collector/patron archetype |
| `dna2` | string | Memetics DNA — crypto culture icon |
| `dna3` | string | Artist DNA — classical or contemporary artist |
| `dna4` | string | MOCA Collection DNA — specific MOCA artwork |
| `decc0_type` | string | Character type classification |
| `multiplicity` | integer | Character multiplicity value |
| `x` | integer | X coordinate or index position |
| `favourite_animal` | string | Favorite animal |
| `favourite_color` | string | Favorite color |
| `favorite_book` | string | Favorite book |
| `kindred` | string | Kindred relationship or spirit |
| `metaphor_domain` | string | Domain they draw metaphors from |
| `fiery` | string | How "fiery" or passionate the character is |

### Visual Assets

References to the character's artwork stored on IPFS and in Directus.

| Field | Type | Description |
|-------|------|-------------|
| `character_image_description` | string | AI-generated description of the character image |
| `character_image_summary` | string | Brief summary of the character's visual appearance |
| `paired_art_image_description` | string | Description of the background artwork |
| `paired_art_image_summary` | string | Summary of the background artwork |
| `paired_art_placement` | string | How the background art is positioned/composed |
| `ipfs_character` | string | IPFS content hash for the character-only image |
| `ipfs_background` | string | IPFS content hash for the background-only image |
| `ipfs_final` | string | IPFS content hash for the final composite artwork |
| `thumbnail` | UUID | Directus file reference for the composite thumbnail |
| `thumbnail_character` | UUID | Directus file reference for the character-only thumbnail |
| `thumbnail_background` | UUID | Directus file reference for the background-only thumbnail |
| `background_category` | string | Which of the 16 background art style categories |
| `background_texture` | string | The specific texture or sub-style of the background |

### AI Agent Data

The fields that power AI agent integration — the bridge between the Codex and agent frameworks.

| Field | Type | Description |
|-------|------|-------------|
| `moltbot` | JSON | Versioned SOUL.md + IDENTITY.md data (see [Chapter 5](./05-soul-md-and-moltbot.md)) |
| `soul` | integer | Soul reference field |
| `agent_profiles` | JSON | Pre-built agent profiles for frameworks like ElizaOS |

### Blockchain Data

On-chain information updated automatically by the Codex system.

| Field | Type | Description |
|-------|------|-------------|
| `owner` | string | Current Ethereum wallet address (always lowercase) |
| `price` | string | Current or last-known NFT price |

---

## The Codex API

### Overview

The Codex API is a RESTful interface built on **Directus**, an open-source headless CMS. It provides structured access to all 10,000 characters and their associated files.

**Base URL:** `https://api.decc0s.com`

**Documentation:** [docs.decc0s.com](https://docs.decc0s.com)

### Key Characteristics

| Feature | Detail |
|---------|--------|
| **Authentication** | No authentication required for read operations |
| **Response format** | JSON with consistent `{ data, meta }` structure |
| **HTTP standards** | Standard methods (GET) and status codes |
| **Querying** | Built-in pagination, filtering, sorting, and full-text search |
| **Specification** | Full OpenAPI 3.0.1 spec available at `/api` and `api-docs/oas` |
| **Playground** | Interactive testing at docs.decc0s.com |
| **LLM context** | Machine-readable docs at `llms.txt` and `llms-full.txt` |

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/items/codex` | GET | List all codex items with optional filtering, sorting, pagination |
| `/items/codex/{id}` | GET | Get a specific codex item by its numeric ID (1–10,000) |
| `/files` | GET | List all files with metadata |
| `/files/{id}` | GET | Get file metadata by UUID |
| `/assets/{id}` | GET | Get raw file content with optional image transformations |

### Response Format

**Successful response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Parvata",
      "ancestor": "...",
      "description": "A contemplative curator with deep roots..."
    }
  ],
  "meta": {
    "total_count": 10000,
    "filter_count": 42
  }
}
```

**Single item response (by ID):**
```json
{
  "data": {
    "id": 1,
    "name": "Parvata",
    "ancestor": "Slovenian king",
    "description": "A contemplative curator with deep roots in Eastern Orthodox hesychasm...",
    "biography": "Her psychology is built on Eastern Orthodox hesychasm...",
    "whatness": ["curator", "philosopher", "guardian"]
  }
}
```

**Error response:**
```json
{
  "errors": [
    {
      "message": "Item not found",
      "extensions": { "code": "NOT_FOUND" }
    }
  ]
}
```

Common HTTP status codes:
- `200` — Success
- `400` — Bad request (invalid query parameters or filter syntax)
- `403` — Forbidden (if authentication is required for the operation)
- `404` — Not found (the requested item doesn't exist)

---

## Querying the Codex

The API supports powerful querying through Directus filter syntax. Queries can use either bracket notation (simpler) or JSON format (for complex logic).

### Field Selection

Request only the fields you need to reduce response size and improve performance:

```
GET /items/codex?fields=id,name,biography,moltbot
GET /items/codex?fields=id,name,description
```

For relational data, use dot notation:
```
GET /items/codex?fields=id,name,related_item.title
```

Omit the `fields` parameter to get all available fields.

### Filtering

**Bracket notation (simple):**
```
GET /items/codex?filter[cultural_affiliation][_contains]=Slovenian
GET /items/codex?filter[mood][_eq]=contemplative
GET /items/codex?filter[dna1][_in]=Medici,Sultan
```

**JSON format (for complex logic):**
```
GET /items/codex?filter={"_and":[{"owner":{"_eq":"0x614a..."}},{"id":{"_gte":100}}]}
```

### Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `_eq` | Equals | `filter[name][_eq]=Korka` |
| `_neq` | Not equals | `filter[name][_neq]=Korka` |
| `_lt` | Less than | `filter[id][_lt]=100` |
| `_lte` | Less than or equal | `filter[id][_lte]=100` |
| `_gt` | Greater than | `filter[id][_gt]=50` |
| `_gte` | Greater than or equal | `filter[id][_gte]=50` |
| `_in` | In array | `filter[id][_in]=1,2,3` |
| `_nin` | Not in array | `filter[id][_nin]=1,2,3` |
| `_null` | Is null | `filter[ancestor][_null]=true` |
| `_nnull` | Is not null | `filter[ancestor][_nnull]=true` |
| `_contains` | Contains substring | `filter[name][_contains]=ork` |
| `_ncontains` | Doesn't contain | `filter[name][_ncontains]=test` |
| `_starts_with` | Starts with | `filter[name][_starts_with]=Ko` |
| `_nstarts_with` | Doesn't start with | `filter[name][_nstarts_with]=Ko` |
| `_ends_with` | Ends with | `filter[name][_ends_with]=ka` |
| `_nends_with` | Doesn't end with | `filter[name][_nends_with]=ka` |
| `_between` | Between two values | `filter[id][_between]=10,50` |
| `_nbetween` | Not between | `filter[id][_nbetween]=10,50` |
| `_empty` | Is empty | `filter[tags][_empty]=true` |
| `_nempty` | Is not empty | `filter[tags][_nempty]=true` |

### Logical Operators

**AND** — All conditions must be true:
```json
{"_and": [{"id": {"_gte": 1}}, {"name": {"_nnull": true}}]}
```

**OR** — At least one condition must be true:
```json
{"_or": [{"name": {"_eq": "Korka"}}, {"name": {"_eq": "Parvata"}}]}
```

**Nested** — Complex combinations:
```json
{
  "_and": [
    {"owner": {"_eq": "0x614a..."}},
    {"_or": [
      {"id": {"_lt": 100}},
      {"id": {"_gt": 200}}
    ]}
  ]
}
```

### Sorting

```
GET /items/codex?sort=name                    # Ascending by name
GET /items/codex?sort=-id                     # Descending by ID
GET /items/codex?sort=-timestamp_created,name  # Multiple fields
```

### Pagination

```
GET /items/codex?limit=10&offset=0     # First page
GET /items/codex?limit=10&offset=10    # Second page
GET /items/codex?limit=10&offset=20    # Third page
```

Include metadata for pagination UI:
```
GET /items/codex?limit=10&offset=0&meta=*
```

Pagination calculations:
```
Total Pages  = ceil(total_count / limit)
Current Page = floor(offset / limit) + 1
```

### Full-Text Search

Search across all searchable fields simultaneously:
```
GET /items/codex?search=surrealism
GET /items/codex?search=curator
```

Search can be combined with filters and sorting:
```
GET /items/codex?search=art&filter[id][_gte]=10&sort=-timestamp_created&limit=10
```

### Metadata

| Value | Returns |
|-------|---------|
| `meta=*` | All available metadata |
| `meta=total_count` | Total items in the collection |
| `meta=filter_count` | Items matching the current filter |

---

## Image Transformations

The API supports on-the-fly image transformations via the **Sharp** library, applied through the `/assets/{id}` endpoint.

### Preset Keys

Pre-configured presets for common sizes:

| Key | Width | Use Case |
|-----|-------|----------|
| `s128` | 128px | Tiny thumbnails, lists |
| `s256` | 256px | Small thumbnails, grids |
| `s512` | 512px | Medium display, cards |
| `s1024` | 1024px | Large display, detail views |

```
GET /assets/{id}?key=s512
```

### Custom Transformations

| Parameter | Type | Options |
|-----------|------|---------|
| `width` | integer | Desired width in pixels |
| `height` | integer | Desired height in pixels |
| `quality` | integer | Compression quality (0–100) |
| `fit` | string | `cover` (crop to fill), `contain` (fit within), `inside` (no upscale), `outside` (may exceed) |
| `format` | string | `jpeg`, `png`, `webp`, `tiff`, `avif` |

```
GET /assets/{id}?width=800&height=600&fit=cover&format=webp&quality=80
```

### Advanced Sharp API Transforms

The `transforms` parameter accepts a JSON array of Sharp operations:

```
GET /assets/{id}?transforms=[["rotate",90],["blur",10],["tint","rgb(255,0,255)"]]
```

**Available operations:**

| Operation | Arguments | Description |
|-----------|-----------|-------------|
| `rotate` | `degrees` | Rotate image (90, 180, 270) |
| `blur` | `sigma` | Gaussian blur (0.3–1000) |
| `sharpen` | `sigma?`, `flat?`, `jagged?` | Sharpen image edges |
| `flip` | — | Flip vertically |
| `flop` | — | Flip horizontally |
| `grayscale` | — | Convert to grayscale |
| `negate` | — | Invert colors |
| `normalize` | — | Enhance contrast by stretching luminance |
| `gamma` | `gamma` | Adjust gamma (1.0–3.0) |
| `tint` | `{r,g,b}` | Apply a color tint overlay |

**Order matters** — transformations are applied sequentially. `rotate` then `blur` produces different results than `blur` then `rotate`.

Sharp transforms can be combined with standard parameters:
```
GET /assets/{id}?width=800&format=webp&transforms=[["grayscale"],["sharpen"]]
```

---

## Blockchain Integration

The Codex maintains real-time on-chain data through two automated integrations:

### Owner Tracking via The Graph

A scheduled cron job runs **every hour** (`0 * * * *`) to fetch current token ownership:

1. Queries The Graph subgraph for the Art Decc0s contract at `https://gateway.thegraph.com/api/{key}/subgraphs/id/G39v7PFNz911KNWga8erpgei622XKQLW7P6JBmm6fC97`
2. Processes tokens in **batches of 1,000** with pagination
3. Updates each Codex entry's `owner` field with the current Ethereum wallet address (lowercase)
4. Requires the `THE_GRAPH_API_KEY` environment variable

**Important note for querying:** Owner addresses in the Codex are always stored in **lowercase**. Ethereum addresses are case-insensitive on the blockchain, but Directus requires lowercase for consistent querying. Always convert addresses to lowercase and include the `0x` prefix when filtering:

```
# Correct
filter[owner][_eq]=0x614a61a3b7f2fd8750acaad63b2a0cfe8b8524f1

# Wrong — won't match
filter[owner][_eq]=0x614A61A3b7F2fd8750AcAAD63b2a0CFE8b8524F1
```

### ENS Resolution

The Codex Explorer resolves Ethereum addresses to human-readable ENS names using **Viem** with multicall batching — processing up to 100 address lookups per RPC request for efficient resolution.

---

*Previous: [Art Decc0s: The Collection](./03-art-decc0s-the-collection.md) | Next: [SOUL.md & The Moltbot Agent System](./05-soul-md-and-moltbot.md)*
