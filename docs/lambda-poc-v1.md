# POC Lambda Compartiendo Dominio - V1

## Objetivo

Esta POC valida que podemos tener un backend NestJS/Fastify con estructura Axis-like y una Lambda AWS compartiendo codigo de dominio y aplicacion, sin que la Lambda arrastre dependencias propias del backend.

El objetivo principal no es desplegar todavia en AWS, sino confirmar la arquitectura, los imports, el bundle y la separacion entre runtimes.

## Que problema resuelve

En una aplicacion backend tradicional, el dominio y los casos de uso suelen vivir dentro del mismo proyecto que NestJS. El riesgo al agregar Lambdas es importar accidentalmente modulos, controllers o configuracion del backend, haciendo que el bundle de Lambda termine incluyendo NestJS, Fastify, Swagger u otras dependencias innecesarias.

Esta POC prueba que la Lambda puede ejecutar una funcionalidad real usando el mismo dominio, pero sin depender del runtime HTTP del backend.

## Idea general

La funcionalidad de crear libros esta separada en capas:

- Dominio: entidad `Book`, value objects, policies y errores.
- Aplicacion: `CreateBookCommandHandler`, que ejecuta el caso de uso.
- Infraestructura backend: controller NestJS y repositorio in-memory.
- Infraestructura Lambda: handler AWS y repositorio especifico de Lambda.

El backend y la Lambda comparten dominio y aplicacion, pero tienen entradas y adapters distintos.

## Flujo Backend

```text
HTTP POST /books
  -> BookController
  -> CreateBookCommandHandler
  -> Book.create(...)
  -> InMemoryBookRepository
```

El backend usa NestJS/Fastify. Nest queda limitado a la capa de infraestructura HTTP.

## Flujo Lambda

```text
APIGatewayProxyEventV2
  -> integration.handler.ts
  -> CreateBookCommandHandler
  -> Book.create(...)
  -> LambdaBookRepository
```

La Lambda no importa:

- `main.ts`
- `app.module.ts`
- `book.module.ts`
- controllers
- NestJS
- Fastify
- Swagger

Esto permite que el bundle de Lambda incluya solo lo necesario para ejecutar ese caso de uso.

## Uso de tipos AWS

Se usa `@types/aws-lambda` solamente para tipar el contrato del handler:

```ts
APIGatewayProxyEventV2
APIGatewayProxyStructuredResultV2
```

Esto no ejecuta AWS ni agrega runtime. Es solo TypeScript.

El test local crea un objeto con la misma forma que enviaria API Gateway HTTP API v2 y llama directamente al handler.

## Como se prueba localmente

Validar tipos:

```bash
npx tsc --noEmit
```

Ejecutar Lambda local:

```bash
npm run test:lambda
```

Ese comando ejecuta `scripts/test-lambda.ts`, que arma un `APIGatewayProxyEventV2` y llama a:

```text
src/book/infrastructure/lambda/integration.handler.ts
```

Respuesta esperada:

```json
{
  "statusCode": 201,
  "body": "{\"id\":\"...\"}"
}
```

## Como se valida el bundle

Para buildear la Lambda:

```bash
npm run build:lambda
```

El output queda en:

```text
dist/lambda/integration.handler.js
```

El script `scripts/build-lambda.ts` usa `esbuild` con:

- `bundle: true`
- `platform: node`
- `target: node22`
- `format: cjs`
- `minify: true`
- `treeShaking: true`
- `metafile: true`

Despues del build, inspecciona `result.metafile.inputs` y falla si detecta imports no deseados.

Terminos prohibidos actualmente:

- `@nestjs`
- `fastify`
- `swagger`
- `app.module`
- `main.ts`
- `controller`
- `book.module`

## Como probar que la validacion funciona

Agregar temporalmente un import incorrecto en el handler:

```ts
import { BookModule } from '../book.module';
void BookModule;
```

Luego correr:

```bash
npm run check:lambda
```

La validacion deberia fallar porque el bundle estaria incluyendo `book.module`, que pertenece al backend NestJS.

## Estado actual

La POC valida correctamente:

- Backend y Lambda comparten dominio.
- Backend y Lambda comparten caso de uso.
- Lambda tiene adapter propio.
- Lambda recibe un evento tipado como API Gateway HTTP API v2.
- Lambda se puede ejecutar localmente sin AWS.
- Lambda se bundlea con esbuild.
- El bundle falla si arrastra dependencias del backend.

## Que no cubre esta V1

Esta version no incluye:

- Despliegue real en AWS.
- AWS SDK.
- Base de datos real.
- Secrets o variables de entorno reales.
- IAM roles.
- API Gateway real.
- Observabilidad productiva.
- Autenticacion/autorizacion.

Esto es intencional. La V1 se enfoca en validar arquitectura, imports y bundle.

## Siguiente evolucion posible

Para una V2 se podria agregar:

- Adapter real usando DynamoDB, S3, SQS u otro servicio AWS.
- Script de deploy con CDK, SAM, Serverless Framework o Terraform.
- Tests unitarios para handler y command handler.
- Tests de contaminacion de bundle automatizados en CI.
- Manejo mas robusto de errores HTTP.
- Separacion de DTOs de entrada para backend y Lambda.
- Validacion de payload con `zod` o `class-validator`.

## Decision tecnica principal

La decision central es que la Lambda no debe inicializar NestJS ni importar modulos del backend. Debe tratarse como otro adapter de entrada, igual que un controller HTTP, pero independiente.

Esto mantiene el dominio reutilizable y permite que cada runtime tenga su propia infraestructura sin contaminar el bundle del otro.
