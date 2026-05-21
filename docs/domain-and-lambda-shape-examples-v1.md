# Ejemplos Visuales de Evolucion de Dominio y Lambdas - V1

## Objetivo

Mostrar de forma visual como se veria el repo si:

- siguen creciendo casos de uso en Lambda,
- aparecen nuevas entidades o contextos,
- y el dominio deja de ser solo `book`.

La idea es aterrizarlo en ejemplos concretos para poder conversarlo con claridad.

## Situacion actual simplificada

Hoy la forma general del repo se parece a esto:

```text
packages/
  domain/
    src/
      book/
        book.ts
        value-object/
        policy/
        error/
      index.ts
  book-store/
    src/
      book/
  integration/
    src/
      lambda-modules/
        migrate-books/
          migrate-books.handler.ts
          lambda-book.repository.ts
```

Esto hoy esta bien para una POC chica.

## Escenario 1: aparecen mas casos de uso, pero sigue existiendo solo `book`

Si el negocio sigue girando solo alrededor de `book`, la evolucion natural seria sumar nuevas lambdas dentro de `integration`.

Se veria asi:

```text
packages/
  domain/
    src/
      book/
        book.ts
        value-object/
        policy/
        error/
      index.ts
  book-store/
    src/
      book/
  integration/
    src/
      lambda-modules/
        migrate-books/
          migrate-books.handler.ts
        create-book/
          create-book.handler.ts
        delete-book/
          delete-book.handler.ts
        publish-book/
          publish-book.handler.ts
```

### Lectura

En este escenario:

- las lambdas crecen por caso de uso,
- el dominio sigue siendo solo `book`,
- y un solo `packages/domain` sigue teniendo sentido.

## Escenario 2: aparecen nuevos contextos dentro del mismo paquete `domain`

Supongamos que ademas de `book` aparecen:

- `library`
- `author`
- `genre`

Una primera evolucion sana se veria asi:

```text
packages/
  domain/
    src/
      book/
        book.ts
        value-object/
        policy/
        error/
      library/
        library.ts
        value-object/
        policy/
        error/
      author/
        author.ts
        value-object/
        error/
      genre/
        genre.ts
        value-object/
        error/
      index.ts
  book-store/
    src/
      book/
      library/
      author/
  integration/
    src/
      lambda-modules/
        create-book/
          create-book.handler.ts
        delete-book/
          delete-book.handler.ts
        assign-book-to-library/
          assign-book-to-library.handler.ts
        sync-authors/
          sync-authors.handler.ts
        publish-genre-catalog/
          publish-genre-catalog.handler.ts
```

### Lectura

En este escenario:

- el dominio crece por contexto,
- las lambdas siguen creciendo por caso de uso,
- y todavia podria sostenerse un `@sdr/domain` unico.

## Escenario 3: el dominio ya quedo demasiado grande y se parte en paquetes

Cuando los contextos ya tienen peso propio, el repo podria pasar a verse asi:

```text
packages/
  domain-book/
    src/
      book.ts
      value-object/
      policy/
      error/
  domain-library/
    src/
      library.ts
      value-object/
      policy/
      error/
  domain-author/
    src/
      author.ts
      value-object/
      error/
  domain-genre/
    src/
      genre.ts
      value-object/
      error/
  book-store/
    src/
      book/
      library/
      author/
  integration/
    src/
      lambda-modules/
        create-book/
        delete-book/
        assign-book-to-library/
        sync-authors/
        publish-genre-catalog/
```

### Lectura

En este escenario:

- cada contexto de dominio es un package,
- cada lambda depende solo de los packages necesarios,
- y el backend tambien consume solo los contextos que realmente usa.

## Ejemplos concretos de lambdas y sus dependencias

## Caso 1: `delete-book`

```text
packages/integration/src/lambda-modules/delete-book/delete-book.handler.ts
```

Dependencia esperada:

- `book`

Si el dominio sigue unificado:

```ts
import { Book } from "@sdr/domain";
```

Si el dominio esta separado:

```ts
import { Book } from "@sdr/domain-book";
```

## Caso 2: `sync-authors`

```text
packages/integration/src/lambda-modules/sync-authors/sync-authors.handler.ts
```

Dependencia esperada:

- `author`

Import esperado:

```ts
import { Author } from "@sdr/domain-author";
```

O, en etapa previa:

```ts
import { Author } from "@sdr/domain";
```

## Caso 3: `assign-book-to-library`

```text
packages/integration/src/lambda-modules/assign-book-to-library/assign-book-to-library.handler.ts
```

Dependencias esperadas:

- `book`
- `library`

Si el dominio sigue unificado:

```ts
import { Book, Library } from "@sdr/domain";
```

Si el dominio esta separado:

```ts
import { Book } from "@sdr/domain-book";
import { Library } from "@sdr/domain-library";
```

## Como se veria el registro de lambdas

Con crecimiento por caso de uso, `build-lambda.ts` deberia terminar con un registro parecido a este:

```ts
const lambdas = {
  "migrate-books": "src/lambda-modules/migrate-books/migrate-books.handler.ts",
  "create-book": "src/lambda-modules/create-book/create-book.handler.ts",
  "delete-book": "src/lambda-modules/delete-book/delete-book.handler.ts",
  "assign-book-to-library":
    "src/lambda-modules/assign-book-to-library/assign-book-to-library.handler.ts",
  "sync-authors": "src/lambda-modules/sync-authors/sync-authors.handler.ts",
  "publish-genre-catalog":
    "src/lambda-modules/publish-genre-catalog/publish-genre-catalog.handler.ts",
} as const;
```

## Como se veria conceptualmente el build

La idea seria:

- un artefacto por lambda,
- no un artefacto gigante para todas las integraciones,
- y dependencias de dominio solo segun necesidad.

Salida esperada:

```text
packages/integration/dist/lambda/migrate-books.handler.js
packages/integration/dist/lambda/create-book.handler.js
packages/integration/dist/lambda/delete-book.handler.js
packages/integration/dist/lambda/assign-book-to-library.handler.js
packages/integration/dist/lambda/sync-authors.handler.js
```

## Como se veria conceptualmente el backend

El backend `book-store` seguiria siendo el runtime HTTP principal.

Podria crecer asi:

```text
packages/book-store/src/
  book/
  library/
  author/
  genre/
```

Pero eso no significa que deba absorber las lambdas.

La separacion correcta seguiria siendo:

- backend HTTP en `book-store`,
- lambdas en `integration`,
- dominio en uno o varios packages de dominio.

## Regla visual simple

La regla mas facil de recordar seria esta:

- si cambia el caso de uso o el trigger, probablemente cambia la lambda,
- si cambia el concepto de negocio, probablemente cambia el contexto de dominio.

## Conclusión

Visualmente, la arquitectura sana se ve asi:

- lambdas creciendo por caso de uso,
- dominio creciendo por contexto,
- backend creciendo por canal HTTP,
- y cada runtime consumiendo solo el dominio que necesita.

Ese es el criterio que mejor escala si mañana dejan de hablar solo de `book` y empiezan a aparecer `library`, `author`, `genre` u otros contextos reales.
