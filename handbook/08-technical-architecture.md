# 8. Technical Architecture

> Repository structure, technology stack, Directus extensions, Docker deployment, and configuration layers.

---

## Repository Structure

The Codex is a **monorepo** managed by **Turborepo** with **Bun** as the package manager. The codebase is organized into applications, shared packages, data files, and scripts.

```
codex/
├── apps/
│   ├── api/                                  # Directus backend API
│   │   ├── directus-config/                  # Directus configuration & schemas
│   │   │   ├── collections/                  # Collection definitions
│   │   │   └── snapshot/                     # Database schema snapshots
│   │   │       └── fields/codex/             # All codex field definitions
│   │   ├── extensions/
│   │   │   └── directus-extension-codex/     # Custom Directus extension
│   │   │       ├── src/
│   │   │       │   ├── init/                 # Bootstrap & IPFS seeding
│   │   │       │   ├── seed/                 # Database seeding logic
│   │   │       │   └── hooks/                # Owner updates, filters, prices
│   │   │       └── package.json
│   │   ├── uploads/                          # File upload directory
│   │   ├── .env.example                      # Environment variable template
│   │   └── package.json
│   └── documentation/                        # Zudoku documentation site
│       ├── pages/                            # MDX documentation pages
│       │   ├── introduction.mdx
│       │   ├── getting-started.mdx
│       │   ├── codex.mdx                     # Codex endpoint docs
│       │   ├── files.mdx                     # Files endpoint docs
│       │   ├── query-guide.mdx               # Complete query guide
│       │   └── examples/                     # Interactive API examples
│       │       ├── introduction.mdx
│       │       ├── codex/                    # Codex query examples
│       │       ├── files/                    # File query examples
│       │       ├── assets/                   # Image transformation examples
│       │       └── advanced/                 # Complex filter examples
│       ├── apis/
│       │   └── openapi.json                  # OpenAPI 3.0.1 specification
│       ├── plugins/                          # Custom Zudoku plugins
│       │   ├── uncheck-query-params/         # Query param defaults plugin
│       │   └── fix-pagefind-urls/            # Search URL cleanup plugin
│       ├── public/                           # Static assets (logos, images)
│       ├── constants.ts                      # Shared constants (API_BASE_URL)
│       ├── zudoku.config.tsx                 # Zudoku site configuration
│       ├── zudoku.build.ts                   # Build configuration
│       ├── pagefind.yml                      # Pagefind search configuration
│       └── package.json
├── packages/
│   ├── config/                               # Shared environment configuration
│   │   └── src/
│   │       ├── config.development.ts
│   │       ├── config.production.ts
│   │       ├── config.staging.ts
│   │       └── index.ts
│   ├── types/                                # Shared TypeScript type definitions
│   │   ├── index.d.ts
│   │   └── directus.d.ts                     # Directus schema types
│   └── eslint-config-custom/                 # Shared ESLint configuration
├── data/
│   ├── decc0s.json                           # 10,000 character names & IDs (465KB)
│   └── locations.json                        # Geographic location data (5MB)
├── scripts/
│   ├── parse-souls.ts                        # SOUL.md / IDENTITY.md → JSON parser
│   ├── import-souls.ts                       # JSON → Directus database importer
│   └── README.md                             # Script documentation
├── misc/
│   └── social.jpg                            # Social media preview image
├── patches/                                  # npm patch files
├── llm.json                                  # Complete OpenAPI spec for LLM context
├── Dockerfile                                # Multi-stage Docker build
├── docker-compose.yml                        # Local development compose
├── docker-compose.coolify.yml                # Production Coolify compose
├── package.json                              # Root workspace configuration
├── bun.lock                                  # Bun package manager lockfile
├── turbo.json                                # Turborepo build configuration
└── README.md                                 # Project documentation
```

---

## Technology Stack

### Core Infrastructure

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **API Platform** | Directus | ^11.12.0 | Headless CMS providing REST API, admin UI, and data management |
| **Database** | PostgreSQL | — | Primary data store for all codex, file, and configuration data |
| **Runtime** | Node.js | 20+ | Production runtime for Directus |
| **Build Runtime** | Bun | 1.2.0 | Package management, script execution, and development builds |
| **Language** | TypeScript | 5.9.3 | Primary development language across all packages |

### Image & Media

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Sharp** | ^0.34.4 | On-the-fly image transformations (resize, format conversion, effects) |
| **IPFS** | — | Decentralized storage for character images, backgrounds, and composites |

### Documentation & Search

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zudoku** | 0.66.4 | Documentation site generator with React/MDX support |
| **React** | >=19.0.0 | UI framework for documentation components |
| **Pagefind** | — | Static site search with custom ranking |

### Build & DevOps

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Turborepo** | ^2.5.8 | Monorepo orchestration with task dependency graph |
| **Docker** | — | Multi-stage containerization for production deployment |
| **ESLint** | ^8.57.1 | Code linting and style enforcement |

