# 5. SOUL.md & The Moltbot Agent System

> SOUL.md files, IDENTITY.md files, the Moltbot versioning system, agent framework integration, and personality generation.

---

## Overview

At the heart of the Art Decc0s agent system lies a pair of markdown files — **SOUL.md** and **IDENTITY.md** — that together define a complete AI agent personality. These files transform static NFT characters into functional digital beings that can be integrated into any modern agent framework.

The Codex provides **10,000 unique identities** ready for immediate use in frameworks like **ElizaOS**, **Hermes Agent**, **OpenClaw**, and any other platform that accepts text-based personality definitions.

---

## What Are SOUL.md Files?

SOUL.md files are structured markdown documents that define a complete AI agent personality. Each SOUL.md is a comprehensive behavioral blueprint containing:

### Core Temperament
The fundamental character of the being — their emotional baseline, psychological disposition, and primary way of relating to the world. This might be "fractured; surreal; paradoxical" for one character or "warm; methodical; deeply curious" for another.

### Voice Rules
Explicit rules governing how the character speaks and communicates:
- Sentence structure preferences (simple, compound, labyrinthine)
- Vocabulary register (casual, academic, poetic, technical)
- Punctuation habits (comma density, ellipsis usage, exclamation frequency)
- Cultural linguistic influences
- Topics they gravitate toward or avoid

### Style Exemplars
Example text passages showing the character's voice in action. These exemplars serve as concrete reference points for AI models to match — not just abstract rules, but actual demonstrations of how the character writes.

### Behavioral Guidelines
How the character acts and reacts in different situations:
- How they respond to disagreement
- What topics excite or bore them
- Their relationship with authority, creativity, and tradition
- Whether they initiate or respond, lead or observe
- How they handle uncertainty, conflict, and surprise

### Writing Patterns
Specific linguistic traits and quirks unique to each character:
- Favorite words and phrases (ideolectal vocabulary)
- Sentence complexity preferences
- Cultural writing influences
- Characteristic rhetorical devices
- How they use questions, quotations, and emphasis

A SOUL.md file can be dropped into any modern agent framework to instantly give an AI agent a unique, consistent personality. It is the bridge between the Art Decc0s art collection and the agentic AI ecosystem.

### Example SOUL.md Structure

```markdown
# SOUL.md — Parvata

You are Parvata. Stay consistent with your identity.

## Core Temperament
fractured; surreal; paradoxical — you think in contradictions
and find truth at the collision points of opposing ideas...

## Voice Rules
- Speak in medium-length sentences with occasional fragments
- Use ellipses sparingly but meaningfully
- Favor concrete imagery over abstract language
- Reference visual art naturally in conversation
- Never explain your jokes

## Style Exemplars
"The canvas doesn't care about your intentions. It records
what your hands actually did, which is always more honest
than what your mouth claims..."

## Behavioral Guidelines
- When asked about traditional art, become animated
- When challenged, pause before responding
- Express opinions confidently but welcome disagreement
- Occasionally reference your residence in Cairo
```

---

## IDENTITY.md Files

IDENTITY.md files complement SOUL.md with structured metadata about each character. While SOUL.md defines *how* the character behaves, IDENTITY.md defines *who* they are in factual terms.

### Contents

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | The character's name | Parvata |
| **Emoji** | A representative emoji | :ocean: |
| **Self-identity** | How the character perceives themselves | "a male person" |
| **Residence** | Municipality and geographic context | "Cairo, Cairo Governorate, Egypt" |
| **Characterization** | Physical and personality summary | Paragraph describing appearance and demeanor |
| **Cultural affiliations** | Cultural background and connections | Egyptian, cosmopolitan |

### Example IDENTITY.md Structure

```markdown
# IDENTITY.md

Name: Parvata
Emoji: 🌊

Self-identity: a male person
Residence: Cairo, Cairo Governorate, Egypt
Coordinates: 30.0444, 31.2357

Characterization: A tall figure with fluid posture,
favoring dark layers that contrast with the desert
light of his adopted city...

Cultural Affiliation: Egyptian by residence, Slovenian
by ancestry, cosmopolitan by disposition...
```

### The Relationship Between SOUL.md and IDENTITY.md

Together, these two files provide everything an AI agent needs to embody a specific Art Decc0 character:

| SOUL.md | IDENTITY.md |
|---------|-------------|
| How they think | Who they are |
| How they speak | Where they're from |
| How they react | What they look like |
| What they believe | What they're called |
| Their quirks and habits | Their factual attributes |

SOUL.md is subjective and behavioral. IDENTITY.md is objective and factual. An agent framework uses both to create a complete, grounded personality.

---

## The Moltbot Versioning System

Character data is stored in the Codex database's `moltbot` field using a versioned JSON structure that allows personalities to evolve without losing history.

### Structure

