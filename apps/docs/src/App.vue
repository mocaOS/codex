<template>
  <div id="app">
    <ApiReference
      :configuration="scalarConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { ApiReference } from "@scalar/api-reference";
import "@scalar/api-reference/style.css";

// Environment-based API configuration
const isProduction = import.meta.env.PROD;
const apiBaseUrl = isProduction
  ? "https://api.decc0s.com"
  : "http://localhost:8055";
const apiDocsUrl = `${apiBaseUrl}/api-docs/oas`;

const scalarConfig = {
  // The URL of the OpenAPI/Swagger document
  url: apiDocsUrl,
  // Override servers from OpenAPI document
  servers: [
    {
      url: apiBaseUrl,
      description: "MOCA Codex API Server",
    },
  ],
  expandAllResponses: true,
  defaultOpenAllTags: true,
  hideClientButton: true,
  showSidebar: true,
  showDeveloperTools: "localhost" as const,
  showToolbar: "localhost" as const,
  operationTitleSource: "summary" as const,
  theme: "deepSpace" as const,
  persistAuth: false,
  telemetry: true,
  layout: "modern" as const,
  isEditable: false,
  isLoading: false,
  hideModels: true,
  documentDownloadType: "both" as const,
  hideTestRequestButton: false,
  hideSearch: false,
  showOperationId: false,
  hideDarkModeToggle: false,
  withDefaultFonts: true,
  expandAllModelSections: false,
  orderSchemaPropertiesBy: "alpha" as const,
  orderRequiredPropertiesFirst: true,
  _integration: "vue" as const,
  default: false,
};
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
}
</style>