### Blockchain & Web3

| Technology | Purpose |
|-----------|---------|
| **The Graph** | Decentralized indexing protocol for on-chain owner data |
| **Viem** | ENS name resolution with multicall batching (in Explorer) |

### Client Libraries

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Directus SDK** | ^21.0.0 | Client library for Directus API operations |
| **Directus Extensions SDK** | ^16.0.2 | Extension development toolkit |

### Utilities

| Technology | Version | Purpose |
|-----------|---------|---------|
| **cli-progress** | ^3.12.0 | Progress bar indicators for batch operations |
| **dotenv** | ^17.2.3 | Environment variable management |
| **Lodash** | ^4.17.21 | Utility functions |
| **ajv** | ^8.12.0 | JSON schema validation |
| **@sindresorhus/slugify** | ^2.2.1 | URL slug generation |
| **pg** | ^8.13.1 | PostgreSQL client for Node.js |

### Third-Party Directus Extensions

| Extension | Version | Purpose |
|-----------|---------|---------|
| **directus-extension-sync** | ^3.0.5 | Configuration synchronization across environments |
| **directus-extension-api-docs** | ^2.3.1 | OpenAPI documentation UI within Directus admin |
| **directus-extension-raw-query** | ^1.0.2 | Raw SQL query execution for advanced operations |

---

## Directus Extension System

The custom `directus-extension-codex` is the heart of the API's business logic. It provides initialization, seeding, and maintenance hooks that run within the Directus lifecycle.

### Initialization Hook (`init`)

**Location:** `apps/api/extensions/directus-extension-codex/src/init/index.ts`
**Event:** `app.before` (runs before Directus is fully started)

This hook handles the initial bootstrap of the Codex data:

1. **Checks database state** — Determines if Directus needs bootstrapping or migration
2. **Connects to IPFS** — Reads the codex files CID from configuration
3. **Fetches seed data** — Downloads 10,000 character data files from IPFS in batches
4. **Retry logic** — Uses exponential backoff for resilient IPFS fetching
5. **Creates seed files** — Generates individual JSON seed files from the IPFS data

**IPFS configuration:**
- Development gateway: `http://127.0.0.1:8080`
- Production gateway: `https://ipfs.qwellcode.de`
- Codex files hash: `QmPm4Tgbt1MM5dE343mqsFkXwdzdmyUCQznf6SdD7fm4W2`

### Seeding Hook (`codex-seed`)

**Location:** `apps/api/extensions/directus-extension-codex/src/seed/index.ts`
**Event:** `app.after` (runs after Directus is fully started)

This hook populates the database with character data:

1. **Checks existing data** — Queries the codex collection to see if it already contains 10,000+ items
2. **Reads seed files** — If data is missing, reads JSON files from the seed directory
3. **Parses codex data** — Extracts character metadata and IPFS hash references
4. **Inserts records** — Creates codex items with all metadata fields populated
5. **Processes images** — Creates thumbnail references and organizes files by folder
6. **Handles relationships** — Links character records to their associated file assets

### Owner Update Hook (`update-codex-owners`)

**Location:** `apps/api/extensions/directus-extension-codex/src/hooks/update-codex-owners.ts`
**Schedule:** Cron job running every hour (`0 * * * *`)

This hook keeps owner data synchronized with the blockchain:

1. **Queries The Graph** — Sends GraphQL queries to the Art Decc0s subgraph
2. **Subgraph endpoint:** `https://gateway.thegraph.com/api/{key}/subgraphs/id/G39v7PFNz911KNWga8erpgei622XKQLW7P6JBmm6fC97`
3. **Batch processing** — Fetches token owners in batches of 1,000 with pagination
4. **Updates records** — Writes current owner Ethereum addresses (lowercase) to the `owner` field
5. **Requires:** `THE_GRAPH_API_KEY` environment variable

### Price Update Hook (`update-codex-prices`)

**Location:** `apps/api/extensions/directus-extension-codex/src/hooks/`

Updates pricing information from marketplace data sources. Requires the `OPENSEA_API_KEY` environment variable for marketplace integration.

### Filter Hook (`filter-codex-fields`)

**Location:** `apps/api/extensions/directus-extension-codex/src/hooks/filter-codex-fields.ts`
**Event:** `items.read` (intercepts codex item read responses)

A response filter that can conditionally modify codex read responses. Currently passes through unchanged but provides a hook point for future field-level access control.

---

## Deployment & Infrastructure

### Multi-Stage Dockerfile

The production build uses a three-stage Docker build process:

#### Stage 1: Builder

```dockerfile
FROM oven/bun:1.2.0-alpine AS builder
```

- Installs Turborepo and build dependencies
- Installs native module compilation tools (Python, make, GCC, Sharp dependencies)
- Runs `turbo build` targeting the API, config, and extension packages
- Creates empty seed and migration directories if they don't exist
- Outputs compiled extensions and configuration

