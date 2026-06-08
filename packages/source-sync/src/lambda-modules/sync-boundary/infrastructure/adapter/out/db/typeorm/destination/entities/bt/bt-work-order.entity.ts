import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BtWorkOrderColumns } from "../../../fields/bt-work-order-columns.enum";
import { BtTableNames } from "../../../schema/bt-table-names.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { BtFieldAssignmentEntity } from "./bt-field-assignment.entity";
import { BtGridEventEntity } from "./bt-grid-event.entity";

@Entity({ name: BtTableNames.WORK_ORDERS })
@Index('UK_BT_WO_DOMAIN', ['id'], { unique: true })
@Index('UK_BT_WO_SAP_REF', ['sapNotificationNumber', 'sapOrderNumber'], { unique: true })
@Index('IDX_BT_WO_GE', ['gridEventSid'])
@Index('IDX_BT_WO_PARENT', ['parentWorkOrderSid'])
@Index('IDX_BT_WO_ROOT', ['rootWorkOrderSid'])
export class BtWorkOrderEntity {
  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtWorkOrderColumns.ID, type: 'number' })
  sid!: number;

  /////** FSD BT: identidad interna UUIDv7 del dominio. Origen: dominio. Dominio: WorkOrder.id. */
  @Column({ name: BtWorkOrderColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /////** FSD BT: orden pertenece al registro. Origen: relacion tecnica. Dominio: workOrders. */
  @Column({ name: BtWorkOrderColumns.GRID_EVENT_ID, type: 'number' })
  gridEventSid!: number;

  /////** FSD BT: arbol de subordenes. Origen: relacion tecnica. Dominio: WorkOrder.parentId. */
  @Column({ name: BtWorkOrderColumns.PARENT_WORK_ORDER_ID, type: 'number', nullable: true })
  parentWorkOrderSid!: number | null;

  /////** FSD BT: arbol de subordenes. Origen: relacion tecnica. Dominio: WorkOrder.rootParentId. */
  @Column({ name: BtWorkOrderColumns.ROOT_WORK_ORDER_ID, type: 'number', nullable: true })
  rootWorkOrderSid!: number | null;

  /////** FSD BT #12 AVISO (Numero OT) SAP. Origen: SAP. Dominio: WorkOrder.sapReference.sapNotificationNumber. */
  @Column({ name: BtWorkOrderColumns.SAP_NOTIFICATION_NUMBER, type: 'varchar2', length: 12 })
  sapNotificationNumber!: string;

  /////** FSD BT #13 Numero de Orden. Origen: SAP asociada al aviso. Dominio: WorkOrder.sapReference.sapOrderNumber. */
  @Column({ name: BtWorkOrderColumns.SAP_ORDER_NUMBER, type: 'varchar2', length: 12 })
  sapOrderNumber!: string;

  // TODO(Dominio): WorkOrder.taskType ya no se persiste. Si no aparece una semantica SAP independiente, removerlo del dominio y usar solo stage.

  // TODO(BA/SAP): confirmar si WorkOrder.stage debe derivarse de un diccionario sobre HR_TEXT/ORDEN_TXT o de otra senal. ODS Mapeo-SAP aclara que la relacion "suborden 1 Localizacion, 2 Zanjeo, 3 Corte y Prueba, 4 Reparacion, 5 Normalizacion" no existe como regla segura en SAP.
  /////** FSD BT #24/#27/#30 y seccion Visualizacion jerarquica: etapa operativa de la orden/suborden (Localizacion, Zanjeo, Reparacion, Normalizacion). Origen: SAP/suborden. Dominio: WorkOrder.stage. */
  @Column({ name: BtWorkOrderColumns.STAGE, type: 'varchar2', length: 20 })
  stage!: string;

  // TODO(Dominio/BA): este campo persiste una hipotesis del dominio actual. No preguntar por "NORMALIZED_STATUS"; preguntar si los estados reales de orden SAP deben bloquear asignaciones o cierre del caso.
  /** FSD BT: no existe como campo visible del detalle. No es el STATUS crudo de SAP; ese vive en sapStatusCode. Origen: estado normalizado propio del sistema, inferible a futuro desde SAP_ESTADO/SAP_STATUS_CODE si negocio confirma reglas. Dominio: WorkOrder.status. Hoy el dominio lo usa para terminalidad, bloqueo de asignaciones y cierre del caso; esa logica no esta confirmada por FSD/ODS y debe tratarse como hipotesis hasta validacion. */
  @Column({ name: BtWorkOrderColumns.NORMALIZED_STATUS, type: 'varchar2', length: 20 })
  normalizedStatus!: string;

  // TODO(Dominio): WorkOrder.statusUpdatedAt existe hoy, pero no se persiste porque no hay campo FSD/SAP equivalente confirmado. Si WorkOrder.status queda como regla real, decidir si se reconstruye desde auditoria/eventos, SAP_LAST_UPDATED_AT, SAP_CURSOR_AT o una columna nueva; si NORMALIZED_STATUS se descarta, tambien deberia removerse del dominio.

  // TODO(BA): confirmar si SAP_ESTADO se necesita para UI, filtros, auditoria o mapping futuro; si queda solo informativo y no aporta uso concreto, evaluar no persistirlo en estas tablas.
  /** FSD BT: no aparece como columna visible del detalle. Origen CSV SAP TCV_ORDEN_BT.ESTADO; valores vistos: CREADA, LIBERADA, CIERRE_TECNICO, CIERRE_FINAL. ODS Mapeo-SAP: uso operativo real, pero a nivel informativo de la orden. Dominio: sin equivalente directo hasta confirmar mapping. */
  @Column({ name: BtWorkOrderColumns.SAP_ESTADO, type: 'varchar2', length: 30, nullable: true })
  sapEstado!: string | null;

  // TODO(BA/SAP): pedir diccionario de STATUS y confirmar si SAP_STATUS_CODE se necesita para UI, filtros, auditoria o mapping; sin diccionario no usarlo para reglas de dominio.
  /** FSD BT: no aparece como columna visible del detalle. Origen CSV SAP TCV_ORDEN_BT.STATUS; la columna fuente se llama STATUS, pero aqui se persiste como SAP_STATUS_CODE porque llega como codigo corto (CREA, FELE, NEFE, RWOM, CWOM, NWOM, BLOQ, etc.) y para no confundirlo con NORMALIZED_STATUS. ODS Mapeo-SAP: status de usuario que negocio mira y requiere tabla complementaria/diccionario. Dominio: sin equivalente directo hasta confirmar mapping. */
  @Column({
    name: BtWorkOrderColumns.SAP_STATUS_CODE,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  sapStatusCode!: string | null;

  /** FSD BT: no aparece como campo visible del detalle; se conserva por decision tecnica de ingesta/trazabilidad. Origen CSV SAP TCV_ORDEN_BT.FEC_ULT_ACT. ODS Mapeo-SAP: fecha informativa de ultima actualizacion SAP, no cursor incremental. Uso esperado: fecha funcional/version de la orden para desempatar versiones con la misma FECHA tecnica, auditoria, debug o visualizacion si negocio lo pide. No debe gobernar el avance del cursor principal; ese rol corresponde a SAP_CURSOR_AT. Dominio: sin equivalente directo. */
  @Column({
    name: BtWorkOrderColumns.SAP_LAST_UPDATED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  sapLastUpdatedAt!: DateTime | null;

  /** FSD BT: no aparece como campo visible del detalle; es una decision tecnica de integracion. Origen CSV SAP TCV_ORDEN_BT.FECHA. ODS Mapeo-SAP: cursor incremental de la tabla frontera. Uso esperado: fecha tecnica de impacto/publicacion para leer deltas, ordenar el stream SAP y deduplicar junto con una clave estable de identidad; si varias versiones comparten esta FECHA, SAP_LAST_UPDATED_AT puede desempatar la version funcional mas reciente. Dominio: sin equivalente directo. */
  @Column({
    name: BtWorkOrderColumns.SAP_CURSOR_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  sapCursorAt!: DateTime | null;

  // TODO(Dominio): WorkOrder.description hoy acepta correccion manual/override. En persistencia lo tratamos como texto automatico de SAP; si SDR necesita observaciones manuales, usar executionRemarks/regionalDeskRemarks y no este campo.
  /** FSD BT: no hay columna DESCRIPTION explicita del detalle; se conserva como texto operativo de la orden/suborden SAP. Origen CSV SAP TCV_ORDEN_BT.HR_TEXT; ODS Mapeo-SAP: HR_TEXT describe la accion fisica de la cuadrilla y, si viene nulo, debe usarse ORDEN_TXT como titulo corto de la orden. Los CSV de prueba muestran textos parseables parcialmente (Localizacion, Excavacion/relleno, Ejecucion empalme, Recorrido), pero no alcanzan para inferir WorkOrder.stage sin diccionario confirmado. Dominio: WorkOrder.description, dato descriptivo automatico de SAP. */
  @Column({ name: BtWorkOrderColumns.DESCRIPTION, type: 'varchar2', length: 500, nullable: true })
  description!: string | null;

  // TODO(BA/SAP): confirmar si TPLNR del Aviso y TPLNR de la Orden pueden divergir o si siempre deben tratarse como el mismo dato funcional. En CSV actuales AVISO.TPLNR y ORDEN.TPLNR coinciden para las ordenes cruzadas.
  /** FSD BT #15 UBICACION TECNICA. Origen CSV SAP TCV_ORDEN_BT.TPLNR; ODS Mapeo-SAP: codigo que identifica fisicamente el lugar en el mapa de activos SAP y equivale a Ubicacion Tecnica. La UT se asigna primero al Aviso y despues a la Orden; hoy no esta confirmado si este valor puede diferir del TECHNICAL_LOCATION del caso, por eso se conserva como snapshot de la orden/suborden hasta validar la regla. Dominio: WorkOrder.technicalLocation. */
  @Column({
    name: BtWorkOrderColumns.TECHNICAL_LOCATION,
    type: 'varchar2',
    length: 200,
    nullable: true,
  })
  technicalLocation!: string | null;

  // TODO(BA/SAP): confirmar si TCV_ORDEN_BT.VISIBLE = N implica solo ocultar la orden en pantallas operativas o si SDR directamente no debe crearla/hidratarla como WorkOrder. TODO(Dominio): hoy sapIsVisible acepta correccion manual/override, pero VISIBLE es una senal fuente SAP y deberia ser read-only.
  /** FSD BT: no aparece como columna visible del detalle. Origen CSV SAP TCV_ORDEN_BT.VISIBLE; ODS Mapeo-SAP: flag que indica si la orden se debe mostrar en pantallas operativas y se usa como FILTRO. No explica por si solo el motivo funcional de un valor N; traer la fila desde frontera no obliga a mostrarla. Uso esperado: persistir para auditoria/debug/correlacion y aplicar filtro por defecto en queries/read-model/UI hasta confirmar si tambien debe afectar la hidratacion. Dominio: WorkOrder.sapIsVisible, senal tecnica/operativa de visibilidad SAP. */
  @Column({ name: BtWorkOrderColumns.SAP_IS_VISIBLE, type: 'number', precision: 1, nullable: true })
  sapIsVisible!: number | null;

  // TODO(Dominio): WorkOrder.sapCreationDate hoy acepta correccion manual/override, pero eso debe corregirse. SDR no puede editar esta fecha: solo SAP conoce cuando creo la orden y la tabla frontera es nuestra fuente de verdad.
  /** FSD BT: no aparece como campo visible/editable del detalle. Origen CSV SAP TCV_ORDEN_BT.FEC_CREACION; fecha de alta/creacion de la orden en SAP. Es distinta de CREATED_AT, que es auditoria tecnica de nuestra tabla. Uso esperado: trazabilidad, auditoria, diagnostico y eventual ordenamiento funcional secundario; no debe usarse como cursor incremental ni como fecha de alta del registro SDR. Dominio: WorkOrder.sapCreationDate, dato informativo SAP que debe hidratarse solo desde integracion. */
  @Column({
    name: BtWorkOrderColumns.SAP_CREATION_DATE,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  sapCreationDate!: DateTime | null;

  // TODO(Dominio): WorkOrder.executionRemarks/municipalPermit existen hoy, pero no se persisten aqui porque el FSD BT ubica OBSERVACIONES / NOTAS y PERMISO MUNICIPAL a nivel caso/falla. Al alinear dominio, moverlos al caso o removerlos de WorkOrder.

  // TODO Nota dominio: WorkOrder.protocolNumber/protocolStartedAt/protocolEndedAt existen hoy por modelo comun, pero BT FSD no define Protocolo. Infra BT no persiste esos campos.
  // Nota dominio: WorkOrder.repairStartedAt/estimatedFinishedAt/actualFinishedAt existen hoy, pero FSD BT #37-#39 ubica esas fechas a nivel caso/falla; se persisten en BT_GRID_EVENTS.

  /** FSD BT: soporte tecnico para campos de orden/suborden editados manualmente. Origen: sistema SDR; no viene de SAP/GeoCall/Nexus. Persistencia: CSV de campos protegidos para evitar que una actualizacion automatica pise correcciones manuales y para que UI los muestre en negrita. Uso principal esperado: assignments/empresa/oficial/fechas de tarea de suborden. Dominio: WorkOrder.manualOverrides; el set actual del dominio debe depurarse porque aun incluye campos que ya movimos al caso. */
  @Column({
    name: BtWorkOrderColumns.MANUAL_OVERRIDES,
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  manualOverrides!: string | null;

  /////** FSD BT: fecha de borrado logico de orden/suborden. Origen: tecnico. Domain queda fuera de scope y se conserva sin cambios hasta conectar mapeo. */
  @Column({
    name: BtWorkOrderColumns.DELETED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  deletedAt!: DateTime | null;

  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: BtWorkOrderColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: BtWorkOrderColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  // ----------- RELACIONES ------------------------
  /** FSD BT: orden pertenece al registro. Origen: relacion tecnica. Dominio: workOrders. */
  @ManyToOne(
    () => BtGridEventEntity,
    (gridEvent) => gridEvent.workOrders,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: BtWorkOrderColumns.GRID_EVENT_ID, referencedColumnName: 'sid' })
  gridEvent?: BtGridEventEntity;

  /** FSD BT: ramificacion de subordenes en arbol. Origen: relacion tecnica. Dominio: WorkOrder.parentId. */
  @ManyToOne(
    () => BtWorkOrderEntity,
    (workOrder) => workOrder.subOrders,
    { nullable: true, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: BtWorkOrderColumns.PARENT_WORK_ORDER_ID, referencedColumnName: 'sid' })
  parentWorkOrder?: BtWorkOrderEntity | null;

  /** FSD BT: raiz del arbol de subordenes. Origen: relacion tecnica. Dominio: WorkOrder.rootParentId. */
  @ManyToOne(() => BtWorkOrderEntity, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: BtWorkOrderColumns.ROOT_WORK_ORDER_ID, referencedColumnName: 'sid' })
  rootWorkOrder?: BtWorkOrderEntity | null;

  /** FSD BT: subordenes hijas de la orden. Origen: relacion tecnica. Dominio: WorkOrder.subOrders. */
  @OneToMany(
    () => BtWorkOrderEntity,
    (workOrder) => workOrder.parentWorkOrder,
    { createForeignKeyConstraints: false },
  )
  subOrders?: BtWorkOrderEntity[];

  /** FSD BT #25/#26/#28/#29/#31/#32 empresa/oficial por suborden. Origen: relacion tecnica. Dominio: WorkOrder.assignments. */
  @OneToMany(
    () => BtFieldAssignmentEntity,
    (assignment) => assignment.workOrder,
    { createForeignKeyConstraints: false },
  )
  assignments?: BtFieldAssignmentEntity[];
}