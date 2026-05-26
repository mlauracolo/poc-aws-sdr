# Estrategia de cursor e ingesta incremental para sync-boundary

## Contexto

El Lambda `sync-boundary` lee datos desde una base Oracle de origen y los escribe
en una base Oracle de destino. Las tablas de origen tienen dos comportamientos
distintos que condicionan cómo se filtra y deduplica la data:

| Tabla              | PK                        | ¿Tiene snapshots? |
|--------------------|---------------------------|-------------------|
| SDR_INT_NEXUS_A    | (NRO_ANOMALIA, FEC_PROC)  | Sí                |
| SDR_INT_NEXUS_D    | (DOC_ID, FEC_PROC)        | Sí                |
| TCV_AVISO          | AVISO_NRO                 | No (aún)          |
| TCV_ORDEN          | ORDEN_NRO                 | No (aún)          |
| SDR_INT_EXACTIAN   | Sin PK definida           | No                |

**Tablas con snapshots**: cada vez que un registro cambia, el sistema origen
inserta una nueva fila con la misma clave de negocio pero un `FEC_PROC` mayor.
No hay UPDATE, solo INSERT. El destino debe recibir únicamente el estado más
reciente de cada registro dentro del rango analizado.

---

## Problema 1 — Deduplicación de snapshots

### Solución implementada

Para `SDR_INT_NEXUS_A` y `SDR_INT_NEXUS_D` se usa una subquery Oracle que
selecciona, por cada clave de negocio, solo el snapshot con el mayor `FEC_PROC`
dentro del rango `[startDate, endDate]`.

```sql
-- Ejemplo para SDR_INT_NEXUS_A
SELECT t.*
FROM INTSDR.SDR_INT_NEXUS_A t
WHERE (t.NRO_ANOMALIA, t.FEC_PROC) IN (
  SELECT sub.NRO_ANOMALIA, MAX(sub.FEC_PROC)
  FROM INTSDR.SDR_INT_NEXUS_A sub
  WHERE sub.FEC_PROC BETWEEN :start AND :end
  GROUP BY sub.NRO_ANOMALIA
)
ORDER BY t.NRO_ANOMALIA
```

**Por qué funciona**: Oracle soporta tuple IN `(col1, col2) IN (SELECT ...)`,
lo que permite comparar el par `(clave, fecha)` en una sola pasada sin joins
adicionales.

### Alternativa: self-JOIN

```sql
SELECT t.*
FROM INTSDR.SDR_INT_NEXUS_A t
JOIN (
  SELECT NRO_ANOMALIA, MAX(FEC_PROC) AS max_fec
  FROM INTSDR.SDR_INT_NEXUS_A
  WHERE FEC_PROC BETWEEN :start AND :end
  GROUP BY NRO_ANOMALIA
) latest ON t.NRO_ANOMALIA = latest.NRO_ANOMALIA
       AND t.FEC_PROC = latest.max_fec
```

Mismo resultado, pero más verboso. El tuple IN es preferible en Oracle porque
el optimizador lo trata igual que un JOIN y es más directo de expresar en TypeORM.

### Alternativa: ROW_NUMBER() / analítica

```sql
SELECT * FROM (
  SELECT t.*, ROW_NUMBER() OVER (
    PARTITION BY t.NRO_ANOMALIA
    ORDER BY t.FEC_PROC DESC
  ) AS rn
  FROM INTSDR.SDR_INT_NEXUS_A t
  WHERE t.FEC_PROC BETWEEN :start AND :end
)
WHERE rn = 1
```

Más flexible (permite `ORDER BY` por múltiples columnas), pero menos eficiente
en tablas grandes porque obliga a leer todas las filas del rango antes de filtrar.
Útil si en el futuro hay que desempatar por otro criterio además de `FEC_PROC`.

---

## Problema 2 — Procesamiento incremental (cursor)

### Por qué hace falta

Si el Lambda siempre procesa "ayer → ayer" pierde la capacidad de recuperarse
ante fallas o reintentos. Con un cursor se puede responder a la pregunta:
*"¿desde qué fecha tengo que seguir procesando?"*

