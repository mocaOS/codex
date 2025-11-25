# The Codex

<div align="center">
  <img src="codex.jpg" alt="Art DeCC0s - Museum of Crypto Art" />
</div>

The Codex is your gateway to exploring the Art DeCC0 collection from the Museum of Crypto Art. This repository provides access to comprehensive data about all 10,000 DeCC0 NFTs, including rich character biographies, traits, locations, and more.

Documentation is available at [https://docs.decc0s.com](https://docs.decc0s.com). If you want to start building now, this repo gives you everything you need to get started.

# What can I do with it?

The Codex API gives you programmatic access to explore, query, and build with the Art DeCC0 collection. Each of the 10,000 characters is a richly detailed entity with biographical narratives, personality traits, artistic preferences, and visual assets.

## Explore Rich Character Data

Every DeCC0 character comes with extensive metadata that makes them truly unique:

- **Identity & Biography**: Each character has detailed biographical information, ancestral connections, and personal narratives that bring them to life
- **Personality & Psychology**: Discover personality traits, problem-solving approaches, moods, and philosophical affiliations that define how each character thinks and acts
- **Artistic Preferences**: Understand their relationship with art through their loved, liked, and disliked art styles, favorite crypto artists, and views on traditional art
- **Writing & Communication**: Each character has a unique voice defined by writing style characteristics, ideolectal words, and linguistic quirks
- **Cultural Context**: Explore cultural affiliations, significant locations, and the communities they belong to
- **Visual Assets**: Access character images, backgrounds, and composite artwork through IPFS hashes and on-demand transformations

## Powerful Querying & Filtering

The API is built on Directus, providing enterprise-grade querying capabilities:

- **Advanced Filtering**: Query characters by any combination of attributes using intuitive filter syntax
- **Full-Text Search**: Search across character data to find specific traits, narratives, or characteristics
- **Flexible Sorting**: Order results by any field to discover patterns and relationships
- **Field Selection**: Request only the data you need for optimal performance
- **Pagination**: Efficiently work with large result sets using limit and offset parameters

## Image Transformations

Access character and background artwork with on-the-fly transformations:

- **Responsive Images**: Generate thumbnails and optimized versions in multiple sizes (128px, 256px, 512px, 1024px presets)
- **Format Conversion**: Convert images to modern formats like WebP and AVIF for better performance
- **Custom Transformations**: Apply Sharp API transformations including rotation, blur, tinting, and more
- **Quality Control**: Adjust compression levels to balance quality and file size

## Build Anything

The comprehensive API enables endless possibilities:

- **Gallery Applications**: Create custom galleries and explorers for the DeCC0 collection
- **Character Discovery Tools**: Build recommendation engines based on personality, art preferences, or cultural connections
- **Narrative Experiences**: Leverage biographical data and writing styles to create interactive stories
- **Data Analysis**: Analyze patterns across the collection—artistic trends, cultural distributions, personality clusters
- **NFT Marketplaces**: Integrate rich character metadata into trading platforms
- **Social Experiences**: Connect collectors based on their characters' traits and affinities
- **AI Applications**: Use character data to train models or create AI-powered character interactions
- **Research Projects**: Study the intersection of art, identity, and digital collectibles

## Getting Started

All API endpoints are accessible at `https://api.decc0s.com`. The API follows RESTful conventions and returns JSON responses. No authentication is required for read operations.

**Example: Get a specific character**

```bash
curl https://api.decc0s.com/items/codex/1
```

**Example: Find characters by name**

```bash
curl "https://api.decc0s.com/items/codex?search=Korka"
```

**Example: Search for characters by trait**

```bash
curl "https://api.decc0s.com/items/codex?filter[cultural_affiliation][_contains]=Slovenian"
```

**Example: Get optimized character images**

```bash
curl "https://api.decc0s.com/assets/{file-id}?key=s512&format=webp"
```

For detailed API documentation including all available fields, filter operators, and query parameters, visit [docs.decc0s.com](https://docs.decc0s.com).

