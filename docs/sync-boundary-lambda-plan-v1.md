# Plan de Implementacion: Lambda sync-boundary - V1

## Objetivo

Implementar la Lambda `sync-boundary` que lee las tablas frontera del schema `INTSDR`
(origen, escritas por los sistemas SAP/Nexus) y vuelca su contenido en las tablas propias
del SDR (destino, leidas por el backend NestJS).

La Lambda actua como pasarela de datos entre dos DataSources Oracle distintos.
No tiene logica de negocio propia: lee, mapea al dominio, y persiste en destino.

---

## Flujo general

```text
INTSDR (Oracle origen)
  INTSDR.SDR_INT_NEXUS_A
  INTSDR.SDR_INT_NEXUS_D
  INTSDR.TCV_AVISO
  INTSDR.TCV_ORDEN
  INTSDR.TCV_ORDEN_MT
        |
        v
  Lambda sync-boundary
  (packages/integration)
        |
        +-- lee con OriginRepository
        +-- mapea entidad TypeORM -> dominio (@sdr/domain)
        +-- mapea dominio -> entidad TypeORM destino
        +-- persiste con DestinationRepository
        |
        v
SDR (Oracle destino)
  SDR_INT_NEXUS_A
  SDR_INT_NEXUS_D
  TCV_AVISO_BT  (*)
  TCV_AVISO_MT  (*)
  TCV_ORDEN_BT
  TCV_ORDEN_MT
```

> (*) La regla para separar `TCV_AVISO` origen en `TCV_AVISO_BT` / `TCV_AVISO_MT` destino
> esta pendiente de definicion funcional. Ver seccion "Pendientes funcionales".

---

## Sincronizaciones

### 1. SDR_INT_NEXUS_A

| Origen (`INTSDR.SDR_INT_NEXUS_A`) | Dominio (`SdrIntNexusA`) | Destino (`SDR_INT_NEXUS_A`) |
|---|---|---|
| `NRO_ANOMALIA` (number, PK) | `_anomalyNumber` | `NRO_ANOMALIA` (number, PK) |
| `FEC_PROC` (varchar2 15, PK) | `_processDate` | `FEC_PROC` (char 15, PK) |
| `DOC_ID` (number) | `_docId` | `DOC_ID` (number) |
| `AVISO_OT` (number) | `_otNotice` | `AVISO_OT` (number) |
| `STATE_ID` (number) | `_stateId` | `STATE_ID` (number) |
| `DESCR_ESTADO` (varchar2 50) | `_stateDescription` | `DESCR_ESTADO` (varchar2 50) |
| `FECHA_DETECCION` (date) | `_detectionDate` (DateTime) | `FECHA_DETECCION` (date) |
| `INSTALACION` (varchar2 50) | `_installation` | `INSTALACION` (varchar2 50) |
| — | — | `DEVICE_ID` (number) → `null` (sin campo en origen/dominio) |
| `OBS_ANOMALIA` (varchar2 2000) | `_anomalyObservation` | `OBS_ANOMALIA` (varchar2 2000) |
| `AREA_OP` (varchar2 50) | `_areaOp` | `AREA_OP` (varchar2 50) |
| `PARTIDO` (varchar2 50) | `_county` | `PARTIDO` (varchar2 50) |
| `LOCALIDAD` (varchar2 50) | `_locality` | `LOCALIDAD` (varchar2 50) |

---

### 2. SDR_INT_NEXUS_D

