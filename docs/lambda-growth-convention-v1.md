# Convencion para Crecer Lambdas en este Repo - V1

## Objetivo

Definir una forma consistente de agregar nuevas Lambdas o nuevos handlers en el repo sin romper la separacion entre:

- servicio HTTP,
- integraciones AWS,
- y dominio compartido.

La idea es que, cuando aparezcan nuevas funcionalidades, el equipo tenga una regla clara para decidir:

- si corresponde una Lambda nueva,
- donde ubicarla,
- como buildearla,
- como validarla,
- y como desplegarla.

## Principio general

Mi recomendacion es esta:

- una Lambda por caso de uso o integracion relevante,
- no una sola Lambda grande con multiples responsabilidades,
- y no mezclar runtime HTTP con runtime Lambda.

En este repo, `packages/integration` deberia crecer como paquete de adapters AWS, no como extenson del backend Nest.

## Regla para decidir si crear una Lambda nueva

Yo crearia una Lambda nueva cuando se cumpla al menos una de estas condiciones:

- cambia el trigger,
- cambia el contrato de entrada,
- cambia el ciclo de vida operativo,
- cambia la necesidad de escalado,
- cambia la estrategia de permisos,
- o el caso de uso merece despliegue y rollback independiente.

## Ejemplos donde si haria una Lambda nueva

- `migrate-books`
- `create-book-from-sqs`
- `publish-book-event`
- `sync-books-to-external-system`
- `import-books-from-file`

## Ejemplos donde no la haria

No haria una Lambda nueva solo porque existe otro endpoint HTTP similar si:

- comparte exactamente el mismo trigger,
- comparte el mismo flujo operativo,
- y no necesita independencia de despliegue.

En ese caso podria seguir siendo el mismo modulo o la misma family de integracion.

## Estructura recomendada

Mantendria la base actual, pero con una convención mas explícita:

```text
packages/integration/
  src/
    lambda-modules/
      migrate-books/
        migrate-books.handler.ts
        migrate-books.repository.ts
        migrate-books.test-input.ts
      create-book/
        create-book.handler.ts
        create-book.repository.ts
        create-book.test-input.ts
      publish-book/
        publish-book.handler.ts
        publish-book.publisher.ts
        publish-book.test-input.ts
  scripts/
    build-lambda.ts
    test-lambda.ts
    package-lambda.ts
```

## Regla de naming

Usaria siempre nombres de caso de uso o integracion:

- `migrate-books`
- `create-book`
- `publish-book`
- `import-books`

No usaria nombres tecnicos o ambiguos como:

- `handler1`
- `books-post`
- `lambda-book`

El nombre de la carpeta, del handler y del artefacto deberian coincidir.

## Convencion de implementacion

Cada Lambda deberia tener:

- un entrypoint `*.handler.ts`,
- adapters propios de entrada/salida si aplica,
- dependencias al dominio solo via `@sdr/domain`,
- y cero imports desde `packages/book-store`.

## Ejemplo de criterio

Servicio HTTP:

```text
packages/book-store/src/book/...
```

Lambda:

```text
packages/integration/src/lambda-modules/create-book/create-book.handler.ts
```

Dominio compartido:

```text
packages/domain/src/book/...
```

Eso mantiene la direccion correcta:

- el dominio se comparte,
- la infraestructura no.

## Registro central de lambdas

Hoy ya existe una idea de registro en `build-lambda.ts`.

La mantendria, porque da orden y hace visible que lambdas existen.

Ejemplo:

```ts
const lambdas = {
  "migrate-books": "src/lambda-modules/migrate-books/migrate-books.handler.ts",
  "create-book": "src/lambda-modules/create-book/create-book.handler.ts",
  "publish-book": "src/lambda-modules/publish-book/publish-book.handler.ts",
} as const;
```

Esto permite:

- build individual,
- build total,
- validacion individual,
- y eventual deploy individual.

## Como deberian correr los scripts

## Build de dominio

Primero deberia compilar siempre el dominio compartido:

