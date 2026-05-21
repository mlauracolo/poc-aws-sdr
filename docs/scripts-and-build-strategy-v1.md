# Estrategia de Scripts y Build para Servicio + Lambdas - V1

## Objetivo

Definir como deberian verse los scripts y el flujo de build si este repo sigue creciendo con:

- backend HTTP,
- multiples lambdas,
- dominio compartido,
- y eventualmente multiples contextos de negocio.

La idea es separar claramente:

- build del dominio,
- build del servicio,
- build de cada lambda,
- validacion de bundle,
- test local,
- y packaging para deploy.

## Estado actual

Hoy el repo tiene estos scripts relevantes en root:

```json
{
  "build:domain": "pnpm --filter @sdr/domain build",
  "build:library": "pnpm run build:domain && pnpm --filter @sdr/library build",
  "build:integration": "pnpm run build:domain && pnpm --filter @sdr/integration build",
  "build:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration build:lambda",
  "build:lambda:all": "pnpm run build:domain && pnpm --filter @sdr/integration build:lambda:all",
  "check:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration check:lambda",
  "test:lambda": "pnpm --filter @sdr/integration test:lambda"
}
```

Y en `packages/integration`:

```json
{
  "build": "tsc -p tsconfig.json",
  "build:lambda": "tsx scripts/build-lambda.ts migrate-books",
  "build:lambda:all": "tsx scripts/build-lambda.ts all",
  "check:lambda": "tsx scripts/build-lambda.ts migrate-books",
  "test:lambda": "tsx scripts/test-lambda.ts"
}
```

## Problema principal del estado actual

Hoy los scripts estan acoplados a `migrate-books`.

Eso alcanza para una POC de una Lambda, pero no escala bien si mañana aparecen:

- `delete-book`
- `assign-book-to-library`
- `sync-authors`
- `publish-genre-catalog`

Las limitaciones concretas son estas:

- `build:lambda` apunta a una lambda fija,
- `check:lambda` tambien,
- `test:lambda` no recibe nombre,
- no hay packaging por lambda,
- no hay deploy por lambda,
- y root mezcla build del dominio con build operativo sin una capa clara de orquestacion.

## Principio de diseño recomendado

Para 
Los scripts deberian seguir esta regla:

- un script por responsabilidad,
- un artefacto por lambda,
- y un parametro por nombre de lambda siempre que la accion sea individual.

Eso permite crecer sin convertir el repo en una coleccion de scripts especiales para cada caso.

## Como lo ordenaria

Separaria el flujo en cinco niveles:

1. build de dependencias compartidas
2. build del servicio
3. test/check/build de una lambda puntual
4. build masivo de todas las lambdas
5. packaging/deploy de una lambda puntual

## Nivel 1: dominio

Esto deberia seguir existiendo como paso base:

```bash
pnpm run build:domain
```

Si mañana el dominio se parte en varios packages, esta capa podria evolucionar a algo como:

```bash
pnpm run build:domains
```

Pero hoy `build:domain` esta bien.

## Nivel 2: servicio HTTP

El servicio deberia tener su propio flujo y no depender de lambdas.

Ejemplo conceptual:

```bash
pnpm run build:library
pnpm run build:docker
```

Regla importante:

- `build:library` no deberia disparar nada de `integration`
- `build:docker` del servicio tampoco deberia necesitar build de lambdas

## Nivel 3: lambda individual

Este es el nivel que mas necesita evolucionar.

Para cada lambda deberia poder correrse:

```bash
pnpm run test:lambda migrate-books
pnpm run check:lambda migrate-books
pnpm run build:lambda migrate-books
pnpm run package:lambda migrate-books
pnpm run deploy:lambda migrate-books
```

Y lo mismo para cualquier otra:

```bash
pnpm run test:lambda delete-book
pnpm run check:lambda delete-book
pnpm run build:lambda delete-book
```

## Nivel 4: lambdas masivas

Para CI o chequeo global:

```bash
pnpm run build:lambda:all
pnpm run check:lambda:all
pnpm run test:lambda:all
```

No porque siempre se vayan a usar localmente, sino porque en CI son muy utiles.

## Nivel 5: packaging y deploy

Hoy eso no existe y deberia ser una capa aparte.

La idea seria:

```bash
pnpm run package:lambda migrate-books
pnpm run deploy:lambda migrate-books
```

Y para otra lambda:

```bash
pnpm run package:lambda sync-authors
pnpm run deploy:lambda sync-authors
```

## Como deberian verse los scripts de root

Si lo ordenara conceptualmente, esperaria algo parecido a esto:

```json
{
  "build:domain": "pnpm --filter @sdr/domain build",
  "build:library": "pnpm run build:domain && pnpm --filter @sdr/library build",
  "build:docker": "docker build ...",
  "test:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration test:lambda",
  "test:lambda:all": "pnpm run build:domain && pnpm --filter @sdr/integration test:lambda:all",
  "check:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration check:lambda",
  "check:lambda:all": "pnpm run build:domain && pnpm --filter @sdr/integration check:lambda:all",
  "build:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration build:lambda",
  "build:lambda:all": "pnpm run build:domain && pnpm --filter @sdr/integration build:lambda:all",
  "package:lambda": "pnpm run build:domain && pnpm --filter @sdr/integration package:lambda",
  "deploy:lambda": "pnpm --filter @sdr/integration deploy:lambda"
}
```

