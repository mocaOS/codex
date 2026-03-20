# 11. Appendix

> Glossary, links & resources, and honorary DeCC0s.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Art Decc0** | One of 10,000 unique digital characters created by MOCA, combining AI-generated silhouettes with crypto art backgrounds. The name fuses "Art Deco" with "CC0." |
| **CC0** | Creative Commons Zero — a public domain dedication that irrevocably waives all copyright and related rights. All Art Decc0s artwork is CC0. |
| **Codex** | The 105-million-word knowledge base containing all Art Decc0 data — biographies, personalities, traits, visual descriptions, and agent configuration. Accessible via the Codex API. |
| **Codex Explorer** | The Nuxt 3 web application for visually browsing, filtering, and discovering Art Decc0s. Uses a zero-refetch architecture to load all 10,000 items client-side. |
| **Comput3AI** | The inference service provider used to generate the Codex text data — 260,000+ API calls over ~2.5 days. |
| **ComfyUI** | A node-based visual interface for Stable Diffusion, used as the primary generation environment for Art Decc0s character and background images. |
| **DaïmAlYad** | Lead technical architect for the Art Decc0s Codex. Designed the text generation pipeline, wrote the Go programs, and built the quality assurance system. Also the curator of MOCA's DaïmAlYad Collection. |
| **Directus** | An open-source headless CMS that powers the Codex API. Provides REST endpoints, filtering, pagination, file management, and image transformations. |
| **DNA** | The four-input trait system that determines each Art Decc0's visual appearance: DNA1 (Lineage), DNA2 (Memetics), DNA3 (Artist), DNA4 (MOCA Collection). Unlike traditional traits, DNA influences appearance in unpredictable, emergent ways. |
| **ElizaOS** | An open-source AI agent framework. Art Decc0s includes pre-built ElizaOS agent profiles in the `agent_profiles` field, and the DeCC0 Agent Launcher is powered by ElizaOS. |
| **ENS** | Ethereum Name Service — a decentralized naming system that maps human-readable names (e.g., `vitalik.eth`) to Ethereum addresses. The Codex Explorer resolves ENS names for owners. |
| **Hermes Agent** | An AI agent framework compatible with SOUL.md personality files. |
| **IDENTITY.md** | A structured markdown file containing a character's factual metadata — name, emoji, residence, coordinates, self-identity, and characterization. Complements SOUL.md. |
| **IPFS** | InterPlanetary File System — a decentralized, content-addressed storage network used to store Art Decc0 images (character, background, and composite). |
| **Maxwell Cohen** | Lead writer for the Art Decc0s project. Drove the artistic vision, conceptual framework, and narrative design over nine months of development. |
| **MOCA** | The Museum of Crypto Art — a cultural institution dedicated to preserving, exhibiting, and advancing the crypto art movement. Creator of Art Decc0s. |
| **Moltbot** | The versioned JSON field in the Codex that stores SOUL.md and IDENTITY.md data. Supports multiple versions (e.g., v0.1, v0.2) for character evolution without data loss. |
| **OpenClaw** | An AI agent framework compatible with SOUL.md personality files. |
| **Pagefind** | A static site search library used by the Codex documentation site (docs.decc0s.com) for fast, client-side search. |
| **PFP** | Profile Picture — the NFT category Art Decc0s belongs to. MOCA's approach reimagines the PFP format as a vehicle for genuine artistic expression and AI agent identity. |
| **Sharp** | A high-performance Node.js image processing library used by Directus for on-the-fly image transformations (resize, format conversion, effects). |
| **SOUL.md** | A structured markdown file defining a complete AI agent personality — core temperament, voice rules, style exemplars, and behavioral guidelines. Can be integrated into any agent framework. |
| **Stable Diffusion** | The AI image generation model used to create Art Decc0s characters and backgrounds, operated through ComfyUI interfaces. |
| **The Graph** | A decentralized indexing protocol. The Codex uses a Graph subgraph to track Art Decc0 ownership on the Ethereum blockchain, updating owner data hourly. |
| **Turborepo** | A monorepo build orchestration tool by Vercel. The Codex uses Turborepo to manage builds across the API, documentation, and shared packages. |
| **Vibe Studio** | MOCA's unified digital hub, launched November 5, 2025. Houses the Codex, Explorer, Adoption Center, Agent Launcher, World Map, and Community Studio. |
| **Zudoku** | A modern documentation framework powered by React and MDX. Used to build the Codex documentation site at docs.decc0s.com. |

---

## Links & Resources

### Official