### Solución actual (POC) — variable de entorno `CURSOR_DATE`

```
CURSOR_DATE=202605261400   →  startDate del próximo run
```

El handler calcula:

```
startDate = process.env.CURSOR_DATE ?? '200001010000'
endDate   = ahora (UTC, con hora y minutos)
```

Formato del cursor: **`YYYYMMDDHHMM`** (12 caracteres). Esto permite ejecutar
el Lambda varias veces por día sin reprocesar el mismo rango:

| Run | CURSOR_DATE (startDate) | endDate (ahora) | Rango procesado |
|-----|-------------------------|-----------------|-----------------|
| 1 — 14:00 | `200001010000` | `202605261400` | todo hasta 14:00 |
| 2 — 14:30 | `202605261400` | `202605261430` | solo 14:00–14:30 |
| 3 — 15:00 | `202605261430` | `202605261500` | solo 14:30–15:00 |

Al finalizar exitosamente loguea:

```
[CURSOR] Sync completado. Próximo CURSOR_DATE=202605261430
```

El operador actualiza manualmente `CURSOR_DATE` en la configuración del Lambda
al valor indicado en el log.

**Ventajas**: cero infraestructura adicional, fácil de entender y de corregir
manualmente. Soporta runs intra-día sin duplicados.

**Desventajas**: requiere intervención humana para avanzar el cursor. Si el
operador lo olvida, el próximo run reprocesará todo el rango desde el cursor
anterior (idempotente, pero ineficiente).

---

### Alternativa 1 — SSM Parameter Store (recomendada para producción)

AWS Systems Manager Parameter Store es un almacén de clave/valor administrado,
integrado con IAM.

```
/sync-boundary/cursor   →   "202605261430"
```

**Flujo**:

```
1. Lambda arranca
2. Lee /sync-boundary/cursor via AWS SDK (GetParameter)
3. startDate = valor leído (o '200001010000' si no existe)
4. endDate = ahora (UTC, con hora y minutos)
5. Procesa
6. Si todo ok → PutParameter con endDate
```

**Ventajas**:
- El cursor avanza automáticamente sin intervención humana.
- El valor es auditable (historial de versiones en SSM).
- Se puede encriptar con KMS si hace falta.
- Fácil rollback: se edita el parámetro manualmente en la consola.

**Desventajas**:
- Requiere `@aws-sdk/client-ssm` como dependencia (no instalado en el POC).
- Requiere permiso IAM `ssm:GetParameter` + `ssm:PutParameter` en el rol del Lambda.
- Agrega ~200 ms de latencia por las dos llamadas a SSM (mitigable con caché local).

**Snippet de migración** (cuando se decida implementar):

```typescript
import { SSMClient, GetParameterCommand, PutParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});
const PARAM = '/sync-boundary/cursor';

async function readCursor(): Promise<string> {
  try {
    const res = await ssm.send(new GetParameterCommand({ Name: PARAM }));
    return res.Parameter?.Value ?? '200001010000';
  } catch {
    return '200001010000';
  }
}

async function writeCursor(timestamp: string): Promise<void> {
  await ssm.send(new PutParameterCommand({
    Name: PARAM,
    Value: timestamp,
    Type: 'String',
    Overwrite: true,
  }));
}
```

---

### Alternativa 2 — DynamoDB tabla de estado

Una tabla `sync-boundary-state` con un ítem por cada "stream" (uno por tabla
origen o uno global).

```json
{ "streamId": "global", "cursorTimestamp": "202605261430", "updatedAt": "2026-05-26T14:30:00Z" }
```

**Cuándo tiene sentido**: si ya se usa DynamoDB en el proyecto o si se necesita
almacenar estado por tabla (cursores independientes por `SDR_INT_NEXUS_A`,
`TCV_AVISO`, etc.) para poder reprocesar una tabla sin afectar las demás.

**Desventajas**: más infraestructura que SSM para este caso de uso simple.