| Origen (`INTSDR.SDR_INT_NEXUS_D`) | Dominio (`SdrIntNexusD`) | Destino (`SDR_INT_NEXUS_D`) |
|---|---|---|
| `DOC_ID` (number, PK) | `_docId` | `DOC_ID` (number, PK) |
| `FEC_PROC` (varchar2 15, PK) | `_processDate` | `FEC_PROC` (char 15, PK) |
| `NRO_DOCUMENTO` (varchar2 50) | `_documentNumber` | `NRO_DOCUMENTO` (varchar2 50) |
| — | — | `TYPE_ID` (number) → `null` (sin campo en origen/dominio) |
| `TIPO` (char 2) | `_type` | `TIPO` (char 2) |
| `LAST_STATE_ID` (number) | `_lastStateId` | `LAST_STATE_ID` (number) |
| — | — | `DESCR_ESTADO` (varchar2 50) → `null` |
| `COND_CLIMATICA` (varchar2 50) | `_weatherCondition` | `COND_CLIMATICA` (varchar2 50) |
| `INICIO_CORTE` (date) | `_startCut` (DateTime) | `INICIO_CORTE` (date) |
| `AFECTADOS_INI` (number) | `_affectedInitial` | `AFECTADOS_INI` (number) |
| `AFECTADOS_AHORA` (number) | `_affectedNow` | `AFECTADOS_AHORA` (number) |
| — | — | `CANT_RECLAMOS_TOT` (number) → `null` |
| `JERARQ_ELECTR` (varchar2 255) | `_electricalHierarchy` | `JERARQ_ELECTR` (varchar2 255) |
| `ALIM` (varchar2 255) | `_supply` | `ALIM` (varchar2 255) |
| `SSEE` (varchar2 255) | `_ssee` | `SSEE` (varchar2 255) |
| `CONFIRMAR_FALLA` (varchar2 50) | `_confirmFailure` | `CONFIRMAR_FALLA` (varchar2 50) |
| `AFECTA_SUMINISTRO` (char 2) | `_affectsSupply` | `AFECTA_SUMINISTRO` (char 2) |
| `AREA_OP` (varchar2 50) | `_areaOp` | `AREA_OP` (varchar2 50) |
| `PARTIDO` (varchar2 50) | `_county` | `PARTIDO` (varchar2 50) |
| `LOCALIDAD` (varchar2 50) | `_locality` | `LOCALIDAD` (varchar2 50) |
| — | — | `DOM_A` (char 1) → `null` |

---

### 3. TCV_AVISO → TCV_AVISO_BT / TCV_AVISO_MT

> **Pendiente funcional**: el origen tiene una sola tabla `INTSDR.TCV_AVISO`.
> El destino tiene dos tablas separadas: `TCV_AVISO_BT` y `TCV_AVISO_MT`.
> La regla de split (por ejemplo, por el campo `BEGRU`) aun no esta definida.
> Hasta que se defina, la Lambda escribe todo en `TCV_AVISO_BT` como placeholder.

| Origen (`INTSDR.TCV_AVISO`) | Dominio (`TcvAviso`) | Destino (`TCV_AVISO_BT` / `TCV_AVISO_MT`) |
|---|---|---|
| `AVISO_NRO` (varchar2 12, PK) | `_noticeNumber` | `AVISO_NRO` (varchar2 12, PK) |
| `AVISO_CLASE` (varchar2 2) | `_noticeClass` | `AVISO_CLASE` (varchar2 2) |
| `AVISO_TXT` (varchar2 40) | `_textNotice` | `AVISO_TXT` (varchar2 40) |
| `PRIORIDAD` (varchar2 1) | `_priority` | `PRIORIDAD` (varchar2 1) |
| `FEC_CREACION` (date) | `_createdAt` (DateTime) | `FEC_CREACION` (date) |
| `ORDEN_NRO` (varchar2 12) | `_orderNumber` | `ORDEN_NRO` (varchar2 12) |
| `TPLNR` (varchar2 30) | `_tplnr` | `TPLNR` (varchar2 30) |
| `EMPLAZAMIENTO` (varchar2 10) | `_site` | `EMPLAZAMIENTO` (varchar2 10) |
| `AREA` (varchar2 3) | `_area` | `AREA` (varchar2 3) |
| `DIVISION` (varchar2 4) | `_division` | `DIVISION` (varchar2 4) |
| `ADRNR` (varchar2 10) | `_addressNumber` | `ADRNR` (varchar2 10) |
| `FECHA` (date) | `_eventDate` (DateTime) | `FECHA` (date) |
| `FEC_ULT_SAP` (date) | `_lastSapDate` (DateTime) | `FEC_ULT_SAP` (date) |
| `CERRADO` (varchar2 2) | `_closed` | `CERRADO` (varchar2 2) |
| `VISIBLE` (varchar2 1) | `_visible` | `VISIBLE` (varchar2 1) |
| `BEGRU` (varchar2 2) | `_begru` | — (usado para el split BT/MT, no persiste directamente) |

---

### 4. TCV_ORDEN → TCV_ORDEN_BT

