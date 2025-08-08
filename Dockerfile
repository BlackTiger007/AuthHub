# -------- Build Stage --------
FROM node:20-alpine AS builder

RUN mkdir -p /app/data
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV DATABASE_URL="data/db.sqlite"
ENV PUBLIC_SENTRY_DSN="https://4de9eb4b796c49b2979e1868f3d44578@glitchtip.webretter.com/1"

# DB push ausführen
RUN npx drizzle-kit push --force

# App builden
RUN pnpm run build

# -------- Runtime Stage --------
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json ./
RUN pnpm install --prod && \
    pnpm install drizzle-kit@0.31.4

# Build und drizzle.config übernehmen
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle.config.ts .
COPY --from=builder /app/drizzle ./drizzle

ENV NODE_ENV=production
ENV DATABASE_URL="data/db.sqlite"
ENV PUBLIC_SENTRY_DSN="https://4de9eb4b796c49b2979e1868f3d44578@glitchtip.webretter.com/1"

EXPOSE 3000
CMD ["node", "build/index.js"]
