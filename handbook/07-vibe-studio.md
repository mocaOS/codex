# 7. The Vibe Studio

> MOCA's unified digital hub — Adoption Center, Agent Launcher, World Map, Community Studio, and supporting integrations.

---

## Overview

The Vibe Studio is MOCA's complete digital presence — "the nexus for everything MOCA has created, is creating, and will create in the future." Rather than a standalone application or single product, it serves as a unified hub where all Art Decc0s projects, community contributions, and partner integrations converge.

**Launched:** November 5, 2025

MOCA describes the Vibe Studio as their "city center" — a navigable, welcoming space designed to be collaborative. The team explicitly invites the community to treat it as home: "We want visitors to feel the Vibe Studio is your home too."

The Vibe Studio encompasses the Codex, the Codex Explorer, and several additional applications that extend the Art Decc0s ecosystem:

---

## The Codex

The foundational element of the Vibe Studio is the Codex itself — the 100-million-word compendium that serves as the backbone for MOCA's agentic AI operating system. Within the Vibe Studio context, the Codex functions as:

- The **data layer** powering all other applications
- The **canonical source** for character information
- The **API backend** at `https://api.decc0s.com` that all frontend applications consume
- The **documentation platform** at [docs.decc0s.com](https://docs.decc0s.com) that developers use to build integrations

Every other component of the Vibe Studio draws its data from the Codex.

For complete details, see [Chapter 4: The Codex](./04-the-codex.md).

---

## The Adoption Center

The Adoption Center is an experimental conversational interface modeled after an animal rescue center. It represents one of the most innovative uses of the SOUL.md personality system.

### How It Works

1. **Rotating characters** — The Adoption Center presents a series of Art Decc0s, initially focusing on those available at floor price
2. **Free conversation** — Visitors can chat freely with each character, experiencing their personality firsthand through natural dialogue
3. **Discovery through interaction** — Rather than browsing metadata or viewing static images, collectors discover which character resonates with them through actual conversation
4. **Personality beyond aesthetics** — The Adoption Center lets collectors understand a DeCC0's personality before purchasing, adding a dimension of connection that goes beyond visual appeal

### Design Philosophy

The animal rescue center metaphor is deliberate — it frames the relationship between collector and character as one of adoption and stewardship rather than purchase and ownership. This aligns with MOCA's broader vision of Art Decc0s as beings to be cared for, not just assets to be traded.

### Technical Foundation

The Adoption Center is powered by:
- **SOUL.md personality files** from the Codex providing character voice and behavior
- **IDENTITY.md metadata** grounding each character in their specific identity
- **Real-time conversational AI** that maintains consistent character personality across interactions

---

## The DeCC0 Agent Launcher

The Agent Launcher is the tool that transforms Art Decc0s from conversational characters into **functional AI entities capable of independent action**.

### Powered by ElizaOS

The Agent Launcher is built on **ElizaOS**, an open-source AI agent framework. It provides a user-friendly interface for DeCC0 owners to configure and launch their characters as autonomous agents.

### Capabilities

DeCC0 owners can:

| Capability | Description |
|------------|-------------|
| **Fine-tune with knowledge** | Add custom knowledge bases — articles, documents, links — that the agent can reference |
| **Teach speaking styles** | Refine how the agent communicates beyond the base SOUL.md personality |
| **Assign expertise** | Specify domains where the agent should be particularly knowledgeable |
| **Assign tasks** | Give the agent actionable goals: discovering art, curating exhibitions, identifying underappreciated work |
| **Expand capabilities** | Progressively add new skills and integrations as the agent framework evolves |

### From Static to Active

The Agent Launcher represents the critical transition in Art Decc0s' vision — from static profile pictures to "actors capable of action." A launched agent can:

- **Discover** new art and artists within the crypto art ecosystem
- **Curate** collections and exhibitions aligned with its personality and preferences
- **Identify** underappreciated work that matches its aesthetic sensibilities
- **Interact** with other agents and human users in character-consistent ways
- **Learn** from interactions and owner guidance over time

### Owner Control

Importantly, the Agent Launcher keeps owners in control. The base personality (SOUL.md) provides the foundation, but owners can layer additional knowledge, refine behavior, and direct the agent's activities. This creates a collaborative relationship between the human owner and their AI character.

---

## The DeCC0s World Map

An interactive globe that visualizes the geographic dimension of the Art Decc0s collection.

### Features

- **10,000 locations** — Every Art Decc0 has both a hometown and a current residence, each with precise latitude/longitude coordinates
- **Interactive globe** — Rotate, zoom, and explore the geographic distribution of characters
- **Contextual links** — Each point on the map links to the character's Codex page for full profile access
- **Geographic discovery** — Find characters by location rather than by ID, name, or trait
- **Thematic exploration** — Discover clusters of characters in specific regions or cultural zones

### Geographic Data

The location data in the Codex includes:

| Field | Description |
|-------|-------------|
| `municipality_residence` | Where the character lives |
| `municipality_significant` | A place significant to their story |
| `latlon_residence` | Precise coordinates of residence |
| `latlon_significant` | Precise coordinates of significant place |
| `cultural_affiliation` | Cultural background shaping their worldview |

The World Map makes this geographic data visual and explorable, revealing patterns in how characters are distributed across the globe.

---

## Community Studio

MOCA intentionally limits their in-house development focus, recognizing that they cannot outpace the creativity and innovation of their community. The Community Studio is the result of this philosophy.

### Design Philosophy

The Community Studio is a section of the Vibe Studio that **aggregates applications built by artists, developers, and partners**. The key principles:

- **Community creators retain all proceeds** from their applications
- **MOCA provides platform visibility** — community tools appear alongside official MOCA applications
- **Low barrier to entry** — MOCA actively solicits contributions and offers development support
- **Any type of application** — Art-focused, DeCC0-related, metaverse-aligned, experimental, or anything else

### First Integration: DeCC0 Printer

The first community integration is **MOCA x Artscape's DeCC0 Printer**:

- **High-quality physical prints** of Art Decc0s
- **Worldwide shipping** for global accessibility
- **Multiple format options** for different display needs
- **Direct from the Vibe Studio** — seamless discovery-to-order experience

### Contributing

MOCA welcomes external contributions through:
- Discord community channels
- Twitter/X DMs to [@MuseumofCrypto](https://x.com/MuseumofCrypto)
- Substack comments and direct outreach

The organization emphasizes that they want to hear from builders at any stage — from rough ideas to finished applications.

---

## Supporting Integrations

The Vibe Studio also provides access to MOCA's broader digital ecosystem:

### Museum Collections & Library

The original Museum of Crypto Art collections are accessible through the Vibe Studio, alongside an **AI-powered Library** that enables intelligent exploration of the museum's holdings.

### DeCC0 Plaza

A **metaverse exhibition space** built within **Hyperfy** (a web-based metaverse platform). The Plaza features:
- AI-generated architecture creating a unique virtual environment
- Exhibition spaces for displaying Art Decc0s in a 3D context
- Social gathering spaces for the community

### ROOMs Archive

A **permanent record of past exhibitions**, preserved using **Filecoin** (a decentralized storage network). This ensures that MOCA's exhibition history is preserved immutably, even if specific platforms or services change over ownership.

### Weekly Substack

MOCA publishes a **weekly Substack newsletter** covering:
- Crypto art developments and commentary
- Art Decc0s project updates
- Community highlights
- Cultural analysis and essays

Available at [museumofcrypto.substack.com](https://museumofcrypto.substack.com).

---

## The Vibe Studio as Platform

The Vibe Studio represents a deliberate strategic choice: rather than building a single monolithic application, MOCA has created a **platform** that:

1. **Centralizes access** — One place to find everything MOCA offers
2. **Decentralizes creation** — Community members build alongside the core team
3. **Lowers barriers** — Visitors discover community tools they might never have found otherwise
4. **Shares value** — Community creators benefit from MOCA's traffic and visibility
5. **Evolves organically** — New applications can be added without restructuring existing ones

This platform approach mirrors the CC0 and open-source philosophy of the entire Art Decc0s project — building infrastructure that others can build upon.

---

*Previous: [The Codex Explorer](./06-codex-explorer.md) | Next: [Technical Architecture](./08-technical-architecture.md)*
