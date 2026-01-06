import type { ZudokuConfig } from "zudoku";
import uncheckQueryParamsPlugin from "./plugins/uncheck-query-params";
import fixPagefindUrlsPlugin from "./plugins/fix-pagefind-urls";

const config: ZudokuConfig = {
  docs: {
    files: "pages/**/*.{md,mdx}",
    publishMarkdown: true,
    llms: {
      llmsTxt: true,
      llmsTxtFull: true,
      includeProtected: false,
    },
  },
  search: {
    type: "pagefind",
    maxSubResults: 3,
    ranking: {
      termFrequency: 0.8,
      pageLength: 0.6,
      termSimilarity: 1.2,
      termSaturation: 1.2,
    },
    transformResults: ({ result }) => {
      // Remove .html extension from URLs to match clean URL structure
      if (!result) return result;
      
      const modifiedResult = { ...result };
      
      // Fix main result URL
      if (modifiedResult.url && typeof modifiedResult.url === 'string' && modifiedResult.url.includes(".html")) {
        modifiedResult.url = modifiedResult.url.replace(/\.html(?=[#?]|$)/, "");
      }
      
      // Fix sub-results URLs if they exist
      if (modifiedResult.sub_results && Array.isArray(modifiedResult.sub_results)) {
        modifiedResult.sub_results = modifiedResult.sub_results.map((subResult) => {
          if (subResult && subResult.url && typeof subResult.url === 'string' && subResult.url.includes(".html")) {
            return {
              ...subResult,
              url: subResult.url.replace(/\.html(?=[#?]|$)/, ""),
            };
          }
          return subResult;
        });
      }
      
      return modifiedResult;
    },
  },
  site: {
    title: "MOCA Codex Documentation",
    logo: {
      src: { light: "/moca-logo-light.svg", dark: "/moca-logo-dark.svg" },
      alt: "MOCA Codex",
      width: "130px",
    },
  },
  metadata: {
    title: "MOCA Codex Documentation",
    defaultTitle: "MOCA Codex Documentation",
    description: "MOCA Codex Documentation",
    keywords: ["MOCA Codex", "Documentation", "API", "Directus"],
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      items: [
        {
          type: "category",
          label: "Getting Started",
          icon: "sparkles",
          items: [
            "/introduction",
            "/getting-started",
          ],
        },
        {
          type: "category",
          label: "Endpoints",
          icon: "server",
          items: [
            "/codex",
            "/files",
          ],
        },
        {
          type: "category",
          label: "Guides",
          icon: "book-open",
          items: [
            "/query-guide",
          ],
        },
        {
          type: "category",
          label: "Reference",
          icon: "folder-cog",
          items: [
            {
              type: "link",
              icon: "code",
              badge: {
                label: "OpenAPI",
                color: "purple",
              },
              label: "API Reference",
              to: "/api",
            },
            {
              type: "link",
              icon: "play-circle",
              badge: {
                label: "Interactive",
                color: "blue",
              },
              label: "Examples",
              to: "/examples",
            },
          ],
        },
        {
          type: "category",
          label: "Useful Links",
          collapsible: false,
          icon: "link",
          items: [
            {
              type: "link",
              icon: "database",
              label: "Directus Docs",
              to: "https://docs.directus.io/",
            },
            {
              type: "link",
              icon: "file-text",
              label: "LLMs.txt",
              to: "https://docs.decc0s.com/llms.txt",
            },
            {
              type: "link",
              icon: "file-text",
              label: "LLMs.txt Full",
              to: "https://docs.decc0s.com/llms-full.txt",
            },
            {
              type: "link",
              icon: "code",
              label: "OpenAPI Reference",
              to: "https://api.decc0s.com/api-docs/oas",
            },
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
    },
    {
      type: "category",
      label: "Examples",
      icon: "play-circle",
      items: [
        {
          type: "doc",
          file: "examples/introduction",
          label: "Introduction",
          icon: "sparkles",
        },
        {
          type: "category",
          label: "Codex",
          icon: "database",
          collapsed: false,
          items: [
            {
              type: "doc",
              file: "examples/codex/items-by-owner",
              label: "Query by Owner",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/list-items",
              label: "List Items",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/get-by-id",
              label: "Get by ID",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/filter-by-name",
              label: "Filter by Name",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/pagination",
              label: "Pagination",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/sorting",
              label: "Sorting",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/codex/search",
              label: "Full-Text Search",
              icon: "database",
            },
          ],
        },
        {
          type: "category",
          label: "Files",
          icon: "database",
          collapsed: false,
          items: [
            {
              type: "doc",
              file: "examples/files/list-files",
              label: "List Files",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/files/filter-images",
              label: "Filter Images",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/files/get-metadata",
              label: "Get Metadata",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/files/recent-files",
              label: "Recent Files",
              icon: "database",
            },
          ],
        },
        {
          type: "category",
          label: "Assets",
          icon: "database",
          collapsed: false,
          items: [
            {
              type: "doc",
              file: "examples/assets/presets",
              label: "Image Presets",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/assets/transformations",
              label: "Custom Transformations",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/assets/sharp",
              label: "Sharp Transformations",
              icon: "database",
            },
          ],
        },
        {
          type: "category",
          label: "Advanced",
          icon: "database",
          collapsed: false,
          items: [
            {
              type: "doc",
              file: "examples/advanced/complex-filters",
              label: "Complex Filters",
              icon: "database",
            },
            {
              type: "doc",
              file: "examples/advanced/exclude-null",
              label: "Exclude Null Values",
              icon: "database",
            },
          ],
        },
      ],
    },
  ],
  redirects: [
    { from: "/", to: "/introduction" },
    { from: "/examples", to: "/examples/introduction" },
  ],
  plugins: [uncheckQueryParamsPlugin, fixPagefindUrlsPlugin],
  apis: [
    {
      type: "file",
      input: "./apis/openapi.json",
      path: "/api",
    },
  ],
};

export default config;
