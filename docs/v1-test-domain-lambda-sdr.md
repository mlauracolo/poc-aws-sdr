# v1 — Test Domain + Lambda SDR

## Visión general

Este workspace es un monorepo pnpm con tres paquetes. El objetivo del POC es sincronizar tablas entre dos bases Oracle (origen `INTSDR` → destino `sdr`) a través de una Lambda AWS, usando un modelo de dominio compartido.

```
poc-aws-sdr/
├── packages/
│   ├── domain/        @sdr/domain       ← modelos de dominio compartidos
│   ├── store/         @sdr/library      ← servicio NestJS (API REST)
│   └── integration/   @sdr/integration  ← lambda de sincronización
```

---

## Cómo se comunican los módulos

```
┌─────────────────────────────────────────────────────────────┐
│                      @sdr/domain                            │
│  SdrIntNexusA · SdrIntNexusD · SdrIntExactian               │
│  TcvAviso · TcvOrder                                        │
│  (clases de dominio con validación, sin dependencias ext.)  │
└────────────────┬────────────────────┬───────────────────────┘
                 │  workspace:*        │  workspace:*
                 ▼                     ▼
   ┌─────────────────────┐   ┌──────────────────────────────┐
   │    @sdr/library     │   │      @sdr/integration        │
   │  (NestJS service)   │   │  (Lambda sync-boundary)      │
   │                     │   │                              │
   │  Lee desde Oracle   │   │  Lee Oracle ORIGEN           │
   │  Expone REST API    │   │  Mapea a dominio             │
   │  Puerto 3000        │   │  Escribe en Oracle DESTINO   │
   └─────────────────────┘   └──────────────────────────────┘
```

- `@sdr/domain` es el único paquete sin dependencias de infraestructura. Define los value objects y errores de dominio para las 5 entidades.
- `@sdr/library` y `@sdr/integration` dependen de `@sdr/domain` vía `workspace:*` — pnpm resuelve esto en local sin publicar al registry.
- **El domain siempre se compila primero** (`build:domain`) antes de buildear cualquiera de los otros dos.

---

## Entidades sincronizadas

| Entidad dominio | Tabla origen | Tabla destino |
|---|---|---|
| `SdrIntNexusA` | Oracle INTSDR | Oracle sdr |
| `SdrIntNexusD` | Oracle INTSDR | Oracle sdr |
| `SdrIntExactian` | Oracle INTSDR | Oracle sdr |
| `TcvAviso` | Oracle INTSDR | Oracle sdr |
| `TcvOrder` | Oracle INTSDR | Oracle sdr |

---

## Lambda sync-boundary — flujo de ejecución

```
Evento Lambda
  { startDate?: "YYYYMMDDHHMM", endDate?: "YYYYMMDDHHMM" }
       │
       ▼
buildDefaultRange()  ←── si no hay fechas, usa CURSOR_DATE (env var) como start
       │                   y now() como end (formato YYYYMMDDHHMM)
       ▼
originDataSource.initialize()      ← Oracle ORIGEN (env vars ORIGIN_DB_*)
destinationDataSource.initialize() ← Oracle DESTINO (env vars DEST_DB_*)
       │
       ├── syncSdrIntNexusA(start, end)
       ├── syncSdrIntNexusD(start, end)
       ├── syncSdrIntExactian(start, end)
       ├── syncTcvAviso(start, end)
       └── syncTcvOrder(start, end)
              │
              ▼
         OriginRepository.findLatestInRange(start, end)
              │
              ▼
         mapXxxEntityToDomain(entity)  → dominio validado
              │
              ▼
         DestinationRepository.save(destEntity)
```

---

## Build de imágenes Docker

### Prerrequisitos

1. **Docker Desktop** corriendo con BuildKit habilitado
2. **`$env:GITHUB_PAT`** seteado con un Classic PAT con:
   - Scope `read:packages`
   - SSO autorizado para la org `pormeldev` en GitHub

   ```powershell
   # Setear en la sesión actual
   $env:GITHUB_PAT = "ghp_tu_token_aqui"

   # Setear permanentemente en el perfil de PowerShell
   Add-Content $PROFILE '$env:GITHUB_PAT="ghp_tu_token_aqui"'
   ```

3. **`.npmrc`** en la raíz del workspace (ya existe):
   ```
   @pormeldev:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PAT}
   ```

### Imagen del servicio NestJS — `poc-aws-sdr`

```powershell
pnpm run build:docker
# Equivale a:
# docker build --secret id=npmrc,src=.npmrc --secret id=github_pat,env=GITHUB_PAT \
#   -f packages/store/Dockerfile -t poc-aws-sdr .
```

