# Analisis de Docker y Packaging de Servicio + Lambda - V1

## Objetivo

Este documento aterriza que le mostraria a direccion o liderazgo tecnico sobre el estado actual del packaging.

La pregunta de fondo no es solo si hay Docker o no, sino esta:

- como se construye el servicio,
- como se construye la Lambda,
- y como garantizar que cada artefacto incluya solo el codigo de dominio que realmente necesita.

## Punto de partida

Hoy en el repo hay dos runtime distintos:

- servicio HTTP en `packages/book-store`,
- Lambda en `packages/integration`.

Eso implica que no deberian compartir el mismo criterio de empaquetado.

## Comparacion entre el Dockerfile ejemplo y el repo actual

### Dockerfile ejemplo de Lambda

El ejemplo que pasaste:

- usa `public.ecr.aws/lambda/nodejs:20`,
- instala dependencias productivas,
- copia todo el repo,
- y define `CMD ["index.handler"]`.

Ese Dockerfile sirve como ejemplo basico de Lambda container image, pero tiene una caracteristica importante:

incluye mucho mas de lo necesario si se aplica tal cual a un monorepo.

Problemas de ese enfoque para este caso:

- hace `COPY . .`,
- no diferencia servicio de lambda,
- no controla contaminacion entre paquetes,
- no asegura que solo entre el dominio necesario,
- y no aprovecha el trabajo que ya hicieron con `esbuild` para la lambda.

### Dockerfile actual de `book-store`

El Dockerfile actual del servicio es mas serio que el ejemplo porque usa multi-stage:

- `deps`,
- `build`,
- `runner`.

Eso esta bien como base.

Pero hoy tiene varias decisiones que no son ideales para el objetivo que ustedes quieren mostrar.

## Hallazgos sobre el Dockerfile actual de `book-store`

### 1. El build del contenedor del servicio mezcla paquetes que no son del servicio

Hoy el Dockerfile copia:

- `packages/domain/package.json`
- `packages/book-store/package.json`
- `packages/integration/package.json`

Y luego ejecuta:

```bash
pnpm run build
```

Ese script root no buildéa solo el servicio. Tambien buildéa `integration`.

Conclusion:

el contenedor del servicio hoy arrastra conocimiento del paquete de Lambda, aunque el runtime final no la ejecute.

Eso no rompe necesariamente la app, pero conceptualmente esta mal alineado con el objetivo de aislar artefactos.

### 2. El Dockerfile del servicio instala dependencias del workspace completo

Como el install se hace a nivel root del monorepo, el contexto de dependencias queda mas amplio de lo necesario para construir solo `book-store`.

Esto impacta en:

- tiempo de build,
- cacheabilidad,
- claridad del proceso,
- y riesgo de que un cambio en `integration` afecte la build del servicio.

### 3. El runner del servicio copia todo `packages/domain/dist`

Hoy el runner hace esto:

```text
COPY --from=build /app/packages/book-store/dist ./packages/book-store/dist
COPY --from=build /app/packages/domain/dist ./packages/domain/dist
```

Esto significa que el artefacto final del servicio incluye todo el paquete compilado de dominio, no solamente lo usado por el flujo HTTP.

Con el dominio actual eso no es grave porque hoy el bounded context es chico.

Pero si `packages/domain` crece y acumula mas contextos, esa estrategia deja de escalar bien.

## Que significa realmente "solo el dominio necesario"

Hay dos niveles posibles de granularidad.

### Nivel 1: necesario por paquete

Ejemplo:

- el servicio incluye `@sdr/domain`,
- la lambda incluye `@sdr/domain`,
- pero no incluyen `book-store` entre si,
- ni tampoco `integration` dentro del servicio.

Este nivel es bastante razonable para una primera etapa.

### Nivel 2: necesario por modulo o bounded context

Ejemplo:

- el servicio incluye solo `book`,
- la lambda incluye solo `book`,
- y si mañana aparece `author`, `inventory` o `billing`, esos modulos no entran si no se usan.

Este nivel requiere una estrategia de empaquetado mas estricta.

## Mi lectura del estado actual

Hoy ustedes estan a mitad de camino:

- para la Lambda ya existe la intencion correcta de bundlear solo lo necesario con `esbuild`,
- para el servicio todavia se trabaja mas a nivel paquete compilado que a nivel bundle minimo,
- y el Dockerfile del servicio todavia no esta aislado de `integration`.