La clave no es el nombre exacto, sino la separacion de responsabilidades.

## Como deberian verse los scripts de `packages/integration`

Mi expectativa seria algo asi:

```json
{
  "build": "tsc -p tsconfig.json",
  "test:lambda": "tsx scripts/test-lambda.ts",
  "test:lambda:all": "tsx scripts/test-lambda.ts all",
  "check:lambda": "tsx scripts/build-lambda.ts --check",
  "check:lambda:all": "tsx scripts/build-lambda.ts all --check",
  "build:lambda": "tsx scripts/build-lambda.ts",
  "build:lambda:all": "tsx scripts/build-lambda.ts all",
  "package:lambda": "tsx scripts/package-lambda.ts",
  "deploy:lambda": "tsx scripts/deploy-lambda.ts"
}
```

## Como deberia funcionar `build-lambda.ts`

Hoy ya existe una buena base: registro central + `esbuild` + validacion de imports prohibidos.

Yo lo dejaria evolucionar hacia esto:

- recibe nombre de lambda o `all`
- recibe modo `build` o `check`
- genera un output por lambda
- imprime inputs del bundle
- valida contaminacion
- opcionalmente escribe metadata del bundle

### Ejemplo de invocacion

```bash
tsx scripts/build-lambda.ts migrate-books
tsx scripts/build-lambda.ts delete-book
tsx scripts/build-lambda.ts all
tsx scripts/build-lambda.ts delete-book --check
```

## Como deberia funcionar `test-lambda.ts`

Hoy el problema es que esta hardcodeado a `migrate-books`.

Yo lo haria parametrico.

Ejemplo:

```bash
tsx scripts/test-lambda.ts migrate-books
tsx scripts/test-lambda.ts delete-book
tsx scripts/test-lambda.ts all
```

Y cada lambda tendria su input local de prueba en su propia carpeta o en un registry comun.

Ejemplo:

```text
src/lambda-modules/migrate-books/migrate-books.test-input.ts
src/lambda-modules/delete-book/delete-book.test-input.ts
```

## Packaging

Hoy `build-lambda.ts` genera `.js`, pero eso no es todavía un artefacto de deploy completo.

Para una estrategia zip, yo agregaria:

```text
packages/integration/scripts/package-lambda.ts
```

Su responsabilidad seria:

- tomar `dist/lambda/<name>.handler.js`
- agregar archivos necesarios
- generar `dist/lambda/<name>.zip`

Ejemplo de salida:

```text
packages/integration/dist/lambda/migrate-books.handler.js
packages/integration/dist/lambda/migrate-books.zip
packages/integration/dist/lambda/delete-book.handler.js
packages/integration/dist/lambda/delete-book.zip
```

## Deploy

No mezclaria deploy adentro de `build-lambda.ts`.

Lo separaria en otro script o en IaC.

Opciones:

- `deploy-lambda.ts` como paso temporal
- o mejor aun, IaC mas pipeline

Si hay script directo, su responsabilidad deberia ser solo:

- tomar artefacto
- publicar codigo
- actualizar configuracion minima si aplica

## Flujo local recomendado

Para desarrollar una lambda nueva:

```bash
pnpm run build:domain
pnpm run test:lambda delete-book
pnpm run check:lambda delete-book
pnpm run build:lambda delete-book
```

Si ademas quieren dejarla deployable:

```bash
pnpm run package:lambda delete-book
pnpm run deploy:lambda delete-book
```

## Flujo CI recomendado

Yo lo separaria asi:

### Job 1: validacion

```bash
pnpm install
pnpm run build:domain
pnpm run check:lambda:all
pnpm run test:lambda:all
pnpm run build:lambda:all
pnpm run build:library
```

### Job 2: deploy de lambdas

Esto ya dependeria del criterio de release, pero conceptualmente:

```bash
pnpm run package:lambda migrate-books
pnpm run deploy:lambda migrate-books
```

O mejor aun, solo para las lambdas afectadas.

## Criterio para multiples contextos de dominio

Si mañana aparecen `author`, `library` o `genre`, esto no deberia cambiar la filosofia de scripts.

Lo unico que cambia es:

- el handler nuevo,
- el registro de lambdas,
- y las dependencias de dominio que consume esa lambda.

El flujo de scripts sigue siendo el mismo.

## Recomendacion final

La mejor alternativa me parece esta:

- servicio y lambda con pipelines separados,
- dominio como prerequisito comun,
- scripts individuales por lambda parametrizados por nombre,
- builds globales solo para CI,
- packaging separado del build,
- deploy separado del packaging.

En resumen:

- `build` compila
- `check` valida bundle
- `test` ejecuta handler localmente
- `package` genera artefacto
- `deploy` publica

Esa separacion es la que les va a permitir crecer sin que el repo se vuelva confuso cuando ya no haya una sola lambda sino varias.
