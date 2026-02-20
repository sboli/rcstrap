FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile

# Build frontend
FROM deps AS build-web
COPY packages/web/ packages/web/
COPY tsconfig.base.json ./
RUN pnpm --filter @rcstrap/web build

# Build server
FROM deps AS build-server
COPY packages/server/ packages/server/
COPY tsconfig.base.json ./
RUN pnpm --filter @rcstrap/server build

# Production image
FROM base AS production
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build-server /app/packages/server/dist packages/server/dist
COPY --from=build-web /app/packages/web/dist packages/web/dist

RUN mkdir -p /app/data
VOLUME /app/data

ENV NODE_ENV=production
ENV DB_PATH=/app/data/rcstrap.sqlite
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/api/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "packages/server/dist/main.js"]