| Origen (`INTSDR.TCV_ORDEN`) | Dominio (`TcvOrder`) | Destino (`TCV_ORDEN_BT`) |
|---|---|---|
| `ORDEN_NRO` (varchar2 12, PK) | `_orderNumber` | `ORDEN_NRO` (varchar2 12, PK) |
| `ORDEN_CLASE` (varchar2 24) | `_classOrder` | `ORDEN_CLASE` (varchar2 4) |
| `ORDEN_TXT` (varchar2 40) | `_textOrder` | `ORDEN_TXT` (varchar2 40) |
| `FEC_CREACION` (date) | `_createdAt` (DateTime) | `FEC_CREACION` (date) |
| `FEC_ULT_ACT` (date) | `_lastUpdatedDate` (DateTime) | `FEC_ULT_ACT` (date) |
| `EMPLAZAMIENTO` (varchar2 10) | `_site` | `EMPLAZAMIENTO` (varchar2 10) |
| `DIVISION` (varchar2 4) | `_division` | `DIVISION` (varchar2 4) |
| `C_COSTO` (varchar2 10) | `_costCenter` | `C_COSTO` (varchar2 10) |
| `PUESTO` (varchar2 8) | `_position` | `PUESTO` (varchar2 8) |
| `FECHA` (date) | `_eventDate` (DateTime) | `FECHA` (date) |
| `ESTADO` (varchar2 18) | `_status` | `ESTADO` (varchar2 18) |
| `HR_TEXT` (varchar2 50) | `_hrText` | `HR_TEXT` (varchar2 40) |
| `ORDEN_PADRE` (varchar2 12) | `_parentOrder` | `ORDEN_PADRE` (varchar2 12) |
| `STATUS` (varchar2 4) | `_statusCode` | `STATUS` (varchar2 4) |
| `AVISO_NRO` (varchar2 12) | `_noticeNumber` | `AVISO_NRO` (varchar2 12) |
| `ORDEN_SUP` (varchar2 12) | `_supOrder` | `ORDEN_SUP` (varchar2 12) |
| `VISIBLE` (varchar2 1) | `_visible` | `VISIBLE` (varchar2 1) |
| `TPLNR` (varchar2 30) | `_tplnr` | `TPLNR` (varchar2 30) |
| `PRIORIDAD` (varchar2 10) | `_priority` | `PRIORIDAD` (varchar2 10) |
| `AREA_AVISO` (varchar2 3) | `_noticeArea` | `AREA_AVISO` (varchar2 3) |
| `DIV_AVISO` (varchar2 4) | `_noticeDivision` | `DIV_AVISO` (varchar2 4) |
| `PARTIDO` (varchar2 50) | `_county` | `PARTIDO` (varchar2 50) |
| `LOCALIDAD` (varchar2 50) | `_locality` | `LOCALIDAD` (varchar2 50) |
| `FEC_AVISO` (date) | `_noticeDate` (DateTime) | `FEC_AVISO` (date) |
| `PRIOR_AVISO` (varchar2 10) | `_noticePriority` | `PRIOR_AVISO` (varchar2 10) |
| `BEGRU` (varchar2 2) | `_begru` | — (no persiste en destino) |

---

### 5. TCV_ORDEN_MT → TCV_ORDEN_MT

Identico a `TCV_ORDEN → TCV_ORDEN_BT` en estructura de campos.
La tabla origen es `INTSDR.TCV_ORDEN_MT` y la tabla destino es `TCV_ORDEN_MT`.

---

## Estructura de archivos creados

```
packages/integration/src/lambda-modules/sync-boundary/
│
├── sync-boundary.handler.ts                          ← entry point Lambda
│
└── infrastructure/
    ├── mapper/                                       ← capa de mapeo (entidad origen → dominio)
    │   ├── sdr-int-nexus-a.mapper.ts
    │   ├── sdr-int-nexus-d.mapper.ts
    │   ├── tcv-aviso.mapper.ts
    │   ├── tcv-order-bt.mapper.ts
    │   └── tcv-order-mt.mapper.ts
    │
    └── adapter/out/db/typeorm/
        ├── origin/
        │   ├── entities/
        │   │   ├── sdr-int-nexus-a.entity.ts         ← INTSDR.SDR_INT_NEXUS_A
        │   │   ├── sdr-int-nexus-d.entity.ts         ← INTSDR.SDR_INT_NEXUS_D
        │   │   ├── tcv-aviso.entity.ts               ← INTSDR.TCV_AVISO
        │   │   ├── tcv-order.entity.ts               ← INTSDR.TCV_ORDEN
        │   │   └── tcv-order-mt.entity.ts            ← INTSDR.TCV_ORDEN_MT
        │   └── repositories/
        │       ├── sdr-int-nexus-a.origin.repository.ts
        │       ├── sdr-int-nexus-d.origin.repository.ts
        │       ├── tcv-aviso.origin.repository.ts
        │       ├── tcv-order-bt.origin.repository.ts
        │       └── tcv-order-mt.origin.repository.ts
        │
        └── destination/
            ├── entities/
            │   ├── sdr-int-nexus-a.destination.entity.ts   ← SDR_INT_NEXUS_A
            │   ├── sdr-int-nexus-d.destination.entity.ts   ← SDR_INT_NEXUS_D
            │   ├── tcv-aviso-bt.destination.entity.ts      ← TCV_AVISO_BT
            │   ├── tcv-aviso-mt.destination.entity.ts      ← TCV_AVISO_MT
            │   ├── tcv-orden-bt.destination.entity.ts      ← TCV_ORDEN_BT
            │   └── tcv-orden-mt.destination.entity.ts      ← TCV_ORDEN_MT
            └── repositories/
                ├── sdr-int-nexus-a.destination.repository.ts
                ├── sdr-int-nexus-d.destination.repository.ts
                ├── tcv-aviso-bt.destination.repository.ts
                ├── tcv-aviso-mt.destination.repository.ts
                ├── tcv-orden-bt.destination.repository.ts
                └── tcv-orden-mt.destination.repository.ts
```