**Dockerfile** (`packages/store/Dockerfile`):
- Stage `build`: instala deps + compila domain + compila store con `nest build --builder swc`
- Stage `runner`: copia `node_modules` + `dist` del build stage. Entry point: `packages/store/dist/src/main.js`

> ⚠️ SWC con `rootDir: "./src"` genera el output en `dist/src/` (no en `dist/` directamente).

### Imagen de la Lambda — `poc-aws-sdr-lambda`

```powershell
pnpm run build:lambda:docker
# Equivale a:
# docker build --secret id=npmrc,src=.npmrc --secret id=github_pat,env=GITHUB_PAT \
#   -f packages/integration/Dockerfile.lambda -t poc-aws-sdr-lambda .
```

**Dockerfile** (`packages/integration/Dockerfile.lambda`):
- Stage `build`: instala deps + compila domain + bundlea integration con **esbuild** → un único archivo `sync-boundary.handler.js`
- Stage `runner`: imagen base `public.ecr.aws/lambda/nodejs:22`. Copia solo el bundle. Entry point: `sync-boundary.handler.handler`

> El bundle esbuild incluye todo el código de la lambda en un solo archivo CJS. Las deps de Oracle (`oracledb`) se incluyen en el bundle. Los drivers opcionales (`mssql`, `pg`, `mysql2`) se marcan como `external` ya que son peer deps no utilizados de `@pormeldev/axis-service-database-typeorm`.

---

## Variables de entorno requeridas

### Lambda (`packages/integration`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `ORIGIN_DB_HOST` | Host Oracle origen | `rds-oracle-sdr.xxx.us-east-1.rds.amazonaws.com` |
| `ORIGIN_DB_PORT` | Puerto Oracle origen | `1521` |
| `ORIGIN_DB_USER` | Usuario Oracle origen | `MCOLO` |
| `ORIGIN_DB_PASSWORD` | Password Oracle origen | — |
| `ORIGIN_DB_SERVICE` | Service Name Oracle origen | `ORCL` |
| `DEST_DB_HOST` | Host Oracle destino | — |
| `DEST_DB_PORT` | Puerto Oracle destino | `1521` |
| `DEST_DB_USER` | Usuario Oracle destino | — |
| `DEST_DB_PASSWORD` | Password Oracle destino | — |
| `DEST_DB_SERVICE` | Service Name Oracle destino | — |
| `CURSOR_DATE` | Última fecha procesada (formato `YYYYMMDDHHMM`). Si no se provee, usa `200001010000` | `202501010000` |

### Servicio NestJS (`packages/store`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP (default `3000`) |
| `ORIGIN_DB_*` | Igual que la lambda |

---

## Cosas a tener en cuenta

### pnpm + Docker (symlinks)

pnpm v10 crea `packages/*/node_modules/pkg` como **symlinks relativos** que apuntan a `../../node_modules/.pnpm/pkg.../node_modules/pkg`. Estos symlinks se rompen si:

- Se copian entre stages de Docker (`COPY --from=stage`) sin que el stage destino también tenga el `.pnpm` del root
- Se copian desde Windows al contexto Docker (los symlinks de Windows tienen paths absolutos que no existen en Linux)

**Fix aplicado**: ambos Dockerfiles usan un único stage de build (install + compile juntos). El `.dockerignore` excluye `**/node_modules` y `**/dist` para que los `node_modules` locales de Windows nunca entren al build context.

### typeorm como dependencia directa

El código de la lambda importa directamente desde `typeorm` (`import { DataSource } from 'typeorm'`). En local funciona por ghost-dep del workspace (el package `store` lo declara). En Docker (donde solo se instalan domain + integration) **typeorm debe estar declarado explícitamente** en `packages/integration/package.json#dependencies`.

### PAT y cache de Docker

Una vez que el layer de `pnpm install` queda cacheado en Docker, los rebuilds posteriores son muy rápidos (~2s). El cache se invalida si cambia el `pnpm-lock.yaml`. Cuando eso ocurre, pnpm descarga todo desde cero dentro del container y **necesita el PAT con SSO activo**.

### SWC output path

`nest build --builder swc` con `rootDir: "./src"` en tsconfig genera:
```
packages/store/dist/src/main.js   ← correcto
packages/store/dist/main.js       ← NO existe
```
El `CMD` del Dockerfile y el script `start:prod` apuntan a `dist/src/main.js`.

### Cursor de sincronización

La lambda usa `CURSOR_DATE` (env var) como punto de inicio del rango a sincronizar. Actualmente **no persiste el cursor** automáticamente — hay que actualizar la variable manualmente (o via SSM Parameter Store, pendiente de implementar) luego de cada ejecución exitosa.
