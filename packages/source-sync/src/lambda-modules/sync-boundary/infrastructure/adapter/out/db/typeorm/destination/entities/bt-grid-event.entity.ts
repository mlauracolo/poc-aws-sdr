import { DateTime } from "@pormeldev/axis-common-lib";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BtGridEventColumns } from "../../../fields/bt-grid-event-columns.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { BtDocumentEntity } from "./bt-document.entity";
import { BtGridEventKeyEntity } from "./bt-grid-event-key.entity";
import { BtWorkOrderEntity } from "./bt-work-order.entity";

export class BtGridEventEntity {
  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtGridEventColumns.ID, type: 'number' })
  sid!: number;

  /** FSD BT: sin campo visible. Origen: identidad interna de dominio. Dominio: id. */
  @Column({ name: BtGridEventColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /** FSD BT #2 Documento. Origen: relacion tecnica opcional a Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: BtGridEventColumns.DOCUMENT_ID, type: 'number', nullable: true })
  documentSid!: number | null;

  /** FSD BT #10 Numero de Anomalia. Origen: directo desde Anomalia Nexus. Dominio: references.nexusAnomalyNumber. */
  @Column({
    name: BtGridEventColumns.NEXUS_ANOMALY_NUMBER,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  nexusAnomalyNumber!: string | null;

  /** FSD BT #12 AVISO (Numero OT) SAP. Origen: directo desde SAP/Nexus correlacionado. Dominio: references.sapNotificationNumber. */
  @Column({
    name: BtGridEventColumns.SAP_NOTIFICATION_NUMBER,
    type: 'varchar2',
    length: 12,
    nullable: true,
  })
  sapNotificationNumber!: string | null;

  /** FSD BT #13 Numero de Orden. Origen: directo desde SAP asociado al aviso. Dominio: references.sapOrderNumber. */
  @Column({
    name: BtGridEventColumns.SAP_ORDER_NUMBER,
    type: 'varchar2',
    length: 12,
    nullable: true,
  })
  sapOrderNumber!: string | null;

  // TODO(BA/SAP): confirmar fuente exacta de EVENT_TYPE; puede venir de frontera SAP o derivarse desde documento/criterio de creacion.
  /** FSD BT: tipo funcional del caso/evento: FORZADO o PROGRAMADO. Es un dato de clasificacion del caso, no una columna visible del detalle. Origen pendiente de confirmar por integracion/negocio. Dominio: interventionType; mapper futuro persiste interventionType.value 1:1. */
  @Column({ name: BtGridEventColumns.EVENT_TYPE, type: 'varchar2', length: 15 })
  eventType!: string;

  /** FSD BT #11 Fecha Deteccion / Creacion del Aviso. Origen: Anomalia Nexus o SAP Aviso. Dominio: detectionDate. */
  @Column({
    name: BtGridEventColumns.DETECTION_DATE,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  detectionDate!: DateTime | null;

  /** FSD BT #22 PRIORIDAD. Origen: SAP o carga manual POE. Dominio: priority. */
  @Column({ name: BtGridEventColumns.PRIORITY, type: 'varchar2', length: 10, nullable: true })
  priority!: string | null;

  // TODO(BA/SAP): confirmar si TPLNR del Aviso y TPLNR de la Orden pueden divergir o si siempre deben tratarse como el mismo dato funcional. En CSV actuales AVISO.TPLNR y ORDEN.TPLNR coinciden para las ordenes cruzadas.
  /** FSD BT #15 UBICACION TECNICA. Origen CSV SAP TCV_AVISO_BT.TPLNR o dato principal correlacionado del caso. ODS Mapeo-SAP: TPLNR identifica fisicamente el lugar en el mapa de activos SAP y equivale a Ubicacion Tecnica; la UT se asigna primero al Aviso y despues a la Orden. Dominio: technicalLocation del caso. */
  @Column({
    name: BtGridEventColumns.TECHNICAL_LOCATION,
    type: 'varchar2',
    length: 200,
    nullable: true,
  })
  technicalLocation!: string | null;

  /** FSD BT: estado operativo interno normalizado. No representa activo/historico. Dominio: status. */
  @Column({ name: BtGridEventColumns.EVENT_STATUS, type: 'varchar2', length: 30 })
  eventStatus!: string;

  /////** FSD BT #20 Estado de la Reparacion. Origen: ingreso manual a nivel usuario mediante lista desplegable; estado operativo actual del caso. Persistencia: valor vigente en BT_GRID_EVENTS. Dominio: repairStatus (BtRepairStatus). Campo fuente para derivar EVENT_STATUS, POWER_BI_STATUS y la ventana activo/historico mediante REPAIR_STATUS_UPDATED_AT. */
  @Column({ name: BtGridEventColumns.REPAIR_STATUS, type: 'varchar2', length: 40, nullable: true })
  repairStatus!: string | null;

  /////** FSD BT: fecha tecnica del ultimo cambio real de Estado de la Reparacion. Origen: calculado por SDR al modificar REPAIR_STATUS; no es ingreso manual directo ni fecha de frontera SAP. Uso: gobierna ventana activo/historico junto con repairStatus/powerBiStatus. Dominio: repairStatusUpdatedAt. */
  @Column({
    name: BtGridEventColumns.REPAIR_STATUS_UPDATED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  repairStatusUpdatedAt!: DateTime | null;

  /////** FSD BT #43 Estado PBI. Origen: automatico; mapeo derivado desde REPAIR_STATUS mediante RepairStatusToPowerBiStatusPolicy. Persistencia: valor denormalizado e indexado en BT_GRID_EVENTS para reporting/filtros; no es ingreso manual ni fuente de verdad. Dominio: powerBiStatus. */
  @Column({
    name: BtGridEventColumns.POWER_BI_STATUS,
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  powerBiStatus!: string | null;

  /** FSD BT: momento funcional en que el caso pasa a historico; null significa no historico. */
  @Column({
    name: BtGridEventColumns.HISTORICAL_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  historicalAt!: DateTime | null;

  /** FSD BT #18 Afecta Suministro. Origen: logica del sistema; se deriva de Afectados Ahora: true/Si si affectedCustomers > 0, false/No si affectedCustomers = 0, null si no hay dato. Persistencia: NUMBER(1) derivado en BT_GRID_EVENTS para consulta del caso; la representacion Si/No es de UI. Dominio: affectsSupply. */
  @Column({ name: BtGridEventColumns.AFFECTS_SUPPLY, type: 'number', precision: 1, nullable: true })
  affectsSupply!: number | null;

  /////** FSD BT #14 Empresa Asignada en FSM. Origen: GeoCall/TDC. Persistencia: dato operativo de cabecera del caso en BT_GRID_EVENTS; no dato de orden/suborden ni reemplazo de empresa/oficial/fechas por suborden en FieldAssignment. Dominio: interveningTeams. */
  @Column({ name: BtGridEventColumns.INTERVENING_TEAMS, type: 'clob', nullable: true })
  interveningTeams!: string | null;

  // Nota dominio: hoy esto mapea a regionalDeskRemarks, pero en BT ese nombre es heredado y confuso. Se sugiere renombrar dominio a executionRemarks o followUpRemarks como propiedad case-level.
  /////** FSD BT #34 OBSERVACIONES / NOTAS. Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no se duplica en BT_WORK_ORDERS. Dominio actual: regionalDeskRemarks. */
  @Column({ name: BtGridEventColumns.EXECUTION_REMARKS, type: 'clob', nullable: true })
  executionRemarks!: string | null;

  // Nota dominio: WorkOrder.municipalPermit existe hoy, pero el FSD BT ubica Permiso Municipal a nivel caso/falla. Se sugiere moverlo al caso o removerlo de WorkOrder.
  /////** FSD BT #35 PERMISO MUNICIPAL (nro.). Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no dato de orden/suborden. Dominio actual: WorkOrder.municipalPermit; sugerido: propiedad case-level especifica. */
  @Column({
    name: BtGridEventColumns.MUNICIPAL_PERMIT,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  municipalPermit!: string | null;

  /** FSD BT #21 DANO. Origen: carga manual. Dominio: damageByThirdParty. */
  @Column({
    name: BtGridEventColumns.DAMAGE_BY_THIRD_PARTY,
    type: 'number',
    precision: 1,
    nullable: true,
  })
  damageByThirdParty!: number | null;

  /////** FSD BT #23 CANTIDAD de FALLAS. Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no dato de orden/suborden. Dominio: failuresCount (FailuresCount), entero positivo cuando viene informado. */
  @Column({ name: BtGridEventColumns.FAILURES_COUNT, type: 'number', nullable: true })
  failuresCount!: number | null;

  // TODO(Dominio): failureAddress hoy existe en WorkOrder, pero el FSD lo ubica bajo seguimiento de la falla/caso. Al alinear dominio, moverlo al caso si se confirma este ownership.
  /** FSD BT #33 DIRECCION de FALLA. Origen: GeoCall, cierre de TDC de suborden de localizacion. No es dato SAP ni Nexus y no figura como ingreso manual; se hidrata desde integracion GeoCall/TDC. Persistencia: dato del caso/falla, no de cada orden/suborden. */
  @Column({
    name: BtGridEventColumns.FAILURE_ADDRESS,
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  failureAddress!: string | null;

  // TODO(Dominio): geoLocation hoy existe en WorkOrder, pero el FSD lo ubica bajo seguimiento de la falla/caso. Al alinear dominio, moverlo al caso si se confirma este ownership.
  /** FSD BT #36 GEO-LOC (Falla). Origen: ingreso manual a nivel usuario bajo Seguimiento de la falla. No es dato SAP, Nexus ni GeoCall; persistencia: dato del caso/falla, no de cada orden/suborden. */
  @Column({
    name: BtGridEventColumns.GEO_LOCATION,
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  geoLocation!: string | null;

  // Nota dominio: WorkOrder.repairStartedAt/estimatedFinishedAt/actualFinishedAt existen hoy, pero FSD BT #37-#39 ubica estas fechas a nivel caso/falla. Se sugiere moverlas al caso o removerlas de WorkOrder.
  /////** FSD BT #37 INICIO REPARACION. Origen: GeoCall TDC. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no dato de orden/suborden. Dominio actual: WorkOrder.repairStartedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: BtGridEventColumns.REPAIR_STARTED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  repairStartedAt!: DateTime | null;

  /////** FSD BT #38 PREVISTA FINALIZACION. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no dato de orden/suborden. Dominio actual: WorkOrder.estimatedFinishedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: BtGridEventColumns.ESTIMATED_FINISHED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  estimatedFinishedAt!: DateTime | null;

  /////** FSD BT #39 REAL FINALIZACION. Origen: GeoCall TDC. Persistencia: dato del caso/falla en BT_GRID_EVENTS; no dato de orden/suborden. Dominio actual: WorkOrder.actualFinishedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: BtGridEventColumns.ACTUAL_FINISHED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  actualFinishedAt!: DateTime | null;

  /** FSD BT #16 Instalacion. Origen: Anomalia Nexus. Dominio: installation. */
  @Column({ name: BtGridEventColumns.INSTALLATION, type: 'varchar2', length: 20, nullable: true })
  installation!: string | null;

  /////** FSD BT #17 Tipo de Falla. Origen: carga manual de usuario. Dominio: failureType. */
  @Column({ name: BtGridEventColumns.FAILURE_TYPE, type: 'varchar2', length: 30, nullable: true })
  failureType!: string | null;

  /** FSD BT #40 Origen. Origen: carga manual. Dominio: origin. */
  @Column({ name: BtGridEventColumns.ORIGIN, type: 'varchar2', length: 15, nullable: true })
  origin!: string | null;

  /** FSD BT #41 Peligro. Origen: carga manual. Dominio: danger. */
  @Column({ name: BtGridEventColumns.DANGER, type: 'varchar2', length: 2, nullable: true })
  danger!: string | null;

  /** FSD BT #42 Plazo Dias Vencimiento. Origen: calculado por regla BT de SLA. Dominio: expirationDays. */
  @Column({ name: BtGridEventColumns.EXPIRATION_DAYS, type: 'number', nullable: true })
  expirationDays!: number | null;

  /** FSD BT #19 Observacion de la anomalia / Descripcion del Aviso. Origen: Anomalia Nexus o SAP Aviso. Dominio: sourceDescription. */
  @Column({
    name: BtGridEventColumns.SOURCE_DESCRIPTION,
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  sourceDescription!: string | null;

  /** TODO(FSD BT): no aparece explicito en el FSD BT, pero negocio espera simetria con MT porque BT tambien tiene etapa Normalizacion. Origen: automatico; referencia de la orden/suborden de normalizacion que el caso BT debe conocer. Debe guardar el numero concreto de suborden que pertenece a la etapa Normalizacion. No es la etapa de suborden, que se persiste en WorkOrder.stage. Dominio: pendiente de incorporar como normalizationTaskReference. */
  @Column({
    name: BtGridEventColumns.NORMALIZATION_TASK_REFERENCE,
    type: 'varchar2',
    length: 120,
    nullable: true,
  })
  normalizationTaskReference!: string | null;

  /** FSD BT: visualizacion en negrita y proteccion de edicion manual. Origen: tecnico. Dominio: manualOverrides. */
  @Column({
    name: BtGridEventColumns.MANUAL_OVERRIDES,
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  manualOverrides!: string | null;

  /** FSD BT: fecha de borrado logico. Origen: tecnico de persistencia. Domain queda fuera de scope y se conserva sin cambios hasta conectar mapeo. */
  @Column({
    name: BtGridEventColumns.DELETED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  deletedAt!: DateTime | null;

  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: BtGridEventColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: BtGridEventColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /** FSD BT: metadata tecnica para concurrencia optimista del aggregate root. */
  @VersionColumn({ name: BtGridEventColumns.VERSION, type: 'number', default: 1 })
  version!: number;

  /** FSD BT #2 Documento. Origen: relacion tecnica opcional para casos con Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @ManyToOne(
    () => BtDocumentEntity,
    (document) => document.gridEvents,
    { nullable: true, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: BtGridEventColumns.DOCUMENT_ID, referencedColumnName: 'sid' })
  document?: BtDocumentEntity | null;

  /** FSD BT: validacion de no duplicados. Origen: relacion tecnica a claves calculadas. Dominio: uniquenessKeys. */
  @OneToMany(
    () => BtGridEventKeyEntity,
    (key) => key.gridEvent,
    { createForeignKeyConstraints: false },
  )
  keys?: BtGridEventKeyEntity[];

  /** FSD BT: ordenes y subordenes. Origen: relacion tecnica. Dominio: workOrders. */
  @OneToMany(
    () => BtWorkOrderEntity,
    (workOrder) => workOrder.gridEvent,
    { createForeignKeyConstraints: false },
  )
  workOrders?: BtWorkOrderEntity[];
}