---

## Estado de implementacion

| Componente | Estado |
|---|---|
| Entidades de dominio (`@sdr/domain`) | ✅ Completo |
| Entidades TypeORM origen (5 tablas) | ✅ Completo |
| Repositorios origen (5 repos) | ✅ Completo |
| Mappers origen → dominio (5 mappers) | ✅ Completo |
| Entidades TypeORM destino (6 tablas) | ✅ Completo |
| Repositorios destino (6 repos) | ✅ Completo |
| Handler `sync-boundary.handler.ts` | 🔧 En progreso — wiring dominio → destino pendiente |
| Configuracion DataSources con env vars | 🔧 En progreso — variables de entorno pendiente |

---

## Pendientes tecnicos

### Handler: wiring completo

El handler `sync-boundary.handler.ts` necesita:

1. Configurar dos `DataSource` con variables de entorno:

   ```text
   # Origen
   ORIGIN_DB_HOST
   ORIGIN_DB_PORT     (default: 1521)
   ORIGIN_DB_USER
   ORIGIN_DB_PASSWORD
   ORIGIN_DB_SERVICE

   # Destino
   DEST_DB_HOST
   DEST_DB_PORT       (default: 1521)
   DEST_DB_USER
   DEST_DB_PASSWORD
   DEST_DB_SERVICE
   ```

2. Para cada sincronizacion:
   - Leer todos los registros del origen via `OriginRepository.findAll()`
   - Mapear la entidad TypeORM al dominio via mapper
   - Mapear el objeto de dominio a la entidad TypeORM destino (inline en el handler)
   - Persistir via `DestinationRepository.save()`

3. Inicializar ambos DataSources al inicio del handler y reutilizarlos entre invocaciones (fuera del scope del handler para aprovechar container reuse de Lambda).

### Conversion de tipos

El dominio usa `DateTime` de `@pormeldev/axis-common-lib` (Luxon).
Las entidades destino usan `Date` nativo.
La conversion se resuelve con:

```typescript
function toDate(dt: unknown): Date | null {
  if (dt == null) return null;
  if (typeof (dt as { toJSDate?: unknown }).toJSDate === 'function') {
    return (dt as { toJSDate: () => Date }).toJSDate();
  }
  return dt as Date;
}
```

### Campos sin mapping (setear en null)

Varios campos de las tablas destino no tienen correspondencia en el dominio actual.
Se setean en `null` hasta que se defina el mapping funcional:

| Tabla destino | Campo | Motivo |
|---|---|---|
| `SDR_INT_NEXUS_A` | `DEVICE_ID` | No existe en Nexus A origen |
| `SDR_INT_NEXUS_D` | `TYPE_ID` | No existe en Nexus D origen |
| `SDR_INT_NEXUS_D` | `DESCR_ESTADO` | No baja del origen en esta version |
| `SDR_INT_NEXUS_D` | `CANT_RECLAMOS_TOT` | No existe en origen |
| `SDR_INT_NEXUS_D` | `DOM_A` | No existe en origen |

---

## Pendientes funcionales

### Split TCV_AVISO → BT / MT

El origen tiene una sola tabla `INTSDR.TCV_AVISO`.
El destino requiere separar los avisos en dos tablas: `TCV_AVISO_BT` y `TCV_AVISO_MT`.

**Pregunta abierta**: ¿cual es la regla de clasificacion?

Candidatos conocidos:
- Campo `BEGRU` (varchar2 2): presente en origen y en el dominio como `_begru`.
- Campo `DIVISION` (varchar2 4).
- Alguna otra tabla de referencia externa.

**Impacto en implementacion**:
Una vez definida la regla, la funcion `syncTcvAviso` en el handler necesita:
- evaluar el campo discriminador por cada registro,
- instanciar `TcvAvisoBtDestEntity` o `TcvAvisoMtDestEntity` segun corresponda,
- persistir en el repo correcto (`TcvAvisoBtDestinationRepository` o `TcvAvisoMtDestinationRepository`).
