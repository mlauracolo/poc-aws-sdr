# POC AWS SDR

POC mínima en TypeScript para validar una arquitectura Axis-like donde un backend NestJS/Fastify y una Lambda AWS comparten código de dominio sin compartir el runtime HTTP.

El dominio vive como paquete privado de workspace en `packages/domain` y se consume como `@sdr/domain`. El contexto de libros queda dentro de ese paquete en `packages/domain/src/book`, para que el paquete pueda sumar otros bounded contexts en el futuro.

## Qué valida

- El backend usa NestJS/Fastify y expone `POST /books`.
- El backend vive en el paquete privado `@sdr/library` y se despliega como contenedor Docker.
- La Lambda de migración vive en el paquete privado `@sdr/integration`.
- Ambos incluyen y usan la entidad `Book` exportada por `@sdr/domain`.
- La Lambda se bundlea con `esbuild`.
- El bundle de Lambda falla si arrastra cosas no deseadas como NestJS, Fastify, controllers, `app.module`, `book.module` o `main.ts`.

## Estructura del workspace

```text
.
└── packages/
    ├── domain/
    │   └── src/
    │       ├── index.ts
    │       └── book/
    │           ├── book.ts
    │           ├── value-object/
    │           ├── policy/
    │           └── error/
    ├── book-store/
    │   ├── Dockerfile
    │   └── src/
    │       ├── main.ts
    │       └── book/
    └── integration/
        └── src/
            └── lambda-modules/
                └── migrate-books/
```

`packages/domain/package.json` declara el paquete `@sdr/domain`. Los paquetes `@sdr/library` y `@sdr/integration` lo consumen con:

```json
"@sdr/domain": "workspace:*"
```

Cuando se buildea, el dominio compila a `packages/domain/dist` y los imports:

```ts
import { Book } from '@sdr/domain';
```

resuelven contra el `exports` del paquete.

## Por qué la Lambda usa dominio directamente

El dominio modela reglas puras: entidad, value objects y policies. En esta POC, la Lambda es un proceso de migración/integración y no importa el paquete del backend HTTP. Por eso la Lambda usa:

- `migrate-books.handler.ts` como adaptador de entrada.
- `Book` desde `@sdr/domain`.
- `LambdaBookRepository` como adaptador de salida.

Así la Lambda comparte el centro del negocio sin depender del paquete `@sdr/library` ni del framework web del backend.

## Por qué no se importa NestJS en Lambda

NestJS pertenece al backend HTTP. Si la Lambda importa módulos, controllers o `main.ts`, termina arrastrando dependencias de runtime que no necesita. Esta POC busca que el bundle de Lambda incluya solamente el handler, el caso de uso, el adapter Lambda y el dominio usado por ese flujo.

## Instalar dependencias

```bash
pnpm install
```

## Correr backend

```bash
pnpm run start:dev
```

Probar:

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Clean Architecture\",\"year\":2017,\"cost\":100}"
```

## Buildear backend con Docker

```bash
docker build --secret id=npmrc,src=.npmrc \
  --secret id=github_pat,env=GITHUB_PAT \
  -f packages/book-store/Dockerfile \
  -t poc-aws-sdr .
docker run --rm -p 3000:3000 poc-aws-sdr
```

## Buildear Lambda

```bash
pnpm run build:lambda
```

El resultado queda en:

```text
packages/integration/dist/lambda/migrate-books.handler.js
```

También se puede correr:

```bash
pnpm run build:lambda:all
pnpm run check:lambda
```

## Probar handler manualmente

```bash
pnpm run test:lambda
```

El script ejecuta `packages/integration/src/lambda-modules/migrate-books/migrate-books.handler.ts` con este event:

```json
{
  "body": "{\"title\":\"Clean Architecture\",\"year\":2017,\"cost\":100}"
}
```

## Ver si se coló código no deseado

`packages/integration/scripts/build-lambda.ts` imprime los archivos incluidos por `esbuild` desde `result.metafile.inputs` y falla si encuentra alguno de estos términos:

- `@nestjs`
- `fastify`
- `swagger`
- `app.module`
- `main.ts`
- `controller`
- `book.module`

Para provocar un error intencional, agregá temporalmente este import en `packages/integration/src/lambda-modules/migrate-books/migrate-books.handler.ts`:

```ts
import { AppModule } from '../../../../book-store/src/app.module';
void AppModule;
```

Después corré:

```bash
pnpm run check:lambda
```

La validación debería fallar mostrando el input sospechoso que entró al bundle.
