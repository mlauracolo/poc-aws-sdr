# Evolucion del Dominio si Aparecen Multiples Contextos - V1

## Objetivo

Dejar por escrito como deberia evolucionar la estructura de dominio si el sistema crece mas alla de `book` y empiezan a aparecer otros contextos como:

- `library`
- `author`
- `genre`
- o cualquier otro subdominio relacionado

La pregunta de fondo no es solo como crear mas lambdas, sino como evitar que el paquete compartido de dominio se convierta en una bolsa demasiado grande.

## Situacion actual

Hoy el repo tiene:

- `packages/domain`
- `packages/book-store`
- `packages/integration`

Y dentro de `packages/domain` hoy existe el contexto `book`.

Eso hoy esta bien.

Para una POC o una primera version, tener un solo paquete `@sdr/domain` es razonable porque:

- reduce complejidad,
- facilita imports,
- mantiene el foco,
- y permite validar rapido el sharing entre backend y lambda.

## Cuando sigue siendo valido un unico `packages/domain`

Yo sostendria un solo paquete mientras:

- los contextos nuevos sean pocos,
- el dominio siga siendo chico,
- el ownership siga claro,
- los imports entre contextos no se empiecen a mezclar demasiado,
- y el costo de separar paquetes sea mayor al beneficio.

En ese escenario, la estructura podria crecer asi:

```text
packages/domain/src/
  book/
  library/
  author/
  genre/
  index.ts
```

Eso es una evolucion normal y sana para una etapa temprana.

## Como deberia crecer en esa etapa

Si agregan nuevos contextos, yo haria esto:

- una carpeta por contexto de negocio,
- exports ordenados por contexto,
- cero mezcla de infraestructura,
- y mucho cuidado con imports cruzados.

Ejemplo:

```text
packages/domain/src/
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
  genre/
    genre.ts
```

## Regla importante

Aunque todo siga dentro de `@sdr/domain`, no deberian tratarlo como un paquete amorfo.

Cada contexto deberia mantenerse internamente independiente.

Eso significa:

- `book` no deberia importar arbitrariamente desde `author`,
- `library` no deberia depender de implementaciones de `book`,
- y las relaciones entre contextos deberian modelarse con cuidado, no por conveniencia de carpeta.

## Señales de que el paquete unico empieza a quedar chico

Yo tomaría estas señales como alerta:

- `packages/domain/src/index.ts` empieza a exportar demasiadas cosas,
- las lambdas usan un porcentaje chico del paquete pero dependen del paquete completo,
- se vuelve dificil saber quien es dueño de cada parte,
- aparecen imports cruzados entre contextos sin una razon fuerte,
- cambios en `author` rompen cosas de `book`,
- o el equipo empieza a discutir mucho “donde va esto”.

Cuando esas señales aparecen, el problema ya no es de Lambda ni de Docker. Es de frontera de dominio.

## La mejor evolucion posible

Si el sistema realmente crece, mi recomendacion es separar el dominio por contexto en paquetes distintos.

Ejemplo:

```text
packages/domain-book
packages/domain-library
packages/domain-author
packages/domain-genre
packages/book-store
packages/integration
```

Y usar nombres de paquete explicitos:

- `@sdr/domain-book`
- `@sdr/domain-library`
- `@sdr/domain-author`
- `@sdr/domain-genre`

## Por que esa opcion escala mejor

Porque mejora al mismo tiempo:

- claridad de ownership,
- aislamiento entre contextos,
- precisión de dependencias,
- y control sobre que entra en cada runtime.

Ejemplos:

- una Lambda de `sync-authors` depende de `@sdr/domain-author`,
- una Lambda de `delete-book` depende de `@sdr/domain-book`,
- una operación de `assign-book-to-library` puede depender de `@sdr/domain-book` y `@sdr/domain-library`,
- pero no de `genre` si no lo necesita.

Eso es mucho mas claro que hacer depender todo de un `@sdr/domain` cada vez mas ancho.

## Que gana el backend con eso

El backend `book-store` tambien gana con esta separacion.

Porque en vez de depender de un dominio monolitico, puede consumir exactamente los contextos que usa.

Eso mejora:

- legibilidad del package,
- mantenibilidad,
- y control de cambios.

## Relacion con las lambdas

Esto impacta directamente en la estrategia de lambdas.

La regla seria:

- la Lambda se crea por caso de uso o integracion,
- el dominio se consume por contexto.

Ejemplos:

- `create-book` usa `domain-book`
- `delete-book` usa `domain-book`
- `sync-authors` usa `domain-author`
- `import-library-catalog` usa `domain-library`
- `assign-book-to-library` usa `domain-book` y `domain-library`

Eso evita dos errores comunes:

- hacer una Lambda por entidad sin criterio operativo,
- o hacer un dominio unico gigante para todo.

## Lo que no haria

No haria una separacion temprana extrema si todavia no existe el problema real.

Si hoy solo tienen `book`, partir ya en cuatro paquetes vacios seria sobreingenieria.

Primero dejaria crecer el dominio dentro de `packages/domain`, pero con fronteras internas prolijas.

## Lo que si haria desde ahora

Aunque hoy no partan el paquete, si empezaria a trabajar con esa disciplina mental:

- pensar en contextos,
- evitar imports cruzados innecesarios,
- mantener carpetas bien separadas,
- y no exportar todo indiscriminadamente desde `index.ts`.

Eso deja el camino listo para partir paquetes despues sin dolor excesivo.

## Criterio practico de evolucion

Mi recomendacion seria esta:

### Etapa 1

Mientras haya uno o pocos contextos:

- mantener `packages/domain`
- separar por carpetas internas
- mantener imports limpios

### Etapa 2

Cuando ya existan varios contextos reales:

- revisar dependencias cruzadas
- revisar exports del paquete
- revisar ownership
- revisar si distintas lambdas usan subconjuntos claramente distintos

### Etapa 3

Cuando el paquete unico ya queda ancho:

- partir `domain` por contexto
- mover cada contexto a su propio package
- ajustar imports del backend y de `integration`

## Mensaje ejecutivo

Si hubiera que resumirlo para tu jefe:

el paquete `domain` unico sirve muy bien al principio, pero no deberia asumirse como frontera definitiva si el negocio empieza a sumar otros contextos como `library`, `author` o `genre`.

La forma sana de crecer es:

- primero ordenar el dominio por contextos internos,
- despues crear lambdas por caso de uso,
- y cuando el sistema lo pida, separar esos contextos en paquetes de dominio mas chicos.

## Conclusión

La mejor alternativa no es anticipar decenas de paquetes desde hoy, pero tampoco dejar que `@sdr/domain` crezca sin control.

El equilibrio correcto me parece este:

- hoy un solo paquete de dominio esta bien,
- mañana varios contextos internos tambien,
- y cuando esos contextos tomen entidad real, dividirlos en paquetes propios.

Eso les da una evolucion natural, coherente con la arquitectura actual y compatible tanto con backend como con lambdas.
