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
  theme: "deepSpace" as const,
  layout: "modern" as const,
  hideModels: true,
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