```bash
pnpm run build:domain
```

## Test local de una Lambda puntual

Idealmente:

```bash
pnpm run test:lambda create-book
pnpm run test:lambda migrate-books
```

Hoy eso no esta parametrizado asi, pero deberia evolucionar a ese formato.

## Validacion de bundle de una Lambda puntual

```bash
pnpm run check:lambda create-book
pnpm run check:lambda migrate-books
```

Esto deberia verificar:

- que el bundle compila,
- que no entra NestJS,
- que no entran controllers,
- que no entra `main.ts`,
- y que no hay imports prohibidos.

## Build de una Lambda puntual

```bash
pnpm run build:lambda create-book
pnpm run build:lambda migrate-books
```

Salida esperada:

```text
packages/integration/dist/lambda/create-book.handler.js
packages/integration/dist/lambda/migrate-books.handler.js
```

## Build completo

Para CI o chequeo global:

```bash
pnpm run build:lambda:all
```

## Flujo recomendado al agregar una Lambda nueva

Cuando aparezca una nueva funcionalidad, yo seguiria este orden:

1. definir si realmente merece Lambda propia,
2. crear carpeta en `src/lambda-modules/<nombre>/`,
3. crear handler propio,
4. crear adapters necesarios,
5. agregar la Lambda al registro central,
6. agregar input de prueba local,
7. validar `test:lambda`,
8. validar `check:lambda`,
9. validar `build:lambda`,
10. recien despues conectar deploy AWS.

## Criterio de AWS integration

La integracion con AWS no la meteria “adentro” del backend `book-store`.

La haria crecer en `packages/integration`.

Eso quiere decir:

- handlers AWS en `integration`,
- clientes/repositorios/adapters AWS en `integration`,
- dominio puro en `domain`,
- backend HTTP en `book-store`.

## Criterio para POST u otros casos de uso

Si aparece un caso tipo `post` o `create-book`, la pregunta correcta no es “es POST entonces va junto con el backend”.

La pregunta correcta es:

- cual es el trigger real,
- corre por HTTP sync o por AWS event-driven,
- necesita independencia operativa,
- necesita otro esquema de permisos,
- necesita otro ritmo de despliegue.

### Si es HTTP sincrono del backend

Entonces pertenece a `book-store`.

### Si es un proceso AWS independiente

Entonces pertenece a `integration` y probablemente merece una Lambda nueva.

## Alternativa que me parece mejor

La mejor alternativa para este repo me parece esta:

- backend `book-store` sigue resolviendo el canal HTTP principal,
- `integration` concentra lambdas por caso de uso o integracion,
- cada Lambda se bundlea por separado,
- y todas comparten `@sdr/domain`.

Esto les da:

- mejor aislamiento,
- mejor escalado,
- mejor rollback,
- mejor trazabilidad,
- mejor control de dependencias,
- y menos riesgo de contaminar runtimes.

## Lo que evitaria

Evitaria estas tres cosas:

1. una Lambda gigante con muchos `if/switch`,
2. usar el backend Nest dentro de Lambda,
3. compartir el mismo proceso de packaging entre servicio y Lambda.

## Scripts que deberian existir a futuro

Si lo llevan a una version mas madura, yo esperaria estos scripts:

- `build:domain`
- `test:lambda <name>`
- `check:lambda <name>`
- `build:lambda <name>`
- `build:lambda:all`
- `package:lambda <name>`
- `deploy:lambda <name>`

## Recomendacion final

La convención que recomiendo es:

- una Lambda por caso de uso o integracion importante,
- carpeta propia por Lambda dentro de `packages/integration/src/lambda-modules`,
- registro central de handlers,
- build/test/check individual por nombre,
- deploy individual por artefacto,
- y dominio compartido solo desde `@sdr/domain`.

Si mañana agregan `create-book`, `publish-book` o `sync-books`, no intentaria meterlos dentro de la Lambda actual. Los sumaria como handlers/lambdas nuevas siguiendo la misma convención.
