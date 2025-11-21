# Multi-stage Dockerfile for MOCA Codex monorepo
# Stage 1: Build stage
FROM oven/bun:1.2.0-alpine AS builder

# Accept TURBO_TOKEN as build argument for remote caching
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Install turbo globally
RUN bun install -g turbo

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json bun.lock turbo.json ./

# Copy all workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/api/extensions/directus-extension-codex/package.json ./apps/api/extensions/directus-extension-codex/
COPY packages/config/package.json ./packages/config/
COPY packages/eslint-config-custom/package.json ./packages/eslint-config-custom/
COPY packages/types/package.json ./packages/types/

# Copy patches directory (needed for patch-package if it exists)
COPY patches ./patches

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the project using turbo with increased memory limit
RUN cd packages/config && APP_ENV=production bun run build && cd ../..
RUN NODE_OPTIONS="--max-old-space-size=4096" APP_ENV=production FORCE_COLOR=1 turbo build --filter=directus-extension-codex --filter=api

# Ensure migrations directory exists for copying (even if empty)
RUN mkdir -p /app/apps/api/migrations

# Verify startup script exists and make it executable in builder stage
RUN ls -la /app/apps/api/startup.sh && chmod +x /app/apps/api/startup.sh

# Stage 2: Production stage for API (Directus)
FROM node:20-alpine as third-party-ext
RUN apk add --no-cache python3 g++ make
WORKDIR /extensions
# Declare third-party Directus extensions to install
RUN printf '{\n  "name": "directus-extensions",\n  "private": true,\n  "dependencies": {\n    "directus-extension-api-docs": "^2.3.1",\n    "directus-extension-sync": "^3.0.5"\n  }\n}\n' > package.json
RUN npm install --no-audit --no-fund
# Move all installed directus extensions into /extensions/directus
RUN mkdir -p ./directus && \
    cd node_modules && \
    find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../directus \;

FROM directus/directus:latest AS api-production

# Switch to root to install dependencies and copy files
USER root

# Install curl and postgresql-client for health checks and database connectivity tests (Alpine uses apk)
RUN apk add --no-cache curl postgresql-client

# Install directus-sync CLI tool (needed for runtime sync operations)
RUN npm install -g directus-sync

# Copy third-party extensions built in separate stage
COPY --from=third-party-ext --chown=node:node /extensions/directus /directus/extensions

# Copy built extensions from builder stage
COPY --from=builder --chown=node:node /app/apps/api/extensions /directus/extensions

# Verify all extensions are properly installed
RUN ls -la /directus/extensions/ && \
    echo "✅ All extensions installed successfully"

RUN ls -la /directus/extensions/directus-extension-codex/ && \
    echo "✅ directus-extension-codex installed successfully"

# Copy Directus configuration
COPY --from=builder --chown=node:node /app/apps/api/directus-config /directus/directus-config
COPY --from=builder --chown=node:node /app/apps/api/directus-sync.config.js /directus/directus-sync.config.js

# Copy migrations directory from builder stage
COPY --from=builder --chown=node:node /app/apps/api/migrations/ /directus/migrations/

# Copy startup script (already made executable in builder stage)
COPY --from=builder --chown=node:node /app/apps/api/startup.sh /directus/startup.sh

# Switch back to node user
USER node

# Expose port
EXPOSE 8055

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:8055/server/health || exit 1

# Start using our custom startup script
CMD ["sh", "/directus/startup.sh"]