#### Stage 2: Third-Party Extensions

```dockerfile
FROM node:20-slim AS third-party-extensions
```

- Installs community Directus extensions:
  - `directus-extension-api-docs` — OpenAPI documentation UI
  - `directus-extension-sync` — Configuration synchronization
- Moves compiled extensions to standard Directus locations

#### Stage 3: Production

```dockerfile
FROM directus/directus:latest
```

- Copies compiled extensions from both builder and third-party stages
- Copies Directus configuration snapshots
- Copies database migrations
- Exposes port 8055
- Configures health check: `curl -f http://localhost:8055/server/health`
- Entry command: `npx directus start`

### Docker Compose

**Local development** (`docker-compose.yml`):
- Directus API container
- PostgreSQL database
- Redis cache (optional)
- Mounted volumes for development

**Production** (`docker-compose.coolify.yml`):
- Optimized for deployment via Coolify
- Production environment variables
- Health checks and restart policies

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_TOKEN` | Yes | Directus admin/static token for authenticated operations |
| `PUBLIC_URL` | Yes | Public-facing API URL (e.g., `https://api.decc0s.com`) |
| `DB_CLIENT` | Yes | Database client (e.g., `pg` for PostgreSQL) |
| `DB_HOST` | Yes | Database hostname |
| `DB_PORT` | Yes | Database port (default: 5432) |
| `DB_DATABASE` | Yes | Database name |
| `DB_USER` | Yes | Database username |
| `DB_PASSWORD` | Yes | Database password |
| `THE_GRAPH_API_KEY` | Yes | API key for The Graph subgraph queries |
| `OPENSEA_API_KEY` | No | OpenSea API key for marketplace price data |
| `IPFS_GATEWAY` | No | IPFS gateway URL (defaults vary by environment) |
| `IPFS_CODEX_HASH` | No | IPFS CID of the codex files directory |
| `REDIS` | No | Redis connection URL |
| `REDIS_ENABLED` | No | Enable/disable Redis caching |
| `LOG_LEVEL` | No | Logging level: `debug`, `info`, `warn`, `error` |

---

## Configuration Layers

### The `@local/config` Package

The `packages/config/` package provides environment-specific configuration that other packages import:

#### Development (`config.development.ts`)

```typescript
{
  env: "development",
  api: { baseUrl: "http://localhost:8055" },
  ipfs: {
    gateway: "http://127.0.0.1:8080",
    codex_files_hash: "QmPm4Tgbt1MM5dE343mqsFkXwdzdmyUCQznf6SdD7fm4W2"
  },
  directus: {
    codexFolderId: null,
    codexFolderName: "Codex",
    ipfsGateway: "https://ipfs.qwellcode.de"
  }
}
```

#### Staging (`config.staging.ts`)

```typescript
{
  env: "staging",
  moca: { api: { baseUrl: "https://api.moca.qwellco.de" } },
  ipfs: { gateway: "https://ipfs.qwellcode.de" }
}
```

#### Production (`config.production.ts`)

```typescript
{
  env: "production",
  moca: { api: { baseUrl: "https://api.moca.qwellco.de" } },
  ipfs: { gateway: "https://ipfs.qwellcode.de" }
}
```

**Public production API:** `https://api.decc0s.com`

### Turborepo Configuration

The `turbo.json` file defines the build task graph:

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".output/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "check-types": {}
  }
}
```

**Workspace structure:**
```
workspaces:
  - apps/api
  - apps/api/extensions/*
  - apps/documentation
  - packages/*
```

**Remote cache:**
- Team: `moca`
- API: `https://remote-cache.deploy.qwellco.de`

### TypeScript Types

The `packages/types/` package provides shared type definitions:

- `index.d.ts` — General shared types
- `directus.d.ts` — Complete Directus schema type definitions for the codex collection, including all fields, their types, and relationships

These types ensure type safety across the API, extensions, and scripts.

---

## Data Files

### `data/decc0s.json` (465KB)

A JSON array of all 10,000 character records, each containing:

```json
[
  { "id": 1, "name": "Parvata" },
  { "id": 2, "name": "Bar" },
  { "id": 3, "name": "Wachi-Ruq" },
  { "id": 4, "name": "Kod" },
  { "id": 5, "name": "Balina" }
]
```

This serves as the master reference list for all characters in the collection.

### `data/locations.json` (5MB)

Geographic location data including coordinates, municipalities, and cultural information. Referenced by the Codex to assign residence and significant locations to each character.

### `llm.json`

A complete OpenAPI 3.0.1 specification for the Codex API, designed to be fed directly to LLMs as context for building integrations. This is the same specification served by the documentation site but packaged as a local file for convenience.

---

*Previous: [The Vibe Studio](./07-vibe-studio.md) | Next: [Building with the Codex](./09-building-with-the-codex.md)*
