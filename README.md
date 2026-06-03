# POC AWS SDR

Monorepo TypeScript para validar una arquitectura donde:

- `packages/core` expone el dominio compartido como `@sdr/domain`
- `packages/api` levanta una API NestJS/Fastify
- `packages/source-sync` construye una Lambda AWS con `esbuild`

La idea central es compartir reglas y modelos de dominio entre API y Lambda sin arrastrar el runtime HTTP dentro del bundle de Lambda.

## Estructura

```text
.
└── packages/
    ├── core/         -> paquete `@sdr/domain`
    ├── api/          -> paquete `@sdr/api`
    └── source-sync/  -> paquete `@sdr/source-sync`
```

## Build strategy

- `packages/core`: compila con `tsc`
- `packages/api`: compila y corre con Nest + `swc`
- `packages/source-sync`: compila con `tsc` y bundlea la Lambda con `esbuild`

## Requisitos

- Node.js 24
- `pnpm` 10
- Docker, si vas a probar las imágenes
- `GITHUB_PAT`, si necesitás instalar dependencias privadas o construir imágenes Docker usando `.npmrc`

En PowerShell:

```powershell
$env:GITHUB_PAT="tu_token"
```

## Instalar dependencias

```bash
pnpm install
```

## Scripts principales

### Build

```bash
pnpm run build:domain
pnpm run build:api
pnpm run build:source-sync
pnpm run build:lambda
pnpm run build
```

Qué hace cada uno:

- `build:domain`: compila `packages/core`
- `build:api`: compila dominio + API
- `build:source-sync`: compila dominio + paquete `source-sync`
- `build:lambda`: compila dominio + genera `packages/source-sync/dist/lambda/sync-boundary.handler.js`
- `build`: compila dominio + API + `source-sync`

### API local

```bash
pnpm run start:dev
```

Ese script delega a `@sdr/api`.

Para ejecutar el build compilado:

```bash
pnpm run start:prod
```

### Lambda local sin Docker

```bash
pnpm run test:lambda
```

El script usa `tsx` y toma variables desde `../../.env`.

También están disponibles:

```bash
pnpm run build:lambda:all
pnpm run check:lambda
```

## Prueba rápida de dominio desde la API

Se agregó un endpoint mínimo para validar que la API consume correctamente `@sdr/domain`:

```http
GET /math-demo/sample
```

Respuesta esperada:

```json
{
  "numbers": [7, 5],
  "sum": 12,
  "product": 35
}
```

Si la API corre en local:

```bash
curl http://localhost:3000/math-demo/sample
```

## Docker

### Imagen de API

```bash
pnpm run build:docker
docker run --rm -p 3000:3000 poc-aws-sdr
```

La imagen usa:

- [packages/api/Dockerfile](/c:/Users/Laura%20Colo/Desktop/Edenor/poc-sdr-aws/poc-aws-sdr/packages/api/Dockerfile)
- entrypoint: `node packages/api/dist/src/main.js`

### Imagen de Lambda

```bash
pnpm run build:lambda:docker
docker run --rm -p 9000:8080 poc-aws-sdr-lambda
```

Para invocarla localmente:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:9000/2015-03-31/functions/function/invocations" `
  -Method POST `
  -Body '{"startDate":"202501010000","endDate":"202501080000"}' `
  -ContentType "application/json"
```

Para ver logs:

```bash
docker logs -f <container_id>
```

## Variables de entorno

### API

La API puede necesitar variables propias de Nest/Fastify o de acceso a servicios externos, según el módulo que estés usando.

### Lambda

La Lambda usa conexiones Oracle origen/destino. Los scripts de prueba y el handler leen variables como:

- `ORIGIN_DB_HOST`
- `ORIGIN_DB_PORT`
- `ORIGIN_DB_USER`
- `ORIGIN_DB_PASSWORD`
- `ORIGIN_DB_SERVICE`
- `DEST_DB_HOST`
- `DEST_DB_PORT`
- `DEST_DB_USER`
- `DEST_DB_PASSWORD`
- `DEST_DB_SERVICE`
- `CURSOR_DATE`

Para `test:lambda` también sirven:

- `DAYS_BACK`
- `START_DATE`
- `END_DATE`
- `SNAPSHOT_LIMIT`

## Validación del bundle Lambda

El build de Lambda imprime los inputs incluidos por `esbuild` y falla si detecta dependencias no deseadas del runtime HTTP.

Comando:

```bash
pnpm run check:lambda
```

El objetivo es que el bundle de `source-sync` no arrastre Nest, controllers o módulos de la API.

## Calidad

```bash
pnpm run lint
pnpm run lint:write
pnpm run format:write
pnpm run check:write
pnpm run test:unit
pnpm run test:application
pnpm run test:cov
```

## Notas

- El nombre físico de carpeta `packages/core` no cambia el nombre público del paquete: el dominio sigue siendo `@sdr/domain`.
- `@sdr/api` y `@sdr/source-sync` consumen `@sdr/domain` vía `workspace:*`.
- Si estás migrando esta base a otro repo, no copies sólo `tsconfig.json`: necesitás mantener consistente `package.json`, `pnpm-workspace.yaml`, Dockerfiles y los manifests de cada paquete.
