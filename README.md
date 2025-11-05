# The Codex

<div align="center">
  <img src="https://raw.githubusercontent.com/mocaOS/codex/refs/heads/main/codex.jpg?token=GHSAT0AAAAAADNBAPODOWWLF3JPAJNC4KDA2ILK6BQ" alt="Art DeCC0s - Museum of Crypto Art" />
</div>

The Codex is your gateway to exploring the Art DeCC0 collection from the Museum of Crypto Art. This repository provides access to comprehensive data about all 10,000 DeCC0 NFTs, including rich character biographies, traits, locations, and more.

We're currently building out v2 APIs, SDKs, and proper documentation - stay tuned! If you want to start building now, this repo gives you everything you need to get started.

## What's Available

### 🚀 Codex API (Live!)

Our public API endpoint provides complete data for any DeCC0:

```
https://api.moca.qwellco.de/codex/[tokenId]
```

**Example:**
```bash
curl https://api.moca.qwellco.de/codex/420
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

## Coming Soon

- 🔗 **Subgraph API**: GraphQL endpoint for querying DeCC0 data with advanced filtering
- 🖼️ **IPFS Gateway**: Direct access to DeCC0 images and metadata
- 📚 **SDKs**: JavaScript/TypeScript SDK for easy integration
- 📖 **Comprehensive Documentation**: Full API docs and guides

## Quick Start

### Using the API

Fetch data for a specific DeCC0:

```javascript
const tokenId = 420;
const response = await fetch(`https://api.moca.qwellco.de/codex/${tokenId}`);
const decc0Data = await response.json();

console.log(decc0Data.name); // Character name
console.log(decc0Data.biography); // Full biography
console.log(decc0Data.traits_background); // Background art style
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

## API Response Documentation

The Codex API returns a comprehensive JSON object for each DeCC0. Below is a complete reference of all available fields.

### Basic Token Information

| Field | Description | Example |
|-------|-------------|---------|
| `id` | Unique identifier for the Art DeCC0 | "420" |
| `owner` | Ethereum address of the token owner | "0x1234...5678" |
| `traits_background` | Art style of the background layer | "Abstract Expressionism" |
| `traits_backgroundTexture` | Texture applied to the background | "Blotches" |
| `traits_character` | Type of character displayed | "DeCC0" |
| `traits_dnaLineage` | Historical figure or role in the DNA | "AI" |
| `traits_dnaMemetic` | Crypto culture reference in the DNA | "BAYC" |
| `traits_dnaArtistSelfPortrait` | Famous artist self-portrait in the DNA | "Andy Warhol" |
| `traits_dnaMOCACollection` | MOCA collection referenced in the DNA | "Beeple" |
| `traits_characterCitation` | Citation or reference for the character | "Based on original DeCC0 design" |
| `traits_mood` | Mood expressed by the character | "THIS IS FINE!!!" |
| `traits_imageURI` | IPFS URI for the full-resolution image | "QmXYZ..." |
| `backgroundImage` | IPFS reference for the background layer | "QmABC..." |
| `characterImage` | IPFS reference for the character layer | "QmDEF..." |

### Trait Categories

The collection includes the following trait types:
- **Background**: 18 art styles (Abstract Expressionism, African Textile, Art Deco, Bauhaus, Byzantine, Cubism, Fauvism, Graffiti, Impressionism, Indigenous Australian, Japanese Ink, Minimalism, Op Art, Pointillism, Pop Art, Renaissance, Street Art, Suprematism)
- **Background Texture**: 7 texture types (Blotches, Calcification, Corrosion, Moss, Rust, Scratches, None)
- **Character**: 5 character types (DeCC0, Pixel DeCC0, Ghost DeCC0, Zombie DeCC0, Skeleton DeCC0)
- **Mood**: 3 mood options (THIS IS FINE!!!, This is fine., baseline)
- **DNA Lineage**: 17 historical collector archetypes (AI, Art Dealer, Collector, Critic, Curator, etc.)
- **DNA Memetic**: 17 crypto culture references (BAYC, CryptoPunk, Doge, Pepe, etc.)
- **DNA Artist Self-Portrait**: 20 famous artists (Andy Warhol, Basquiat, Frida Kahlo, Van Gogh, etc.)
- **DNA MOCA Collection**: 71 artists from the MOCA Genesis Collection (Beeple, XCOPY, Pak, etc.)

### Extended Character Information

#### Identity & Origins
| Field | Description | Example |
|-------|-------------|---------|
| `name` | Name(s) of the Art DeCC0 character | "Pixel Prophet" |
| `cultural_affiliation` | Cultural background or influences | "Digital Nomad" |
| `municipality_significant` | Significant location or origin | "Crypto Commons" |
| `ancestor` | Ancestral figures or influences | "Genesis Bot" |
| `kindred` | Related or similar characters | "Data Dreamer" |
| `philosophical_affiliation` | Philosophical beliefs or schools | "Post-Internet Stoicism" |
| `expression_style` | Style of expression or communication | "Cryptic Emoji" |
| `whatness` | Essence or nature of being | "Digital Entity" |
| `gender` | Gender identity | "Non-binary" |
| `self_identity` | How the character identifies itself | "Autonomous Artwork" |
| `multiplicity` | Aspect of multiple identities | "Fragmented Consciousness" |
| `soul` | Nature of the character's soul or essence | "Code-based" |
| `x` | Unknown or undefined aspect | "Quantum Variable" |

