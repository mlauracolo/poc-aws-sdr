# Scripts Reference — poc-aws-sdr

## Build

| Comando | Qué hace |
|---|---|
| `pnpm run build:domain` | Compila solo `packages/domain` (`@sdr/domain`) con `tsc` |
| `pnpm run build:library` | Compila domain + `packages/store` (`@sdr/library`) con `nest build --builder swc` |
| `pnpm run build:integration` | Compila domain + `packages/integration` (`@sdr/integration`) con `tsc` |
| `pnpm run build:lambda` | Compila domain + bundlea la lambda `sync-boundary` con esbuild → `packages/integration/dist/lambda/sync-boundary.handler.js` |
| `pnpm run build:lambda:all` | Igual que `build:lambda` pero bundlea todas las lambdas del workspace |
| `pnpm run build` | Compila domain + store + integration (full build, sin Docker) |

## Docker

| Comando | Qué hace | Imagen generada |
|---|---|---|
| `pnpm run build:docker` | Buildea la imagen Docker del servicio NestJS (`packages/store/Dockerfile`) | `poc-aws-sdr:latest` |
| `pnpm run build:lambda:docker` | Buildea la imagen Docker de la lambda (`packages/integration/Dockerfile.lambda`) | `poc-aws-sdr-lambda:latest` |

> **Requisito**: `$env:GITHUB_PAT` debe estar seteado con un PAT con SSO autorizado para la org `pormeldev`.

### Correr el servicio NestJS localmente

```powershell
docker run --rm \
  -e PORT=3000 \
  -e ORIGIN_DB_HOST=<host> \
  -e ORIGIN_DB_PORT=1521 \
  -e ORIGIN_DB_USER=<user> \
  -e ORIGIN_DB_PASSWORD=<pass> \
  -e ORIGIN_DB_SERVICE=<service> \
  -p 3000:3000 \
  poc-aws-sdr
```

### Invocar la lambda localmente (Lambda Runtime Emulator)

```powershell
# Terminal 1 — levantar el contenedor
docker run --rm -p 9000:8080 \
  -e ORIGIN_DB_HOST=<host> \
  -e ORIGIN_DB_PORT=1521 \
  -e ORIGIN_DB_USER=<user> \
  -e ORIGIN_DB_PASSWORD=<pass> \
  -e ORIGIN_DB_SERVICE=<service> \
  -e DEST_DB_HOST=<host> \
  -e DEST_DB_USER=<user> \
  -e DEST_DB_PASSWORD=<pass> \
  -e DEST_DB_SERVICE=<service> \
  poc-aws-sdr-lambda

# Terminal 2 — invocar la función con un evento de prueba
Invoke-RestMethod `
  -Uri "http://localhost:9000/2015-03-31/functions/function/invocations" `
  -Method POST `
  -Body '{"startDate":"20250101","endDate":"20250201"}' `
  -ContentType "application/json"
```

## Test (sin Docker)

| Comando | Qué hace | Env vars clave |
|---|---|---|
| `pnpm run test:lambda` | Dry-run: lee 5 tablas de la DB origen, mapea a dominio, imprime resultados y guarda snapshot JSON. **No escribe nada.** | `SNAPSHOT_LIMIT`, `DAYS_BACK` (def. 7), `START_DATE`/`END_DATE` |
| `pnpm run test:sample` | Sync real: lee los últimos N registros de origen y los escribe en destino | `SNAPSHOT_LIMIT` (def. 10) |

> Requieren archivo `.env` en la raíz con las variables de conexión a Oracle.

## Dev / Calidad

| Comando | Qué hace |
|---|---|
| `pnpm run start:dev` | Levanta `packages/store` en modo watch (NestJS dev server) |
| `pnpm run start:prod` | Levanta `packages/store` desde el build compilado |
| `pnpm run lint` | Corre Biome CI (lint + format check, sin escribir) |
| `pnpm run lint:write` | Corre Biome y aplica fixes automáticos |
| `pnpm run format:write` | Formatea todos los archivos con Biome |
| `pnpm run check:write` | Lint + format + imports con Biome, aplicando fixes |
| `pnpm run test:unit` | Jest — unit tests |
| `pnpm run test:application` | Jest — tests de capa application (`**/__tests__/**/*.spec.ts`) |
| `pnpm run test:cov` | Jest con coverage |