---

### Alternativa 3 — EventBridge Scheduler con payload

En lugar de guardar el cursor en un almacén externo, la regla de EventBridge
que dispara el Lambda puede incluir el `startDate` y `endDate` en el payload
del evento.

```json
{ "startDate": "202605261400", "endDate": "202605261430" }
```

El Lambda ya acepta este formato (`SyncBoundaryEvent`). El scheduler se
actualiza mediante la API de EventBridge después de cada run exitoso.

**Ventajas**: el cursor vive junto a la programación, no hay almacén extra.

**Desventajas**: requiere permiso `scheduler:UpdateSchedule` desde dentro del
Lambda, lo que le da al Lambda poder de modificar su propia ejecución (acoplamiento).

---

## Cuadro comparativo

| Opción                  | Automatismo | Complejidad | Infraestructura extra | Rollback manual |
|-------------------------|-------------|-------------|-----------------------|-----------------|
| Env var (actual POC)    | Manual      | Mínima      | Ninguna               | Fácil           |
| SSM Parameter Store     | Automático  | Baja        | SSM (managed)         | Fácil           |
| DynamoDB                | Automático  | Media       | Tabla DynamoDB        | Fácil           |
| EventBridge Scheduler   | Automático  | Media       | Permiso IAM extra     | Medio           |

**Recomendación**: usar la env var para el POC y migrar a SSM cuando el Lambda
pase a producción. El cambio es localizado en `buildDefaultRange()` y no afecta
ninguna otra parte del código.

---

## Granularidad del cursor y compatibilidad por tabla

El cursor usa formato **`YYYYMMDDHHMM`** (12 chars) para soportar múltiples
runs por día. El comportamiento varía según la columna de filtro de cada tabla:

| Tabla | Columna filtro | Tipo Oracle | Acepta timestamp | Comportamiento |
|---|---|---|---|---|
| SDR_INT_NEXUS_A / D | FEC_PROC | VARCHAR2(15) | Solo si almacena hora | Ver nota abajo |
| TCV_AVISO | FEC_CREACION | DATE | Sí | Filtra con precisión de minutos |
| TCV_ORDEN | FEC_ULT_ACT | DATE | Sí | Filtra con precisión de minutos |

**TCV_AVISO y TCV_ORDEN**: usan columnas Oracle `DATE` (que almacena fecha y
hora), así que el timestamp se traduce directamente a un `Date` con hora y
minutos y el `BETWEEN` funciona con precisión de minutos.

**SDR_INT_NEXUS_A / D**: el `BETWEEN` sobre `FEC_PROC` es una comparación de
strings lexicográfica. Si `FEC_PROC` almacena solo la fecha (`'20260526'`,
8 chars), el cursor `'202605261400'` sigue funcionando porque
`'20260526' < '202605261400'` es verdadero lexicográficamente. Sin embargo,
dos runs el mismo día incluirán los mismos registros (los del día completo),
porque `FEC_PROC` no tiene hora. En la práctica esto es aceptable para tablas
de snapshot si el proceso es diario; si los snapshots se insertan con hora,
el cursor de 12 chars los discrimina correctamente.

## Consideración sobre el formato de `FEC_PROC`

`FEC_PROC` es `VARCHAR2(15)` en Oracle. El cursor solo funciona correctamente
con `BETWEEN` si el formato almacenado es año-primero, por ejemplo `'YYYYMMDD'`
o `'YYYYMMDD HH24:MI'`.

Si el formato tiene el día primero (`'DD/MM/YYYY'`) la comparación lexicográfica
es incorrecta. Antes de llevar a producción, verificar en DBGate:

```sql
SELECT DISTINCT SUBSTR(FEC_PROC, 1, 4), COUNT(*)
FROM INTSDR.SDR_INT_NEXUS_A
GROUP BY SUBSTR(FEC_PROC, 1, 4)
ORDER BY 1;
```

Si los valores del primer grupo son años (`2024`, `2025`, …) el formato es
año-primero y el cursor funciona sin cambios.