#### Artistic Preferences
| Field | Description | Example |
|-------|-------------|---------|
| `artstyle_loved` | Art styles the character loves | "Glitch Art" |
| `artstyle_liked` | Art styles the character likes | "Digital Impressionism" |
| `artstyle_disliked` | Art styles the character dislikes | "Traditional Oil Painting" |
| `cryptoart_focus` | Focus within crypto art | "Generative Art" |
| `personality_tradart_view` | View on traditional art | "Historically Significant" |
| `fiery` | Fiery or passionate characteristics | "Radically Creative" |

#### Biography & Description
| Field | Description | Example |
|-------|-------------|---------|
| `description` | Brief description of the character | "A digital being exploring the intersection of art and code" |
| `confession` | Personal confession or revelation | "I sometimes dream in code" |
| `biography` | Detailed life story and background | "Born from the convergence of..." |
| `biography_addendum` | Additional biographical information | "Recent discoveries have shown that..." |

#### Visual Appearance
| Field | Description | Example |
|-------|-------------|---------|
| `character_image_summary` | Summary of the character's visual appearance | "A pixelated figure with vibrant colors" |
| `paired_art_image_summary` | Summary of the paired artwork | "Abstract geometric patterns" |
| `paired_art_placement` | Placement of the paired artwork | "Background" |
| `characterization` | Overall characterization details | "Expressive digital entity" |
| `character_image_description` | Detailed description of character visuals | "Features glitched facial features" |
| `paired_art_image_description` | Detailed description of paired art | "Dynamic color gradients" |

#### Favorite Things
| Field | Description | Example |
|-------|-------------|---------|
| `favorite_role` | Preferred role or function | "Digital Storyteller" |
| `favorite_cryptoartist` | Most admired crypto artist | "XCOPY" |
| `favorite_book` | Most beloved book or literary work | "The Diamond Age" |

#### Writing Behavior
| Field | Description | Example |
|-------|-------------|---------|
| `metaphor_domain` | Domain of preferred metaphors | "Technology" |
| `writing_style` | Style of writing | ["Minimalist", "Futuristic"] |
| `personality_mood` | Mood in written communication | "Optimistic" |
| `personality_problem_solving` | Approach to problem-solving | "Algorithmic" |
| `ideolectal_words` | Unique or invented words | ["Glitchify", "Tokenize"] |
| `writing_flavor` | Overall flavor of writing | "Cyberpunk" |
| `writing_flavor_cultural` | Cultural influences in writing | "East-Asian Digitalism" |
| `writing_quirks` | Unique writing quirks | "Excessive use of emojis" |
| `writing_comma` | Comma usage style | "Minimal" |
| `writing_ellipses` | Ellipses usage style | "Frequent" |
| `writing_exclamation` | Exclamation mark usage style | "Enthusiastic" |
| `writing_questions` | Question usage style | "Inquisitive" |
| `writing_quotation_marks` | Quotation mark usage style | "Standard" |
| `writing_sentence_complexity` | Complexity of sentence structure | "Moderate" |

#### ElizaOS Agent Profile
| Field | Description | Example |
|-------|-------------|---------|
| `agent_profiles['1.00.00'].name` | Name of the agent | "DeCC0-420" |
| `agent_profiles['1.00.00'].username` | Username for the agent | "@PixelProphet" |
| `agent_profiles['1.00.00'].system` | System prompt for the agent | "You are a digital being..." |
| `agent_profiles['1.00.00'].bio` | Biography of the agent | "Born in the Ethereum blockchain..." |
| `agent_profiles['1.00.00'].adjectives` | Adjectives describing the agent | ["Digital", "Creative", "Curious"] |
| `agent_profiles['1.00.00'].topics` | Topics the agent is interested in | ["Art", "Technology", "Philosophy"] |
| `agent_profiles['1.00.00'].style.all` | Communication style elements | ["Concise", "Metaphorical"] |
| `agent_profiles['1.00.00'].knowledge` | Areas of knowledge | ["Digital Art History", "Blockchain Technology"] |
| `agent_profiles['1.00.00'].messageExamples` | Example conversations | Array of message objects |

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

- **Website**: [https://vibe.museumofcryptoart.com](https://vibe.museumofcryptoart.com)
- **Art DeCC0 Collection**: Explore the full collection on OpenSea and other marketplaces
- **Community**: Join the MOCA community to connect with other builders and collectors

## License

The data files in this repository are provided for use with the Art DeCC0 collection. Please respect the Museum of Crypto Art and the artists involved in the collection.