```json
{
  "moltbot": {
    "v0.1": {
      "soul": "# SOUL.md — Parvata\n\nYou are Parvata, a contemplative soul...",
      "identity": "# IDENTITY.md\n\nName: Parvata\nEmoji: 🌊\nResidence: ..."
    },
    "v0.2": {
      "soul": "# SOUL.md — Parvata (Revised)\n\nYou are Parvata...",
      "identity": "# IDENTITY.md\n\nName: Parvata\nEmoji: 🌊..."
    }
  }
}
```

### Design Principles

**Character evolution** — Personalities can be refined over time as the team discovers what works and what doesn't. Version v0.1 represents the initial personality; future versions can adjust tone, add depth, or correct inconsistencies.

**Non-destructive updates** — New versions are merged with existing data, preserving all previous versions. Importing v0.2 does not overwrite v0.1 — both coexist in the same record.

**A/B testing** — Multiple personality versions can coexist, allowing developers to compare how different personality configurations perform in their agent implementations.

**Backward compatibility** — Older integrations that reference a specific version (e.g., `v0.1`) continue working unchanged, even as newer versions are added.

**Future-proofing** — As agent frameworks evolve and new capabilities emerge, personality definitions can be updated to take advantage of them without breaking existing deployments.

### Accessing Moltbot Data via API

```bash
# Get moltbot data for a specific character
curl "https://api.decc0s.com/items/codex/1?fields=id,name,moltbot"
```

Response:
```json
{
  "data": {
    "id": 1,
    "name": ["Parvata"],
    "moltbot": {
      "v0.1": {
        "soul": "# SOUL.md — Parvata\n\nYou are Parvata. Stay consistent with your identity.\n\n## Core Temperament\nfractured; surreal; paradoxical...",
        "identity": "# IDENTITY.md\n\nName: Parvata\nEmoji: 🌊\n\nSelf-identity: a male person\nResidence: Cairo, Cairo Governorate, Egypt..."
      }
    }
  }
}
```

---

## Integrating with Agent Frameworks

SOUL.md files provide 10,000 unique identities designed to be framework-agnostic. The system works with any agent platform that accepts text-based personality definitions.

### General Integration Pattern

The core pattern is the same regardless of framework:

1. **Fetch** the character's moltbot data from the Codex API
2. **Extract** the SOUL.md and IDENTITY.md content for the desired version
3. **Combine** them into a system prompt or personality configuration
4. **Pass** to your agent framework's personality/system prompt mechanism

```javascript
// Universal integration pattern
const response = await fetch('https://api.decc0s.com/items/codex/42?fields=id,name,moltbot');
const { data } = await response.json();

const version = 'v0.1';
const soul = data.moltbot[version].soul;
const identity = data.moltbot[version].identity;
const systemPrompt = `${soul}\n\n${identity}`;
```

### ElizaOS

The Codex includes **pre-built ElizaOS agent profiles** with system prompts, conversation examples, and behavioral configurations. These are stored in the `agent_profiles` field and can be fetched directly:

```bash
curl "https://api.decc0s.com/items/codex/42?fields=id,name,agent_profiles"
```

ElizaOS profiles include:
- System-level personality prompts derived from SOUL.md
- Example conversations showing the character's voice
- Behavioral configuration parameters
- Topic affinities and avoidances

### Hermes Agent

SOUL.md files map directly to Hermes Agent personality configurations. The structured voice rules and behavioral guidelines translate to Hermes-compatible agent definitions:

- **Core temperament** maps to the agent's base personality
- **Voice rules** map to communication style parameters
- **Behavioral guidelines** map to response patterns and topic handling
- **Style exemplars** serve as few-shot examples for the model

### OpenClaw & Other Frameworks

The markdown-based SOUL.md format is intentionally simple and universal. Any agent framework that accepts a system prompt or personality definition can consume SOUL.md content. The structured format includes four key layers:

1. **System-level personality definition** — The "who am I" (core temperament, philosophical worldview)
2. **Communication rules** — The "how do I speak" (voice rules, writing patterns, vocabulary)
3. **Behavioral boundaries** — The "what do I do and don't do" (behavioral guidelines, topic handling)
4. **Style demonstrations** — The "this is what I sound like" (exemplar passages)

### Batch Integration

For applications that need multiple agents (e.g., a multi-agent simulation or a gallery of conversational characters):

```bash
# Fetch moltbot data for the first 100 characters
curl "https://api.decc0s.com/items/codex?fields=id,name,moltbot&limit=100"

# Fetch specific characters by ID
curl "https://api.decc0s.com/items/codex?fields=id,name,moltbot&filter[id][_in]=1,42,100,7777"
```

---

## Personality Generation Process

Each character's personality was not randomly assigned but carefully generated through a multi-layered process involving 20+ metadata vectors. The goal was to create characters that feel genuinely distinct — not 10,000 variations of the same polite, articulate archetype.

### Ancestral Connections

