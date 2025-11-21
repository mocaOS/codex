# The Codex

<div align="center">
  <img src="codex.jpg" alt="Art DeCC0s - Museum of Crypto Art" />
</div>

The Codex is your gateway to exploring the Art DeCC0 collection from the Museum of Crypto Art. This repository provides access to comprehensive data about all 10,000 DeCC0 NFTs, including rich character biographies, traits, locations, and more.

Documentation is available at [https://docs.decc0s.com](https://docs.decc0s.com). If you want to start building now, this repo gives you everything you need to get started.

## What's Available

### 🚀 Codex API (Live!)

Our public API endpoint provides complete data for any DeCC0:

```
https://api.decc0s.com/items/codex/[tokenId]
```

**Example:**
```bash
curl https://api.decc0s.com/items/codex/420
```

This endpoint returns comprehensive data including:
- Character biographies and personalities
- Writing styles and linguistic patterns
- Cultural affiliations and DNA composition
- Trait information (background, character, mood, DNA)
- Favorite books and cryptoartists
- Adjectives and personality traits
- Artistic preferences and thematic elements
- ElizaOS agent profiles
- IPFS hashes for images

### 📦 Data Files

This repository includes two JSON data files in the `/data` folder to help you start building:

#### 1. `data/decc0s.json`
A complete index of all 10,000 DeCC0s with their IDs and names.

```json
[
  { "id": 1, "name": "Parvata" },
  { "id": 2, "name": "Bar" },
  { "id": 3, "name": "Wachi-Ruq" }
  // ... 9,997 more
]
```

#### 2. `data/locations.json`
Geographic data for DeCC0s, including:
- Coordinates (latitude/longitude)
- Municipality information
- DeCC0s residing at each location
- DeCC0s with significant connections to each location
- Counts of residence vs. significant locations

```json
{
  "locations": [
    {
      "lat": -16.287248,
      "lon": 149.963346,
      "municipality": "Coral Sea Islands, Australia",
      "residence_count": 3,
      "significant_count": 5,
      "total_count": 8,
      "residence_decc0s": [{ "id": 260, "name": "Ulwandle" }],
      "significant_decc0s": [{ "id": 2875, "name": "Oblak" }]
    }
  ]
}
```

## Development

This repository is a monorepo managed with [Turbo](https://turbo.build/) and uses [Bun](https://bun.sh/) as the package manager.

### Prerequisites

- Node.js >= 22
- Bun >= 1.2.0

### Project Structure

```
.
├── apps/
│   ├── api/          # Directus CMS backend with Codex extension
│   └── docs/         # API documentation site (Vue + Scalar)
├── packages/         # Shared packages and configurations
├── data/             # JSON data files (decc0s.json, locations.json)
└── misc/             # Miscellaneous assets
```

### Getting Started

Install dependencies:
```bash
bun install
```

Run all apps in development mode:
```bash
bun dev
```

Run specific apps:
```bash
# API only
bun dev:api

# Docs only
bun dev:docs
```

Build all packages:
```bash
bun build
```

### Apps

#### `apps/api`
Directus CMS instance with a custom Codex extension that provides the API endpoints and data management.

#### `apps/docs`
Interactive API documentation site built with Vue and Scalar API Reference.

## Coming Soon

- 🔗 **Subgraph API**: GraphQL endpoint for querying DeCC0 data with advanced filtering
- 🖼️ **IPFS Gateway**: Direct access to DeCC0 images and metadata
- 📚 **SDKs**: JavaScript/TypeScript SDK for easy integration

## Quick Start

### Using the API

Fetch data for a specific DeCC0:

```javascript
const tokenId = 420;
const response = await fetch(`https://api.decc0s.com/items/codex/${tokenId}`);
const json = await response.json();
const decc0Data = json.data;

console.log(decc0Data.name); // Character name
console.log(decc0Data.biography); // Full biography
console.log(decc0Data.background_category); // Background art style
```

### Using the Data Files

Load the complete DeCC0 index:

```javascript
import decc0s from './data/decc0s.json';

// Get a random DeCC0
const randomDecc0 = decc0s[Math.floor(Math.random() * decc0s.length)];
console.log(`Token #${randomDecc0.id}: ${randomDecc0.name}`);
```

Load location data:

```javascript
import { locations } from './data/locations.json';

// Find locations with the most DeCC0s
const topLocations = locations
  .sort((a, b) => b.total_count - a.total_count)
  .slice(0, 10);
```

## API Response Structure

The Codex API returns a comprehensive JSON object for each DeCC0 wrapped in a `data` property.

For a complete reference of all available fields, please visit the [Official Documentation](https://docs.decc0s.com).

### Response Example

```json
{
  "data": {
    "id": 420,
    "name": "Pixel Prophet",
    "description": "A digital being exploring the intersection of art and code",
    "background_category": "Abstract Expressionism",
    "agent_profiles": {
        "1.00.00": {
            "name": "DeCC0-420",
            "bio": "Born in the Ethereum blockchain...",
            "topics": ["Art", "Technology"],
            "knowledge": ["..."]
        }
    },
    "biography": "...",
    "timestamp_created": "2025-10-11T20:59:41.000Z"
  }
}
```

## Use Cases

The Codex API and data files enable a wide range of applications:

- **NFT Galleries**: Build custom viewers for the DeCC0 collection
- **Data Visualizations**: Map DeCC0 locations, analyze trait distributions, or explore DNA connections
- **AI Agent Integration**: Use the ElizaOS agent profiles to create AI characters based on DeCC0s
- **Analytics Dashboards**: Track collection statistics and trends
- **Community Tools**: Build rarity calculators, portfolio trackers, or collection explorers
- **Creative Projects**: Generate stories, art, or experiences based on DeCC0 character data

## Contributing

We welcome contributions! If you build something cool with the Codex API, let us know. We'll get your app featured in the vibe studio when you're ready!

## Resources

- **Documentation**: [https://docs.decc0s.com](https://docs.decc0s.com)
- **Website**: [https://vibe.museumofcryptoart.com](https://vibe.museumofcryptoart.com)
- **Art DeCC0 Collection**: Explore the full collection on OpenSea and other marketplaces
- **Community**: Join the MOCA community to connect with other builders and collectors

## License

The data files in this repository are provided for use with the Art DeCC0 collection. Please respect the Museum of Crypto Art and the artists involved in the collection.
