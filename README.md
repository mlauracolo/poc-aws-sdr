# POC AWS SDR

POC mínima en TypeScript para validar una arquitectura Axis-like donde un backend NestJS/Fastify y una Lambda AWS comparten código de dominio sin compartir el runtime HTTP.

## Qué valida

- El backend usa NestJS/Fastify y expone `POST /books`.
- La Lambda funciona como handler independiente.
- Ambos pasan por `CreateBookUseCase` y usan la entidad `Book`.
- La Lambda se bundlea con `esbuild`.
- El bundle de Lambda falla si arrastra cosas no deseadas como NestJS, Fastify, controllers, `app.module`, `book.module` o `main.ts`.

## Por qué la Lambda no usa solo dominio

El dominio modela reglas puras: entidad, value objects y policies. Para ejecutar un flujo real también hace falta una entrada, un caso de uso y una salida. Por eso la Lambda usa:

- `integration.handler.ts` como adaptador de entrada.
- `CreateBookUseCase` como aplicación.
- `LambdaBookRepository` como adaptador de salida.

Así la Lambda comparte el centro del negocio sin depender del framework web del backend.

## Por qué no se importa NestJS en Lambda

NestJS pertenece al backend HTTP. Si la Lambda importa módulos, controllers o `main.ts`, termina arrastrando dependencias de runtime que no necesita. Esta POC busca que el bundle de Lambda incluya solamente el handler, el caso de uso, el adapter Lambda y el dominio usado por ese flujo.

## Instalar dependencias

```bash
npm install
```

## Correr backend

```bash
npm run start:dev
```

Probar:

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Clean Architecture\",\"year\":2017,\"cost\":100}"
```

## Buildear backend con Docker

```bash
docker build -t poc-aws-sdr .
docker run --rm -p 3000:3000 poc-aws-sdr
```

## Buildear Lambda

```bash
npm run build:lambda
```

El resultado queda en:

```text
dist/lambda/integration.handler.js
```

También se puede correr:

```bash
npm run build:lambda:all
npm run check:lambda
```

## Probar handler manualmente

```bash
npm run test:lambda
```

El script ejecuta `src/book/infrastructure/lambda/integration.handler.ts` con este event:

```json
{
  "body": "{\"title\":\"Clean Architecture\",\"year\":2017,\"cost\":100}"
}
```

## Ver si se coló código no deseado

`scripts/build-lambda.ts` imprime los archivos incluidos por `esbuild` desde `result.metafile.inputs` y falla si encuentra alguno de estos términos:

- `@nestjs`
- `fastify`
- `swagger`
- `app.module`
- `main.ts`
- `controller`
- `book.module`

Para provocar un error intencional, agregá temporalmente este import en `src/book/infrastructure/lambda/integration.handler.ts`:

```ts
import { AppModule } from '../../../app.module';
void AppModule;
```

Después corré:

```bash
npm run check:lambda
```

La validación debería fallar mostrando el input sospechoso que entró al bundle.
