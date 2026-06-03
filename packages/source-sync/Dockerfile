# syntax=docker/dockerfile:1.7

# ── 1. Install deps + build ───────────────────────────────────────────────────
FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.30.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./
COPY packages/core/package.json         packages/core/package.json
COPY packages/source-sync/package.json  packages/source-sync/package.json
RUN --mount=type=secret,id=github_pat,target=/run/secrets/github_pat \
    GITHUB_PAT="$(cat /run/secrets/github_pat)" \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @sdr/domain build
RUN pnpm --filter @sdr/source-sync build:lambda

# ── 3. Minimal runtime image ───────────────────────────────────────────────────
# AWS Lambda Node.js runtime image — replace with the version you target in AWS
FROM public.ecr.aws/lambda/nodejs:24 AS runner
WORKDIR ${LAMBDA_TASK_ROOT}

COPY --from=build /app/packages/source-sync/dist/lambda/sync-boundary.handler.js ./sync-boundary.handler.js
COPY --from=build /app/packages/source-sync/dist/lambda/sync-boundary.handler.js.map ./sync-boundary.handler.js.map

CMD ["sync-boundary.handler.handler"]
