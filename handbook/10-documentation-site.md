# 10. The Documentation Site

> docs.decc0s.com — structure, interactive playground, LLM integration, Pagefind search, and building the docs.

---

## Overview

The Codex API documentation is hosted at [docs.decc0s.com](https://docs.decc0s.com) and built using **Zudoku**, a modern documentation framework powered by React and MDX. The site provides interactive API documentation, live playground environments, and machine-readable context files for LLM integration.

The documentation site lives at `apps/documentation/` in the Codex monorepo and is built and deployed alongside the API.

---

## Site Configuration

The documentation is configured through `zudoku.config.tsx`:

| Setting | Value |
|---------|-------|
| **Title** | MOCA Codex Documentation |
| **Logo** | MOCA branding (light/dark variants) |
| **Search** | Pagefind with custom ranking |
| **API spec** | OpenAPI 3.0.1 from `apis/openapi.json` |
| **LLM support** | `llms.txt` and `llms-full.txt` generation enabled |
| **Markdown publishing** | Enabled for all documentation pages |

---

## Documentation Structure

The site is organized into a clear navigation hierarchy:

### Getting Started

| Page | Path | Description |
|------|------|-------------|
| **Introduction** | `/introduction` | API overview, key features, base URL, and links to all sections |
| **Getting Started** | `/getting-started` | Step-by-step first API calls with curl examples |

### Endpoints

| Page | Path | Description |
|------|------|-------------|
| **Codex Endpoints** | `/codex` | Full documentation for `/items/codex` and `/items/codex/{id}` with schema, moltbot data, and filtering examples |
| **Files Endpoints** | `/files` | Documentation for `/files`, `/files/{id}`, and `/assets/{id}` with transformation parameters |

### Guides

| Page | Path | Description |
|------|------|-------------|
| **Query Guide** | `/query-guide` | Comprehensive guide covering field selection, all filter operators, logical operators (AND/OR), sorting, pagination, full-text search, and metadata |

### Reference

| Link | Path | Description |
|------|------|-------------|
| **API Reference** | `/api` | Interactive OpenAPI specification with full endpoint documentation |
| **Examples** | `/examples` | Interactive examples with "Open in Playground" buttons |

### Useful Links

| Link | URL | Description |
|------|-----|-------------|
| **Directus Docs** | `https://docs.directus.io/` | Upstream Directus documentation for advanced query features |
| **LLMs.txt** | `/llms.txt` | Lightweight machine-readable API context |
| **LLMs.txt Full** | `/llms-full.txt` | Complete documentation in LLM-friendly format |
| **OpenAPI Reference** | `https://api.decc0s.com/api-docs/oas` | Raw OpenAPI specification from the live API |

---

## Interactive API Playground

Every example in the documentation includes an **"Open in Playground"** button powered by Zudoku's `OpenPlaygroundButton` component. This launches an interactive environment where developers can:

- **Modify query parameters** in real time using form fields
- **Execute requests** directly against the live production API at `api.decc0s.com`
- **Inspect responses** — full response bodies, headers, and status codes
- **Experiment with filters** — try different filter operators and combinations without writing code
- **Test pagination** — adjust limit and offset to see pagination behavior

### Example Categories

The playground examples are organized into four categories:

#### Codex Examples
| Example | Description |
|---------|-------------|
| **Query by Owner** | Filter by Ethereum wallet address with address format guidance |
| **List Items** | Basic item listing with field selection |
| **Get by ID** | Single item retrieval |
| **Filter by Name** | Name-based filtering with `_contains` |
| **Pagination** | Limit/offset pagination with metadata |
| **Sorting** | Ascending and descending sort patterns |
| **Full-Text Search** | Cross-field search with filter combination |

#### Files Examples
| Example | Description |
|---------|-------------|
| **List Files** | Basic file listing with metadata |
| **Filter Images** | Filter by MIME type to show only images |
| **Get Metadata** | Individual file metadata including Exif/IPTC |
| **Recent Files** | Sort by upload date with limiting |

#### Assets Examples
| Example | Description |
|---------|-------------|
| **Image Presets** | Using `s128`, `s256`, `s512`, `s1024` preset keys |
| **Custom Transformations** | Width, height, format, quality, and fit parameters |
| **Sharp Transformations** | Advanced operations: rotate, blur, grayscale, sharpen, flip, tint |

#### Advanced Examples
| Example | Description |
|---------|-------------|
| **Complex Filters** | Combining `_and` and `_or` logical operators with nested conditions |
| **Exclude Null Values** | Using `_nnull` to filter out incomplete records |

---

## LLM Integration

The documentation site generates machine-readable context files specifically designed for AI/LLM consumption:

### Available Endpoints

| Endpoint | Format | Purpose |
|----------|--------|---------|
| `https://docs.decc0s.com/llms.txt` | Plain text | Lightweight API context — summary of endpoints, parameters, and capabilities |
| `https://docs.decc0s.com/llms-full.txt` | Plain text | Complete documentation content in LLM-friendly format — all pages, examples, and guides |
| `https://api.decc0s.com/api-docs/oas` | JSON | Raw OpenAPI 3.0.1 specification from the live API |

### Local LLM Context File

The repository also includes `llm.json` at the root — a complete OpenAPI 3.0.1 specification that can be fed directly to LLMs as context for building Codex-powered applications without making any HTTP requests.

### Using LLM Context

These endpoints enable AI-powered development workflows:

**Feed to an LLM for code generation:**
```bash
# Download the full documentation context
curl https://docs.decc0s.com/llms-full.txt > codex-docs.txt

# Use with your preferred LLM to generate integration code
```

**Use the OpenAPI spec for automated client generation:**
```bash
# Download the OpenAPI specification
curl https://api.decc0s.com/api-docs/oas > openapi.json

# Generate a client library
npx openapi-generator-cli generate -i openapi.json -g typescript-fetch -o ./codex-client
```

**Use the local `llm.json` file:**
```bash
# Already in the repository at the root
cat llm.json | your-llm-tool --context
```

### Zudoku LLM Configuration

LLM output is configured in `zudoku.config.tsx`:

```typescript
docs: {
  files: "pages/**/*.{md,mdx}",
  publishMarkdown: true,
  llms: {
    llmsTxt: true,        // Generate llms.txt
    llmsTxtFull: true,    // Generate llms-full.txt
    includeProtected: false
  }
}
```

---

## Search

The documentation uses **Pagefind** for static site search, providing fast, client-side search across all documentation content.

### Ranking Configuration

Custom ranking parameters in `zudoku.config.tsx`:

| Parameter | Value | Effect |
|-----------|-------|--------|
| `termFrequency` | 0.8 | How much repeated terms boost relevance |
| `pageLength` | 0.6 | How much shorter pages are boosted (lower = less boost) |
| `termSimilarity` | 1.2 | How much fuzzy matches are boosted |
| `termSaturation` | 1.2 | Diminishing returns for repeated terms |

### Sub-Results

Pagefind is configured to show up to **3 sub-results** per matching page, helping users find the specific section they need within longer documentation pages.

### URL Fix Plugin

A custom Zudoku plugin (`fix-pagefind-urls`) automatically fixes URL formatting in search results, ensuring clean URLs without `.html` extensions. This maintains a consistent URL structure throughout the documentation site.

The plugin processes both main result URLs and sub-result URLs, using a regex replacement:
```typescript
url.replace(/\.html(?=[#?]|$)/, "")
```

---

## Building the Documentation

### Development

```bash
# Install dependencies (from repo root)
bun install

# Start the documentation dev server
bun run dev --filter=documentation
```

The development server provides hot reloading for MDX content and React component changes.

### Production Build

```bash
# Build the documentation site
bun run build --filter=documentation
```

### Page Format

Documentation pages are written in **MDX** (Markdown + JSX), supporting React components alongside standard markdown:

**Available components:**

| Component | Package | Purpose |
|-----------|---------|---------|
| `Callout` | `zudoku/ui/Callout` | Notes, tips, warnings, and cautions with icons |
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | `zudoku/ui/Card` | Content cards for feature grids |
| `Stepper` | `zudoku/ui/Stepper` | Step-by-step guides with numbered steps |
| `OpenPlaygroundButton` | Zudoku built-in | Interactive API playground launcher |

**Example MDX page:**

```mdx
---
title: Page Title
description: Page description for SEO
---

import { Callout } from "zudoku/ui/Callout";
import { API_BASE_URL } from "../constants";

## Section Title

Regular markdown content here.

<Callout type="tip" title="Pro Tip" icon>
  Use field selection to reduce response size.
</Callout>

<OpenPlaygroundButton
  server={API_BASE_URL}
  url="/items/codex"
  method="GET"
  queryParams={[
    { name: "fields", defaultValue: "id,name" },
    { name: "limit", defaultValue: "10" }
  ]}
/>
```

### Constants

The shared API base URL is defined in `apps/documentation/constants.ts`:

```typescript
export const API_BASE_URL = "https://api.decc0s.com";
```

This is imported by all documentation pages to ensure consistency.

### Custom Plugins

Two custom Zudoku plugins are used:

1. **`uncheck-query-params`** — Manages default query parameter state in the API reference
2. **`fix-pagefind-urls`** — Cleans `.html` extensions from Pagefind search result URLs

---

*Previous: [Building with the Codex](./09-building-with-the-codex.md) | Next: [Appendix](./11-appendix.md)*