| Resource | URL |
|----------|-----|
| MOCA on X/Twitter | [x.com/MuseumofCrypto](https://x.com/MuseumofCrypto) |
| MOCA Substack | [museumofcrypto.substack.com](https://museumofcrypto.substack.com) |
| Codex API Base URL | `https://api.decc0s.com` |
| Codex API Documentation | [docs.decc0s.com](https://docs.decc0s.com) |

### LLM Context Endpoints

| Resource | URL | Format |
|----------|-----|--------|
| LLMs.txt (lightweight) | [docs.decc0s.com/llms.txt](https://docs.decc0s.com/llms.txt) | Plain text |
| LLMs.txt Full (complete) | [docs.decc0s.com/llms-full.txt](https://docs.decc0s.com/llms-full.txt) | Plain text |
| OpenAPI Spec (raw) | [api.decc0s.com/api-docs/oas](https://api.decc0s.com/api-docs/oas) | JSON |
| OpenAPI Spec (local) | `llm.json` in repo root | JSON |

### Repositories

| Repository | URL | Description |
|------------|-----|-------------|
| Codex (API & Infrastructure) | [github.com/mocaOS/codex](https://github.com/mocaOS/codex) | Directus backend, extensions, documentation, scripts, data |
| Codex Explorer (Frontend) | [github.com/mocaOS/codex-explorer](https://github.com/mocaOS/codex-explorer) | Nuxt 3 gallery and character browser |

### Blog Posts

| Title | URL | Topics |
|-------|-----|--------|
| Art Decc0s: The Process | [museumofcrypto.substack.com/p/art-decc0s-the-process](https://museumofcrypto.substack.com/p/art-decc0s-the-process) | Creative process, DNA system, ComfyUI workflow, iterative refinement |
| An Art Decc0s Meditation on Mints | [museumofcrypto.substack.com/p/an-art-decc0s-meditation-on-mints](https://museumofcrypto.substack.com/p/an-art-decc0s-meditation-on-mints) | Launch details, development journey, AI integration, community ethos |
| Art Decc0s: Why the Hell Would MOCA... | [museumofcrypto.substack.com/p/art-decc0s-why-the-hell-would-moca](https://museumofcrypto.substack.com/p/art-decc0s-why-the-hell-would-moca) | Five central questions, conceptual framework, identity, organic value |
| The 100-Million-Word Birth of Art Decc0s | [museumofcrypto.substack.com/p/the-100-million-word-birth-of-art](https://museumofcrypto.substack.com/p/the-100-million-word-birth-of-art) | Codex generation process, personality architecture, sanity review, scale |
| The Vibe Studio Arrives at Last | [museumofcrypto.substack.com/p/the-vibe-studio-arrives-at-last](https://museumofcrypto.substack.com/p/the-vibe-studio-arrives-at-last) | Vibe Studio launch, Adoption Center, Agent Launcher, Community Studio |

### External Documentation

| Resource | URL |
|----------|-----|
| Directus Documentation | [docs.directus.io](https://docs.directus.io/) |
| Directus Query Reference | [docs.directus.io/reference/query.html](https://docs.directus.io/reference/query.html) |
| Sharp Documentation | [sharp.pixelplumbing.com](https://sharp.pixelplumbing.com/) |
| ElizaOS | [elizaos.ai](https://elizaos.ai/) |
| The Graph | [thegraph.com](https://thegraph.com/) |
| IPFS | [ipfs.tech](https://ipfs.tech/) |
| Nuxt 3 | [nuxt.com](https://nuxt.com/) |
| Zudoku | [zudoku.dev](https://zudoku.dev/) |

---

## Honorary DeCC0s

54 Honorary Art Decc0s have been created to recognize influential figures within the crypto art community. These are not commercial pieces but tributes to individuals who have shaped the movement through their art, collecting, community building, or cultural contribution.

Approximately **100 additional** honorary pieces are planned, extending this recognition to a broader set of contributors across the crypto art ecosystem.

Honorary DeCC0s carry the same depth of personality and biographical data as the standard collection — each has a full Codex entry with SOUL.md, IDENTITY.md, and all associated metadata.

---

## Quick Reference: Common API Patterns

### Get a Character

```bash
curl https://api.decc0s.com/items/codex/{id}
```

### Search Characters

```bash
curl "https://api.decc0s.com/items/codex?search={query}&fields=id,name,description"
```

### Filter Characters

```bash
curl "https://api.decc0s.com/items/codex?filter[{field}][{operator}]={value}&fields=id,name"
```

### Get SOUL.md Data

```bash
curl "https://api.decc0s.com/items/codex/{id}?fields=id,name,moltbot"
```

### Get Optimized Image

```bash
curl "https://api.decc0s.com/assets/{file-id}?key=s512&format=webp"
```

### Paginate Results

```bash
curl "https://api.decc0s.com/items/codex?limit={n}&offset={n}&meta=*"
```

---

*Previous: [The Documentation Site](./10-documentation-site.md) | Back to [Handbook Index](./README.md)*