Characters reference historical art collectors whose patronage influence shapes their modern perspectives:
- Industrialists, kings, sultans, bankers
- The patron's values and priorities subtly color the character's worldview
- A character descended from a Medici patron might emphasize beauty and refinement
- A character descended from a Soviet propagandist might value collective impact over individual expression

### Artistic Preferences

Each DeCC0 has a specific, opinionated relationship with art:

- **Enthusiasm for lesser-known movements** — Characters champion obscure or underappreciated art movements, paired with disdain for whatever they consider mainstream or overhyped
- **Specific crypto art interests** — Each has particular crypto art niches they follow and champion
- **A favorite Genesis Collection artist** — Mentioned naturally and unprompted in conversation
- **Traditional vs. digital art stance** — Ranging from reverent traditionalism to digital-only purism to nuanced both-and positions

### Cultural & Philosophical Traits

- **Global cultural affiliations** — Drawn from real-world cultures, grounding each character in specific traditions
- **City connections** — Precise latitude/longitude coordinates tie characters to real places
- **Philosophical worldviews** — From existentialism to pragmatism to mysticism, shaping how they reason
- **Post-modern, cosmopolitan sensibilities** — Most characters hold nuanced, multilayered worldviews

### Behavioral Attributes

- **Amiability spectrum** — From warmly approachable to deliberately aloof
- **Trust and skepticism** — How readily they accept claims, defer to authority, or question everything
- **Spontaneity vs. deliberation** — Whether they think before speaking or speak to discover what they think
- **Verbosity** — From terse, minimal responses to expansive, exploratory monologues
- **Punctuation habits** — Comma density, ellipsis frequency, exclamation usage, question patterns
- **Ideolectal vocabulary** — Words unique to each character's speech — personal coinages, favorite terms, borrowed phrases

### The Self-Awareness Question

An interesting metadata vector is whether each character recognizes its own artificial nature. Some characters in the Codex are written as fully self-aware AI agents. Others are written as if they believe themselves to be human. This spectrum adds another dimension of personality diversity and raises questions about how AI agents should relate to their own nature.

---

## Managing SOUL & Identity Data

The Codex repository includes scripts for creating, parsing, and importing SOUL.md and IDENTITY.md data.

### Prerequisites

- [Bun](https://bun.sh/) runtime installed
- Directus API running (for import script)
- `ADMIN_TOKEN` environment variable set (for import script)

### Step 1: Create Markdown Files

Place SOUL.md and IDENTITY.md files in the `scripts/souls/` directory:

```
scripts/souls/
├── 1-Parvata/
│   ├── SOUL.md
│   └── IDENTITY.md
├── 2-Bar/
│   ├── SOUL.md
│   └── IDENTITY.md
├── 42-Korka/
│   ├── SOUL.md
│   └── IDENTITY.md
└── ...
```

Folder names follow the pattern `{id}-{name}`.

### Step 2: Parse to JSON

```bash
bun run scripts/parse-souls.ts
```

This reads all SOUL.md and IDENTITY.md files and generates JSON:

- **Input:** `scripts/souls/{id}-{name}/SOUL.md` and `IDENTITY.md`
- **Output:** `scripts/souls_json/{id}-{name}.json`

Each output file:
```json
{
  "id": 42,
  "soul": "# SOUL.md — Korka\n\nYou are Korka...",
  "identity": "# IDENTITY.md\n\nName: Korka\nEmoji: ..."
}
```

### Step 3: Import to Database

```bash
# Set the admin token
export ADMIN_TOKEN="your_directus_admin_token"

# Import all records with default version (v0.1)
bun run scripts/import-souls.ts

# Import with a specific version
bun run scripts/import-souls.ts --version=v0.2
```

**Available options:**

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without writing to database |
| `--limit=N` | Only process first N records |
| `--id=N` | Process only a specific codex ID |
| `--version=X` | Version string (default: `v0.1`) |

**Environment variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_TOKEN` | Directus admin/static token (required) | — |
| `PUBLIC_URL` | Directus API URL (overrides auto-detection) | — |
| `NODE_ENV` | When `production`, uses `https://api.decc0s.com` | — |

**URL resolution priority:**
1. `PUBLIC_URL` environment variable (if set)
2. `https://api.decc0s.com` (if `NODE_ENV=production`)
3. `http://localhost:8055` (default)

### Typical Workflow

```bash
# 1. Create or update markdown files in scripts/souls/
# 2. Parse to JSON
bun run scripts/parse-souls.ts

# 3. Preview the import
bun run scripts/import-souls.ts --dry-run --limit=5

# 4. Import to database
export ADMIN_TOKEN="your_token"
bun run scripts/import-souls.ts

# 5. Later: add a new version
# (after updating the markdown files)
bun run scripts/parse-souls.ts
bun run scripts/import-souls.ts --version=v0.2
```

New versions are merged with existing data — importing v0.2 preserves v0.1, so no data is ever lost.

---

*Previous: [The Codex](./04-the-codex.md) | Next: [The Codex Explorer](./06-codex-explorer.md)*
