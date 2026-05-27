# Scripts de referencia — poc-aws-sdr

> Todos los comandos se ejecutan desde la raíz del monorepo.
> Requieren `$env:GITHUB_PAT` con SSO autorizado para la org `pormeldev`.

---

## Prerrequisito: variable de entorno

```powershell
$env:GITHUB_PAT = "ghp_tu_token"
```

---

## Instalación

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instala dependencias de todos los paquetes del workspace |

---

## Build local (sin Docker)

| Comando | Descripción |
|---------|-------------|
| `pnpm run build:domain` | Compila solo `@sdr/domain` (tipos compartidos) |
| `pnpm run build:library` | Compila domain + NestJS service (`@sdr/library`) |
| `pnpm run build:integration` | Compila domain + integration (TypeScript completo) |
| `pnpm run build:lambda` | Compila domain + bundle esbuild de la lambda `sync-boundary` |
| `pnpm run build:lambda:all` | Compila domain + bundle esbuild de todas las lambdas |
| `pnpm run build` | Compila domain + library + integration (todo) |

---

## Docker

### NestJS Service (`poc-aws-sdr`)

```powershell
# Genera la imagen
pnpm run build:docker

# Corre el contenedor (falla en DB sin env vars, pero confirma que el módulo carga)
docker run --rm poc-aws-sdr

# Corre con variables de entorno (ejemplo)
docker run --rm `
  -e DB_HOST=host `
  -e DB_PORT=1521 `
  -e DB_USER=usuario `
  -e DB_PASSWORD=clave `
  -e DB_SERVICE=servicio `
  -p 3000:3000 `
  poc-aws-sdr
```

### Lambda (`poc-aws-sdr-lambda`)

```powershell
# Genera la imagen
pnpm run build:lambda:docker

# Levanta el Lambda Runtime Interface Emulator localmente
docker run --rm -p 9000:8080 poc-aws-sdr-lambda:latest

# Invoca la función desde otra terminal (simula un evento Lambda)
Invoke-RestMethod `
  -Uri "http://localhost:9000/2015-03-31/functions/function/invocations" `
  -Method POST `
  -Body '{}' `
  -ContentType "application/json"
```

---

## Tests locales (requieren `.env` en la raíz)

| Comando | Descripción |
|---------|-------------|
| `pnpm run test:lambda` | Dry-run: lee las 5 tablas del origen, mapea a dominio y guarda snapshot JSON. No escribe en destino. Usa `SNAPSHOT_LIMIT`, `DAYS_BACK`, `START_DATE`/`END_DATE` |
| `pnpm --filter @sdr/integration test:sample` | Sync completo de prueba: lee los últimos N registros del origen y los escribe en destino. Usa `SNAPSHOT_LIMIT` (default 10) |

### Variables de entorno para tests

```env
# .env en la raíz del monorepo
SNAPSHOT_LIMIT=5       # limita cantidad de registros leídos
DAYS_BACK=7            # rango de días hacia atrás (default 7)
START_DATE=2024-01-01  # rango manual (alternativa a DAYS_BACK)
END_DATE=2024-01-31
```

---

## Linting y formato

| Comando | Descripción |
|---------|-------------|
| `pnpm run lint` | Verifica linting con Biome (CI mode, no modifica) |
| `pnpm run lint:write` | Corrige errores de linting automáticamente |
| `pnpm run format:verify` | Verifica formato sin modificar |
| `pnpm run format:write` | Aplica formato automáticamente |
| `pnpm run check:write` | Linting + formato en un solo comando |

---

## Tests unitarios

| Comando | Descripción |
|---------|-------------|
| `pnpm run test:unit` | Corre tests unitarios con Jest |
| `pnpm run test:watch` | Tests en modo watch |
| `pnpm run test:application` | Tests de capa de aplicación |
| `pnpm run test:cov` | Tests con reporte de cobertura |

---

## Dev server

| Comando | Descripción |
|---------|-------------|
| `pnpm run start:dev` | Levanta el NestJS service en modo desarrollo (hot reload) |
| `pnpm run start:prod` | Levanta el NestJS service compilado en modo producción |

---

## Imágenes Docker generadas

| Imagen | Tamaño aprox. | Descripción |
|--------|---------------|-------------|
| `poc-aws-sdr:latest` | ~750MB | NestJS service — servidor HTTP en puerto 3000 |
| `poc-aws-sdr-lambda:latest` | ~620MB | Lambda `sync-boundary` — sincroniza tablas Oracle origen → destino |
