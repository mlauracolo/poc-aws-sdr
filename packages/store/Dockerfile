# syntax=docker/dockerfile:1.7

# ── 1. Build (instala deps + compila en el mismo stage) ───────────────────────
# Fusionar deps+build evita el problema de symlinks rotos al copiar
# node_modules entre stages en pnpm v10.
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.30.0
# Manifests primero para aprovechar cache de capas (solo reinstala si cambia package.json/lockfile)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY packages/domain/package.json      packages/domain/package.json
COPY packages/store/package.json       packages/store/package.json
COPY packages/integration/package.json packages/integration/package.json
RUN --mount=type=secret,id=github_pat,target=/run/secrets/github_pat \
    GITHUB_PAT="$(cat /run/secrets/github_pat)" \
    pnpm install --frozen-lockfile
# Código fuente (se invalida el cache solo si cambia src)
COPY . .
RUN pnpm --filter @sdr/domain build
RUN pnpm --filter @sdr/library build

# ── 2. Imagen de producción ───────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# node_modules desde build (symlinks pnpm intactos, misma estructura)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/domain/node_modules packages/domain/node_modules
COPY --from=build /app/packages/store/node_modules  packages/store/node_modules
# Manifests para resolución del workspace
COPY package.json pnpm-workspace.yaml ./
COPY packages/domain/package.json packages/domain/package.json
COPY packages/store/package.json   packages/store/package.json
# Artefactos compilados
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
COPY --from=build /app/packages/store/dist  ./packages/store/dist
EXPOSE 3000
CMD ["node", "packages/store/dist/src/main.js"]

