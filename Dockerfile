# Multi-stage Dockerfile for MOCA Codex monorepo
# Stage 1: Build stage
FROM oven/bun:1.2.0-alpine AS builder

# Accept TURBO_TOKEN as build argument for remote caching
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

# Install turbo globally
RUN bun install -g turbo

# Install build dependencies for native modules (e.g., isolated-vm)
# py3-setuptools provides distutils which is required by node-gyp (removed from Python 3.12+)
# nodejs is required for isolated-vm's build scripts which call node directly
RUN apk add --no-cache python3 py3-setuptools g++ make nodejs npm

# Ensure node-gyp and build scripts use the actual Node.js binary (not Bun's node compatibility)
# Bun's node compatibility doesn't fully support process.config which isolated-vm needs
ENV npm_config_node=/usr/bin/node
ENV PATH=/usr/bin:$PATH

# Set working directory
WORKDIR /app

# Copy root package files
COPY package.json bun.lock turbo.json ./

# Copy all workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY apps/api/extensions/directus-extension-codex/package.json ./apps/api/extensions/directus-extension-codex/
COPY apps/docs/package.json ./apps/docs/
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
RUN NODE_OPTIONS="--max-old-space-size=4096" APP_ENV=production bun run build:api

# Ensure migrations directory exists for copying (even if empty)
RUN mkdir -p /app/apps/api/migrations

# Verify startup script exists and make it executable in builder stage
RUN ls -la /app/apps/api/startup.sh && chmod +x /app/apps/api/startup.sh

# Stage 2: Production stage for API (Directus)
FROM node:20-alpine as third-party-ext
RUN apk add --no-cache python3 g++ make
WORKDIR /extensions
# Declare third-party Directus extensions to install
# Include @pnpm packages explicitly as they're required by directus-extension-api-docs
RUN printf '{\n  "name": "directus-extensions",\n  "private": true,\n  "dependencies": {\n    "directus-extension-api-docs": "^2.3.1",\n    "directus-extension-sync": "^3.0.5",\n    "@pnpm/find-workspace-dir": "^2.0.0",\n    "@pnpm/error": "^3.0.0",\n    "@pnpm/constants": "^7.0.0"\n  }\n}\n' > package.json
RUN npm install --no-audit --no-fund --legacy-peer-deps
# Move all installed directus extensions into /extensions/directus
RUN mkdir -p ./directus && \
    cd node_modules && \
    find . -maxdepth 1 -type d -name "directus-extension-*" -exec mv {} ../directus \;
# Copy @pnpm dependencies to ensure they're available at runtime
# Copy to both the root and each extension's node_modules
RUN mkdir -p ./directus/node_modules && \
    cp -r node_modules/@pnpm ./directus/node_modules/ 2>/dev/null || true && \
    for ext_dir in ./directus/directus-extension-*/node_modules; do \
        if [ -d "$ext_dir" ] && [ -d "node_modules/@pnpm" ]; then \
            mkdir -p "$ext_dir/@pnpm" && \
            cp -r node_modules/@pnpm/* "$ext_dir/@pnpm/" 2>/dev/null || true; \
        fi; \
    done

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

# Install missing runtime dependencies required by directus-extension-api-docs
# Install @pnpm packages in the extension's node_modules directory where they're needed
RUN EXT_DIR="/directus/extensions/directus-extension-api-docs" && \
    if [ -d "$EXT_DIR" ]; then \
        mkdir -p "$EXT_DIR/node_modules/@pnpm" && \
        cd "$EXT_DIR" && \
        (npm install --no-audit --no-fund --save @pnpm/find-workspace-dir@^2.0.0 @pnpm/error@^3.0.0 @pnpm/constants@^7.0.0 2>/dev/null || \
         npm install --no-audit --no-fund --prefix "$EXT_DIR" @pnpm/find-workspace-dir@^2.0.0 @pnpm/error@^3.0.0 @pnpm/constants@^7.0.0) && \
        echo "✅ @pnpm dependencies installed in extension's node_modules"; \
    fi && \
    # Also install in extensions root for fallback resolution
    mkdir -p /directus/extensions/node_modules && \
    cd /directus/extensions && \
    npm install --no-audit --no-fund --save @pnpm/find-workspace-dir@^2.0.0 @pnpm/error@^3.0.0 @pnpm/constants@^7.0.0 && \
    chown -R node:node /directus/extensions/node_modules && \
    chown -R node:node "$EXT_DIR/node_modules" 2>/dev/null || true && \
    echo "✅ @pnpm dependencies installed for directus-extension-api-docs"

# Verify all extensions are properly installed
RUN ls -la /directus/extensions/ && \
    echo "✅ All extensions installed successfully"

RUN ls -la /directus/extensions/directus-extension-codex/ && \
    echo "✅ directus-extension-codex installed successfully"

# Copy Directus configuration
COPY --from=builder --chown=node:node /app/apps/api/directus-config /directus/directus-config
COPY --from=builder --chown=node:node /app/apps/api/directus-sync.config.js /directus/directus-sync.config.js

# Install dotenv for directus-sync.config.js and @directus/update-check for Directus CLI
RUN mkdir -p /directus/node_modules && \
    cd /directus && \
    printf '{\n  "name": "directus-runtime-deps",\n  "version": "1.0.0",\n  "private": true\n}\n' > package.json && \
    npm install --no-audit --no-fund --legacy-peer-deps dotenv@17.2.3 @directus/update-check@13.0.3 && \
    chown -R node:node /directus/node_modules /directus/package.json && \
    echo "✅ dotenv and @directus/update-check installed"

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

