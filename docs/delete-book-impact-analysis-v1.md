# Analisis de Impacto: Lambda `delete-book` - V1

## Objetivo

Evaluar que implicaria agregar una nueva Lambda `delete-book` usando la estructura actual del repo.

La idea no es implementarla todavia, sino usarla como caso de prueba para entender:

- si la estructura actual escala,
- que cambios conceptuales harian falta,
- que revelaria sobre build y deploy,
- y que limitaciones tiene hoy la POC.

## Respuesta corta

Si, se puede agregar una Lambda `delete-book` con la distribucion actual.

Pero a diferencia de `migrate-books`, esa Lambda ya no se queda solo en una demostracion de bundle y separacion de runtimes.

`delete-book` empuja al repo a resolver una capa mas real de aplicacion e infraestructura porque necesita:

- identificar un libro existente,
- cargar su estado,
- ejecutar una accion de dominio,
- y persistir el cambio.

## Donde viviria

La ubicaria en:

```text
packages/integration/src/lambda-modules/delete-book/
  delete-book.handler.ts
  delete-book.repository.ts
```

Y la agregaria al registro central de `packages/integration/scripts/build-lambda.ts`.

## Por que `delete-book` es un buen caso de prueba

Porque obliga a responder preguntas que `migrate-books` todavia evita.

La lambda actual:

- recibe payload,
- crea una entidad,
- la guarda via repositorio dummy,
- y devuelve respuesta.

En cambio `delete-book` requiere un flujo mas completo:

1. recibir `bookId`,
2. buscar el libro,
3. reconstituir la entidad,
4. ejecutar `markAsDeleted()`,
5. persistir el estado actualizado,
6. devolver resultado coherente.

Eso ya prueba mas que el bundling. Prueba tambien la forma real en que una Lambda interactuaria con el dominio.

## Que ya existe en el dominio

El dominio ya tiene soporte util para este caso.

En [packages/domain/src/book/book.ts](/c:/Users/Laura%20Colo/Desktop/poc-sdr-aws/poc-aws-sdr/packages/domain/src/book/book.ts:1) existe:

- `Book.markAsDeleted()`
- `Book.reconstitute(...)`
- `Book.toSnapshot()`
- `BookDeletionError`

Eso significa que la regla de negocio central no tendria que vivir en la Lambda.

La Lambda solo deberia:

- traducir entrada,
- cargar estado,
- invocar dominio,
- persistir.

Ese es exactamente el tipo de separacion que ustedes quieren validar.

## Flujo esperado de `delete-book`

El flujo conceptual seria:

```text
APIGatewayProxyEventV2
  -> delete-book.handler.ts
  -> repository.findById(bookId)
  -> Book.reconstitute(...)
  -> book.markAsDeleted()
  -> repository.save(book)
  -> response HTTP/AWS
```

## Diferencia importante con `migrate-books`

`migrate-books` usa el dominio de forma mas directa y liviana:

- crea entidad,
- no necesita leer estado previo,
- el repositorio actual solo simula persistencia.

`delete-book` cambia eso.

Para borrar logicamente un libro, la lambda necesita estado previo. Entonces la infraestructura ya no puede ser solo un `console.log`.

## Implicancia arquitectonica principal

Agregar `delete-book` validaria mejor la arquitectura, pero tambien mostraria que la POC ya necesita decidir como modela acceso a datos para lambdas.

Hoy el adapter actual:

- no busca entidades,
- no persiste cambios reales,
- no modela fallos de lectura/escritura,
- no representa latencia ni integracion AWS.

Con `delete-book`, esas omisiones quedan mucho mas visibles.

## Que habria que definir conceptualmente

Para `delete-book`, yo esperaria al menos estas decisiones:

### 1. Como se obtiene el libro

Opciones:

- repositorio fake en memoria para seguir en POC,
- adaptador real contra DynamoDB,
- adaptador temporal contra otro storage.

