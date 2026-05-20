# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/domain/package.json packages/domain/package.json
COPY packages/book-store/package.json packages/book-store/package.json
COPY packages/integration/package.json packages/integration/package.json
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc --mount=type=secret,id=github_pat,target=/run/secrets/github_pat GITHUB_PAT="$(cat /run/secrets/github_pat)" pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=github_pat,target=/run/secrets/github_pat GITHUB_PAT="$(cat /run/secrets/github_pat)" pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/domain/package.json packages/domain/package.json
COPY packages/book-store/package.json packages/book-store/package.json
COPY packages/integration/package.json packages/integration/package.json
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc --mount=type=secret,id=github_pat,target=/run/secrets/github_pat GITHUB_PAT="$(cat /run/secrets/github_pat)" pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=build /app/packages/book-store/dist ./packages/book-store/dist
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
EXPOSE 3000
CMD ["node", "packages/book-store/dist/main.js"]
