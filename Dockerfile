# Standalone image for agentsetupprotocol.com.
#
# Build from the REPOSITORY ROOT, not from site/:
#     docker build -f Dockerfile .
# The site renders spec/ and registry/ at build time, so those directories are
# build inputs and the build context has to contain them.

FROM node:24.3.0-bookworm-slim AS deps
WORKDIR /app
COPY site/package.json site/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24.3.0-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY site/ ./
# The content the site is generated from. Every page is prerendered, so these are
# read during `next build` and are not needed in the runtime image.
COPY spec/ ../spec/
COPY registry/ ../registry/
RUN npm run build

FROM node:24.3.0-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