### 2. Como se persiste el borrado

No alcanza con “guardar un snapshot” en log. Haria falta al menos una simulacion mas real de update.

### 3. Que contrato de entrada tiene la Lambda

Ejemplo:

- `pathParameters.id`
- o `body.id`
- o evento asincrono con `bookId`

Esta decision afecta mucho la forma del handler.

### 4. Que devuelve si no encuentra el libro

Habría que decidir respuestas como:

- `404` si no existe,
- `409` si ya estaba eliminado,
- `400` si el input es invalido.

## Que revelaria sobre `packages/integration`

Agregar `delete-book` seria una buena prueba para confirmar si `packages/integration` realmente esta funcionando como capa de adapters AWS y no como codigo procedural suelto.

Si la implementacion queda ordenada, demostraría que:

- cada Lambda puede tener su carpeta,
- cada Lambda puede tener su propio repository/adapter,
- y el dominio sigue siendo el centro de la logica.

Si en cambio empieza a requerir imports cruzados raros o logica duplicada, eso revelaria que la estructura necesita ajustarse.

## Implicancia sobre build

`delete-book` consolidaria la necesidad de build por Lambda.

Ejemplo esperado en `build-lambda.ts`:

```ts
const lambdas = {
  "migrate-books": "src/lambda-modules/migrate-books/migrate-books.handler.ts",
  "delete-book": "src/lambda-modules/delete-book/delete-book.handler.ts",
} as const;
```

Con eso se podria correr:

```bash
pnpm run build:lambda delete-book
pnpm run check:lambda delete-book
```

O todo junto:

```bash
pnpm run build:lambda:all
```

Esto refuerza la idea correcta:

- un artefacto por Lambda,
- no un bundle global de integraciones.

## Implicancia sobre deploy

`delete-book` mostraria por que el deploy debe ser independiente por handler.

Porque en la practica:

- `migrate-books` y `delete-book` no necesariamente comparten trigger,
- no necesariamente comparten permisos,
- no necesariamente comparten frecuencia de cambios,
- y no necesariamente comparten rollback.

Entonces, aunque ambas vivan en `packages/integration`, deberian desplegarse como recursos AWS distintos.

## Implicancia sobre Docker

Este caso tambien sirve para reforzar que Docker no resuelve el problema principal.

`delete-book` no necesita un Dockerfile comun con el servicio.

Lo que necesita es:

- packaging independiente,
- build reproducible,
- y una historia clara de deploy.

Si algun dia usan Lambda container image, deberia ser un Dockerfile propio de Lambda, no una extension del Dockerfile de `book-store`.

## Que mostraria bien en una demo tecnica

Si quisieran mostrarle esto a tu jefe, `delete-book` seria un buen ejemplo porque evidencia el valor de la separacion actual:

- dominio reutilizable,
- handlers Lambda desacoplados de Nest,
- crecimiento por casos de uso,
- y despliegue potencialmente independiente.

Pero tambien mostraría honestamente el siguiente gap:

- la POC ya necesita una estrategia mas clara de repositorio/adaptador para casos que leen y actualizan estado.

## Recomendacion

Mi recomendacion es usar `delete-book` como siguiente caso de prueba, porque obliga a validar una version mas creible de la arquitectura.

No porque sea el unico caso posible, sino porque pone presion en los lugares correctos:

- resolucion de dominio compartido,
- estructura de handlers,
- adapters por Lambda,
- build por artefacto,
- y deploy por recurso.

## Conclusion

`delete-book` si entra bien en la estructura actual, y justamente por eso es un buen siguiente paso.

No seria una lambda mas “igual a la actual”, sino una que ayudaría a responder si la arquitectura realmente soporta crecer en serio.

La principal implicancia es esta:

para agregarla no alcanza con copiar el handler actual. Habria que empezar a modelar mejor lectura, reconstitucion y persistencia, que es donde la POC pasa de prueba estructural a prueba de aplicacion real.
