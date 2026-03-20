# 6. The Codex Explorer

> The web application for browsing Art Decc0s — gallery, filtering, character profiles, agent integration, and architecture.

---

## Overview

The Codex Explorer is a high-performance web application for browsing and exploring all 10,000 Art Decc0s. It serves as the primary visual interface to the Codex, offering:

- An immersive gallery experience with multiple viewing modes
- Powerful search and filtering across nine categories
- Detailed character profiles with full Codex data
- Built-in agent framework integration with one-click SOUL.md access
- A zero-refetch architecture that loads the entire collection once and processes everything client-side

**Repository:** [github.com/mocaOS/codex-explorer](https://github.com/mocaOS/codex-explorer)

The Explorer is not just a gallery — it is a practical developer tool for discovering characters and integrating their personalities into AI agents.

---

## Gallery Experience

### Grid Layout

The Explorer displays all 10,000 Art Decc0s in a responsive grid layout with infinite scroll. As the user scrolls, new items appear seamlessly — but behind the scenes, virtual pagination renders only **36 visible items at a time** for optimal performance.

### Viewing Controls

| Control | Options | Description |
|---------|---------|-------------|
| **Sorting** | Ascending, Descending, True Random | Order characters by ID or shuffle randomly |
| **Zoom** | 0%–100% slider | Adjusts from 10 columns (tiny thumbnails) down to 1 column (full-width) |
| **Quality** | 256p, 1024p, 4K | Resolution of displayed images |
| **Hover mode** | Composite / Character-only | Toggle what you see when hovering over a character |
| **Museum Mode** | On / Off | Fullscreen immersive experience with smart zoom adaptation |

The **sticky control bar** remains visible while scrolling, so users always have access to sorting, zoom, and quality controls without scrolling back to the top.

### Hover Interaction

When hovering over a character in the grid, the Explorer can toggle between:
- **Composite view** — The full artwork (character + background)
- **Character-only view** — The silhouette without the background

This allows collectors to see how the character looks in isolation versus in their full art-historical context.

### Museum Mode

Museum Mode transforms the browser into an immersive gallery experience:
- **Fullscreen display** removes all browser chrome and navigation
- **Smart zoom** adapts the viewing experience for optimal fullscreen proportions
- Characters are displayed at maximum quality for detailed appreciation

---

## Search & Filtering

### Search

The Explorer provides two search mechanisms:

- **Token ID exact matching** — Enter a number to jump directly to a specific character
- **Character name partial matching** — Type part of a name to find matching characters

### Filter Categories

Nine filterable categories allow deep exploration of the collection:

| Category | What It Filters | Example Values |
|----------|----------------|----------------|
| **Character Type** | The form classification | Standard, Conceptual |
| **Background Style** | Which of the 16 art historical categories | Surrealism, Japanese Woodblock, Pop Art |
| **Background Texture** | The specific texture within a style category | Various sub-styles |
| **Mood** | The character's emotional baseline | Contemplative, Fiery, Aloof |
| **DNA Lineage** | DNA1 — collector/patron archetype | Medici, Sultan, Warlord |
| **DNA Memetic** | DNA2 — crypto culture icon | Pepe, Chromie Squiggle, CryptoPunks |
| **DNA Artist** | DNA3 — classical/contemporary artist | Van Gogh, Frida Kahlo, Kusama |
| **MOCA Collection** | DNA4 — which MOCA artwork | Specific artworks from the three collections |
| **Owner** | Current Ethereum wallet owner | Wallet addresses with ENS resolution |

### Filter Logic

Filters use smart OR/AND logic:
- **Within a category:** OR logic — selecting "Surrealism" and "Pop Art" in Background Style shows characters with *either* style
- **Between categories:** AND logic — selecting "Surrealism" in Background Style *and* "Medici" in DNA Lineage shows only characters matching *both* criteria

### Multi-Select with Counts

Each filter option displays an **occurrence count** showing how many characters have that trait. This lets users understand the distribution of traits across the collection before filtering. Filter options are presented as multi-select checkboxes for easy combination.

### ENS Name Resolution

When filtering by Owner, the Explorer automatically resolves Ethereum wallet addresses to human-readable **ENS names** (e.g., `vitalik.eth`). This resolution happens in the background using Viem with multicall batching, processing up to 100 address lookups per RPC request.

---

## Character Profiles

Each character has a comprehensive profile page accessible by clicking on their grid thumbnail. The profile displays the full richness of their Codex data.

### Profile Sections

**Visual**
- Full-resolution composite artwork
- Character-only image
- Background-only image
- Image descriptions and summaries generated by vision models

**Identity & Biography**
- Name, description, and full biographical narrative
- Ancestral connections and lineage information
- Self-identity description
- Cultural affiliations and philosophical worldview

**Personality**
- Mood and temperament
- Problem-solving approach
- Expression style
- Confession — a personal vulnerable admission

**Artistic Preferences**
- Art styles loved, liked, and disliked
- Favorite crypto artist
- Favorite role in the art world
- Crypto art focus area
- View on traditional art

**Favorites**
- Favorite book, color, animal
- Kindred spirit
- Metaphor domain

**Writing & Communication**
- Writing style description
- Writing flavor and cultural influences
- Punctuation habits (commas, ellipses, exclamations, questions, quotation marks)
- Sentence complexity
- Writing quirks
- Ideolectal vocabulary (words unique to this character)

**DNA & Traits**
- All four DNA inputs with their values
- DeCC0 type classification
- Background category and texture

**Location**
- Municipality of residence with coordinates
- Significant municipality with coordinates
- Cultural affiliation

**Blockchain**
- Current owner address (with ENS resolution)
- NFT price

---

## Agent Integration Interface

The Explorer includes built-in agent framework integration, making it a practical tool for developers building AI agents.

### Moltbot Files

Each character profile includes a **Moltbot** section displaying:
- **IDENTITY.md** — Full rendered content with one-click copy to clipboard
- **SOUL.md** — Full rendered content with one-click copy to clipboard
- **Download buttons** — Download either file individually
- **Version indicators** — Shows which version (e.g., v0.1) is displayed

### ElizaOS Agent Profiles

For characters with pre-built ElizaOS configurations, the profile displays:
- System prompts tailored for ElizaOS
- Conversation examples demonstrating the character's voice
- Behavioral configuration parameters
- One-click copy for easy import

### The "Integrate" Button

A prominent **"Integrate" button** on each character profile jumps directly to the agent configuration section. This shortcut acknowledges that many visitors to the Explorer are developers looking for personality data, not just art collectors browsing a gallery.

### Developer Workflow

A typical developer workflow using the Explorer:

1. **Browse** the gallery to find visually interesting characters
2. **Filter** by mood, DNA, or other traits to narrow the search
3. **Open** a character profile to read their full personality
4. **Click "Integrate"** to jump to the agent data section
5. **Copy** the SOUL.md and IDENTITY.md content
6. **Paste** into your agent framework's personality configuration

---

## Architecture & Performance

### Technology Stack

| Technology | Role |
|------------|------|
| **Nuxt 3** | Framework with Server-Side Rendering |
| **Vue 3 Composition API** | Reactive state management |
| **TanStack Query (Vue Query)** | Data fetching and caching |
| **Axios** | HTTP client for API calls |
| **Viem** | ENS name resolution with multicall batching |
| **Directus** | Asset transformation backend |
| **Tailwind CSS** | Utility-first CSS styling |

### Zero-Refetch Architecture

The Explorer's most distinctive technical feature is its **zero-refetch architecture**. Rather than paginating API requests as users scroll and filter, the entire collection is loaded once:

1. **Server renders page shell** — Instant response with SSR (no data fetching on server)
2. **Client hydration** — Completes in ~400ms, making the page interactive
3. **Single API call** — Fetches all 10,000 items from `api.decc0s.com/items/codex` (~2–3 seconds)
4. **Permanent cache** — Data is cached with a static query key, never refetched
5. **Client-side processing** — All filtering, sorting, and searching happens in-browser
6. **Virtual pagination** — Only 36 visible items are rendered at any time

This means:
- **Filter changes trigger zero API calls** — Toggling a filter is instantaneous
- **Sort changes trigger zero API calls** — Reordering is instantaneous
- **Search is instantaneous** — No network latency on every keystroke
- **The gallery feels native** — Like a local application, not a web page

### Image Delivery

| Resolution | Source | Transformation |
|------------|--------|---------------|
| 256p | Directus | `?key=s256` preset |
| 1024p | Directus | `?key=s1024` preset |
| 4K | IPFS | Full resolution from `ipfs_final` hash |

### Performance Characteristics

| Metric | Value |
|--------|-------|
| Time to interactive | ~400ms (SSR + hydration) |
| Full data load | ~2–3 seconds (single API call) |
| Filter/sort latency | Instantaneous (client-side) |
| Items rendered at once | 36 (virtual pagination) |
| ENS batch size | Up to 100 per RPC request |
| API calls per session | 1 (for initial data load) |

### Deployment

The Codex Explorer is built as a **Nuxt 3 SSR application** that generates a Node.js server in the `.output/server/` directory. It can be deployed to any Node.js-compatible hosting platform.

---

*Previous: [SOUL.md & The Moltbot Agent System](./05-soul-md-and-moltbot.md) | Next: [The Vibe Studio](./07-vibe-studio.md)*
