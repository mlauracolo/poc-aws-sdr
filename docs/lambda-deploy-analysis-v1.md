# Analisis de Deploy y Build de Lambda - V1

## Objetivo

Este documento resume el estado real del repo para la Lambda actual y que haria para llevarla a un flujo desplegable.

La idea no es cambiar la implementacion de la Lambda en esta etapa, sino dejar claro:

- que existe hoy,
- que falta para deployar,
- si el build es manual o deberia ir en otro trabajo,
- como controlar futuras actualizaciones,
- y si conviene o no meter Docker en este caso.

## Estado actual del repo

Hoy el repo tiene tres piezas:

- `packages/domain`: dominio compartido.
- `packages/book-store`: backend NestJS/Fastify desplegable como contenedor.
- `packages/integration`: Lambda y scripts de prueba/build.

La Lambda actual vive en:

```text
packages/integration/src/lambda-modules/migrate-books/migrate-books.handler.ts
```

El bundle se intenta generar desde:

```text
packages/integration/scripts/build-lambda.ts
```

Ese script:

- define un mapa de lambdas,
- usa `esbuild`,
- genera `dist/lambda/<lambda>.handler.js`,
- imprime los inputs del bundle,
- y falla si detecta imports contaminados del backend HTTP.

## Que si existe hoy

Hoy ya existe una base tecnica valida para una Lambda separada del backend:

- handler propio para AWS,
- repositorio propio para Lambda,
- dominio compartido desde `@sdr/domain`,
- script de build dedicado,
- script de test manual local,
- validacion de bundle para evitar arrastrar NestJS/Fastify.

Tambien hay un Dockerfile, pero corresponde al backend `book-store`, no a la Lambda.

## Que no existe hoy

No encontre en el repo:

- CDK,
- SAM,
- Serverless Framework,
- Terraform,
- CloudFormation,
- scripts de `zip`,
- script de `aws lambda update-function-code`,
- pipeline CI/CD,
- versionado de artefactos,
- publicacion automatica de la Lambda,
- Dockerfile especifico para Lambda.

Conclusion: hoy no hay mecanismo de deploy de Lambda. Solo hay un intento de build local y validacion de arquitectura.

## Hallazgo importante: el flujo actual no esta cerrando

Al probar los comandos documentados, el problema no aparece en AWS sino antes:

```bash
pnpm run build:lambda
pnpm run test:lambda
```

Ambos fallan por resolucion de `@sdr/domain`.

Errores observados:

- `build:lambda`: `Could not resolve "@sdr/domain"`
- `test:lambda`: `Cannot find module '@sdr/domain'`

Esto indica que la idea arquitectonica esta bien encaminada, pero el workflow actual de workspace/build no esta completamente resuelto para `integration`.

Antes de hablar de deploy, yo cerraria primero esta capa. Si no, cualquier pipeline en AWS va a heredar el mismo problema.

## Lectura tecnica del problema

La dependencia `@sdr/domain` figura en:

- `packages/integration/package.json`
- `pnpm-lock.yaml`

Y `packages/domain` compila a `dist` correctamente.

Pero hoy `integration` no la esta resolviendo ni en:

- `tsx` para test local,
- ni `esbuild` para bundle.

Eso sugiere que el gap real esta en alguna combinacion de estas cosas:

- instalacion/linkeo incompleto del workspace,
- falta de resolucion explicita para `esbuild`,
- falta de una estrategia consistente para ejecutar scripts TS dentro del monorepo,
- o una diferencia entre como se espera resolver `workspace:*` y como esta quedando instalado el repo.

No hace falta decidirlo todavia en este documento, pero si asumirlo como prerequisito de deploy.

## Build de Lambda: como lo veo hoy

Hoy el build es esencialmente manual.

El repo expone:

- `pnpm run build:lambda`
- `pnpm run build:lambda:all`
- `pnpm run check:lambda`
- `pnpm run test:lambda`

Pero eso no constituye un proceso de entrega. Solo prepara y valida el artefacto local.

### Mi lectura

Para una lambda como esta, el build no deberia quedar como un paso manual humano de largo plazo.

Lo dejaria asi:

1. `test:lambda` para validacion local rapida.
2. `check:lambda` para asegurar que no se contamino el bundle.
3. `build:lambda` para producir el artefacto.
4. un job aparte de CI/CD o IaC para deployar ese artefacto.

Separaria claramente:

- build del artefacto,
- validacion del bundle,
- y deploy a AWS.

## Opciones reales de deploy

### Opcion 1: ZIP + IaC

Seria mi opcion recomendada para esta POC.

Flujo:

1. `esbuild` genera `migrate-books.handler.js`.
2. se empaqueta en `.zip`.
3. IaC referencia ese zip y despliega la Lambda.

Ventajas:

- simple,
- rapido,
- barato,
- natural para una Lambda Node chica,
- mantiene la idea actual del bundle minimalista.

Herramientas posibles:

- AWS CDK,
- SAM,
- Terraform.

Mi preferencia aca seria CDK o SAM, porque encajan bien con Node/TypeScript y permiten modelar rapido:

- Lambda,
- role,
- variables de entorno,
- API Gateway si aplica,
- permisos,
- logs,
- versionado basico.

### Opcion 2: job de build separado + deploy por CLI

Tambien sirve para una etapa intermedia.

Flujo:

1. CI corre `build:domain`, `check:lambda`, `build:lambda`.
2. genera zip.
3. publica con `aws lambda update-function-code`.

Ventajas:

- rapido de montar,
- bajo costo de implementacion.

Desventajas:

- menos trazabilidad,
- menos declarativo,
- mas fragil que IaC,
- peor para escalar a varias lambdas.

Lo usaria solo si quieren salir rapido con una POC operativa.

### Opcion 3: Lambda container image

Solo la elegiria si aparece una necesidad concreta.

Casos donde si tendria sentido:

- dependencias nativas complejas,
- tooling del sistema operativo,
- necesidad de paridad fuerte con otro contenedor,
- artefacto demasiado incomodo para zip,
- varias dependencias que no juegan bien con el runtime zip tradicional.

Para esta Lambda, por lo que vi hoy, no parece necesario todavia.

El flujo actual con `esbuild` sugiere que el caso natural es zip, no image.

## Docker: conviene o no

Hoy Docker en el repo existe para el backend, no para la Lambda.

Yo no mezclaria ambos problemas.

### Lo que no haria

No meteria Docker en la Lambda solo porque el backend ya lo usa.

Eso agregaria:

- otro packaging path,
- otra forma de deploy,
- mas tiempo de build,
- mas superficie operativa,
- y menos foco para una POC que hoy todavia no cerro ni la resolucion local del workspace.

### Lo que si haria

Primero resolveria:

- build reproducible,
- test local,
- zip deployable,
- IaC minima.

Despues evaluaria Docker para Lambda solo si aparece una razon tecnica concreta.

## Como controlaria futuras actualizaciones

Hoy la Lambda no parece tener ningun mecanismo automatico de actualizacion.

Entonces, si alguien cambia:

- dominio,
- handler,
- adapter,
- o dependencias,

no hay nada en el repo que garantice por si solo que la Lambda:

- se rebuilda,
- se republíca,
- o mantenga compatibilidad.

Yo agregaria estos controles:

1. CI que corra `build:domain`, `test:lambda`, `check:lambda` y `build:lambda`.
2. deploy solo si esas validaciones pasan.
3. artefacto versionado por commit o tag.
4. si usan IaC, despliegue asociado al mismo cambio de infraestructura/codigo.
5. alerta simple por crecimiento del bundle o por contaminacion de imports.

## Que haria yo, en orden

### Fase 1: cerrar el build local

Objetivo:

- dejar funcionando de punta a punta `test:lambda`, `check:lambda` y `build:lambda`.

Sin eso, hablar de AWS es prematuro.

### Fase 2: definir estrategia de deploy

Mi recomendacion:

- Lambda empaquetada como zip,
- IaC minima en CDK o SAM,
- sin Docker para Lambda por ahora.

### Fase 3: automatizar

Armaria un pipeline con dos responsabilidades separadas:

1. job de validacion:
   - instala dependencias,
   - build del dominio,
   - test de lambda,
   - check de bundle,
   - build de lambda.
2. job de deploy:
   - toma el artefacto,
   - publica la lambda,
   - actualiza configuracion si aplica.

### Fase 4: endurecer operacion

Luego agregaria:

- variables de entorno,
- role e IAM,
- logs,
- trazabilidad de version,
- API Gateway o trigger real,
- manejo de errores operativo,
- tests un poco mas representativos.

## Recomendacion final

Mi recomendacion concreta para este repo es:

- no ir todavia por Docker para la Lambda,
- no dejar el build como paso humano permanente,
- cerrar primero la resolucion de `@sdr/domain`,
- y despues montar un deploy zip con IaC minima y pipeline separado.

En otras palabras:

1. primero arreglar el flujo local de build/test,
2. despues empaquetar,
3. despues desplegar,
4. y recien luego evaluar Docker si realmente hace falta.

Ese orden reduce riesgo y evita diseñar un pipeline sobre una base que hoy todavia no esta cerrando localmente.



 20/5

 Lo importante para mostrarle a tu jefe es esto: el Dockerfile ejemplo de Lambda sirve como referencia básica, pero en este repo sería demasiado bruto porque hace COPY . . y no separa servicio, lambda y dominio. En cambio, el Dockerfile actual de book-store está mejor parado por usar multi-stage, pero hoy sigue mezclando responsabilidades del monorepo: copia metadata de integration, corre el build root y termina con una frontera poco clara entre artefacto de servicio y artefacto de lambda.

La recomendación que dejé escrita es: Docker sólo para el servicio por ahora, pipeline separado para la lambda, y definir “sólo el dominio necesario” en dos niveles. En el corto plazo, que el servicio no conozca integration y que la lambda no arrastre nada de NestJS. En el mediano, si quieren precisión real, separar dominio en paquetes más chicos por bounded context, porque ese control no lo da Docker por sí solo.