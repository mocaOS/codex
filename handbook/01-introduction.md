# 1. Introduction

> What Art Decc0s and the Codex are, why they exist, and how this handbook is organized.

---

## What Is This Project?

Art Decc0s is a collection of 10,000 unique digital identities created by the Museum of Crypto Art (MOCA). Each Art Decc0 is far more than a profile picture — it is a richly characterized being with a biography, personality, artistic preferences, writing style, cultural affiliations, and a complete AI-ready personality definition contained in SOUL.md and IDENTITY.md files.

The **Codex** is the 105-million-word knowledge base that houses all of this data. Built on Directus (an open-source headless CMS), the Codex is accessible through a public RESTful API at `https://api.decc0s.com`, explorable through the **Codex Explorer** web application, and designed from the ground up to be integrated into modern AI agent frameworks.

## Why Does It Matter?

Art Decc0s sits at the intersection of three movements:

### Digital Art & Identity
Each Art Decc0 is a composite artwork — an AI-generated character silhouette layered over a background drawn from sixteen art historical traditions. The collection interrogates what digital identity means, how a single image can represent multifaceted personhood, and how art can encode cultural memory.

### AI Agents & Personality
Every Art Decc0 comes with a SOUL.md file — a structured markdown document that defines a complete AI agent personality. These 10,000 unique identities can be dropped into any modern agent framework (ElizaOS, Hermes Agent, OpenClaw, and others) to instantly create an AI agent with a distinct voice, worldview, and behavioral profile. This transforms static NFTs into functional digital beings.

### Open Source & CC0
Everything is open. All artwork is licensed CC0 (Creative Commons Zero) — a complete waiver of copyright. All code is open source. The entire infrastructure — from the API backend to the Explorer frontend to the data pipelines — can be forked, remixed, and adapted to create a Codex for any other NFT collection. MOCA has built not just a product but a template.

## The Ecosystem at a Glance

The Art Decc0s ecosystem consists of several interconnected components:

```
                    ┌─────────────────────────────┐
                    │     Art Decc0s Collection     │
                    │   10,000 Unique Characters    │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │         The Codex            │
                    │  105M Words · RESTful API    │
                    │  api.decc0s.com              │
                    └──┬─────────┬─────────┬──────┘
                       │         │         │
            ┌──────────▼──┐  ┌──▼──────┐  ┌▼──────────────┐
            │   Codex     │  │  SOUL   │  │ Documentation  │
            │  Explorer   │  │  .md    │  │    Site        │
            │  (Gallery)  │  │ Files   │  │ docs.decc0s.com│
            └─────────────┘  └────┬────┘  └───────────────┘
                                  │
                    ┌─────────────▼───────────────┐
                    │     Agent Frameworks         │
                    │  ElizaOS · Hermes · OpenClaw │
                    └─────────────────────────────┘
```

| Component | What It Does |
|-----------|-------------|
| **Art Decc0s** | 10,000 composite artworks combining character silhouettes with art historical backgrounds |
| **The Codex** | 105-million-word knowledge base and RESTful API housing all character data |
| **SOUL.md / IDENTITY.md** | Structured personality and identity files for AI agent integration |
| **Codex Explorer** | High-performance web gallery for browsing, filtering, and discovering characters |
| **Vibe Studio** | MOCA's unified digital hub encompassing the Codex, Explorer, Adoption Center, Agent Launcher, and community tools |
| **Documentation Site** | Interactive API documentation at docs.decc0s.com with playground and LLM context endpoints |

## Key Numbers

| Metric | Value |
|--------|-------|
| Total characters | 10,000 |
| Words in the Codex | 105,561,738 |
| Average words per character | ~10,000 |
| Character iterations generated | 300,000+ |
| Background variations produced | 60,000+ |
| API calls for text generation | 260,000+ |
| Structured data volume | 800+ MB |
| AI inference calls per character | 20+ |
| Input data types per character | 24+ |
| Development time | 9 months |

The text Codex alone exceeds the original print Encyclopedia Britannica by 2.5 times.

## Who Is This Handbook For?

- **Developers** building AI agents, galleries, analytics tools, or integrations with the Codex API
- **Artists and creators** interested in the Art Decc0s creative process and CC0 artwork
- **NFT collectors** seeking to understand the depth of their Art Decc0 characters
- **Researchers** studying digital identity, generative art, or AI personality systems
- **Other projects** looking to fork and remix the Codex infrastructure for their own collections

## How This Handbook Is Organized

Each chapter is a self-contained document covering one major aspect of the project:

1. **Introduction** (this document) — Overview and orientation
2. **The Museum of Crypto Art** — MOCA's mission and collections
3. **Art Decc0s: The Collection** — The art, the process, the philosophy
4. **The Codex** — The data, the API, the querying capabilities
5. **SOUL.md & The Moltbot Agent System** — AI agent personality integration
6. **The Codex Explorer** — The web application for browsing characters
7. **The Vibe Studio** — MOCA's digital hub and community platform
8. **Technical Architecture** — Infrastructure, codebase, deployment
9. **Building with the Codex** — Developer guide with examples
10. **The Documentation Site** — docs.decc0s.com and LLM integration
11. **Appendix** — Glossary, links, resources

---

*Next: [The Museum of Crypto Art](./02-museum-of-crypto-art.md)*