## Que revisaria del Dockerfile de `book-store`

Si la idea es presentarlo con criterio de arquitectura, yo marcaria esto:

### Lo bueno

- usa multi-stage,
- separa dependencias, build y runner,
- no corre el servicio desde fuentes TS,
- copia solo `dist` al runtime final.

### Lo flojo

- buildéa mas de lo que el servicio necesita,
- conoce el package de `integration`,
- instala workspace demasiado amplio,
- copia el dominio completo compilado,
- y no refleja una frontera nítida entre artefacto servicio y artefacto lambda.

## Que haria conceptualmente

## Servicio

Para el servicio, mi criterio seria:

- el Dockerfile del servicio debe construir solo `@sdr/library` y sus dependencias reales,
- no debe depender de `packages/integration`,
- no debe correr el script root `build` si ese script incluye paquetes ajenos al servicio.

En otras palabras:

- build del servicio por un lado,
- build de lambda por otro lado.

## Lambda

Para la Lambda, no reutilizaria el Dockerfile del servicio.

Tampoco intentaria forzar un Dockerfile tipo `COPY . .` como el ejemplo, salvo que decidan explicitamente ir por Lambda container image.

Mi criterio seria:

- si sigue siendo una Lambda Node chica, bundle con `esbuild` y deploy como zip,
- si en el futuro necesita image, hacer un Dockerfile propio de Lambda, no uno compartido con el servicio.

## Mi recomendacion concreta para mostrar

### Recomendacion 1

Separar completamente el pipeline del servicio del pipeline de Lambda.

El servicio no deberia:

- copiar metadata de `integration`,
- buildéar `integration`,
- ni depender de que la lambda compile.

### Recomendacion 2

Definir que "codigo necesario del dominio" hoy significa, como minimo:

- incluir solo el paquete `domain` compartido,
- excluir cualquier dependencia cruzada de infraestructura,
- y validar que Lambda no arrastre NestJS ni HTTP runtime.

### Recomendacion 3

Si quieren una definicion mas estricta de "solo lo necesario", entonces el paso siguiente no es Docker sino modularizar mejor el dominio.

Opciones:

- separar el dominio por bounded contexts en paquetes distintos,
- o bundlear tambien el servicio para eliminar codigo no referenciado.

## Cual de esas opciones veo mas realista

### Opcion A: separar dominio por paquetes

Ejemplo futuro:

- `@sdr/domain-book`
- `@sdr/domain-author`
- `@sdr/domain-inventory`

Ventajas:

- packaging claro,
- ownership claro,
- dependencias mas precisas,
- facil de razonar para servicio y lambda.

Desventaja:

- mas trabajo estructural.

### Opcion B: bundlear tambien el servicio

Esto podria reducir codigo final incluido, pero con NestJS no es la primera opcion que yo recomendaria para esta etapa.

Motivo:

- Nest tiene metadata, reflection y patrones de framework que vuelven mas delicado el bundling final que en una Lambda pequeña.

No es imposible, pero agrega complejidad antes de que el problema principal este estabilizado.

## Recomendacion final

Si tuviera que resumirlo para tu jefe, lo diria asi:

el repo ya tiene una buena direccion arquitectonica porque separa servicio, lambda y dominio compartido, pero el empaquetado todavia no expresa bien esa separacion.

Hoy el Dockerfile del servicio sigue demasiado acoplado al monorepo completo y la Lambda todavia no tiene un packaging/deploy operativo cerrado.

Lo que haria es:

1. aislar el build del servicio para que no conozca `integration`,
2. cerrar el build real de la lambda,
3. mantener la lambda como bundle minimo con `esbuild`,
4. usar Docker solo para el servicio por ahora,
5. y si quieren que cada runtime arrastre solo el dominio estrictamente necesario, avanzar luego hacia paquetes de dominio mas chicos.

## Mensaje ejecutivo

La conclusion ejecutiva seria:

- servicio y lambda no deberian compartir Dockerfile ni estrategia de empaquetado,
- el Dockerfile actual del servicio necesita enfocarse solo en `book-store`,
- la lambda deberia mantenerse como artefacto separado,
- y el verdadero control sobre "solo el dominio necesario" se logra mas por fronteras de paquetes y bundling que por Docker en si mismo.
