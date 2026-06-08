import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { MtGridEventColumns } from "../../../fields/mt-grid-event-columns.enum";
import { MtTableNames } from "../../../schema/mt-table-names.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { MtDocumentEntity } from "./mt-document.entity";
import { MtGridEventKeyEntity } from "./mt-grid-event-key.entity";
import { MtWorkOrderEntity } from "./mt-work-order.entity";

@Entity({ name: MtTableNames.GRID_EVENTS })
@Index('UK_MT_GE_DOMAIN', ['id'], { unique: true })
@Index('IDX_MT_GE_DOC', ['documentSid'])
@Index('IDX_MT_GE_ACTIVE', ['deletedAt', 'eventStatus'])
@Index('IDX_MT_GE_REP_AT', ['repairStatusUpdatedAt'])
@Index('IDX_MT_GE_PBI', ['powerBiStatus'])
export class MtGridEventEntity {
  /////** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: MtGridEventColumns.ID, type: 'number' })
  sid!: number;

  /** FSD MT: sin campo visible. Origen: identidad interna de dominio. Dominio: id. */
  @Column({ name: MtGridEventColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /////** FSD MT: Documento. Origen: relacion tecnica opcional a Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: MtGridEventColumns.DOCUMENT_ID, type: 'number', nullable: true })
  documentSid!: number | null;

  /////** FSD MT: Numero de Anomalia. Origen: directo desde Anomalia Nexus. Dominio: references.nexusAnomalyNumber. */
  @Column({
    name: MtGridEventColumns.NEXUS_ANOMALY_NUMBER,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  nexusAnomalyNumber!: string | null;

  /////** FSD MT: Aviso (Numero OT). Origen: directo desde Anomalia Nexus/SAP correlacionado. Dominio: references.sapNotificationNumber. */
  @Column({
    name: MtGridEventColumns.SAP_NOTIFICATION_NUMBER,
    type: 'varchar2',
    length: 12,
    nullable: true,
  })
  sapNotificationNumber!: string | null;

  /////** FSD MT: Numero de Orden. Origen: SAP asociada al aviso. Dominio: references.sapOrderNumber. */
  @Column({
    name: MtGridEventColumns.SAP_ORDER_NUMBER,
    type: 'varchar2',
    length: 12,
    nullable: true,
  })
  sapOrderNumber!: string | null;

  // TODO(BA/SAP): confirmar fuente exacta de EVENT_TYPE; puede venir de frontera SAP o derivarse desde documento/criterio de creacion.
  /** FSD MT: tipo funcional del caso/evento: FORZADO o PROGRAMADO. Es un dato de clasificacion del caso, no una columna visible del detalle. Origen pendiente de confirmar por integracion/negocio. Dominio: interventionType; mapper futuro persiste interventionType.value 1:1. */
  @Column({ name: MtGridEventColumns.EVENT_TYPE, type: 'varchar2', length: 15 })
  eventType!: string;

  /////** FSD MT: Fecha de deteccion. Origen: Anomalia Nexus. Dominio: detectionDate. */
  @Column({
    name: MtGridEventColumns.DETECTION_DATE,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  detectionDate!: DateTime | null;

  /** FSD MT: E.M. Deteccion - Empresa. Origen: GeoCall/TDC a nivel caso, no suborden. */
  @Column({
    name: MtGridEventColumns.DETECTION_COMPANY,
    type: 'varchar2',
    length: 120,
    nullable: true,
  })
  detectionCompany!: string | null;

  /** FSD MT: E.M. Deteccion - Oficial. Origen: GeoCall/TDC a nivel caso, no suborden. */
  @Column({
    name: MtGridEventColumns.DETECTION_TECHNICIAN,
    type: 'varchar2',
    length: 120,
    nullable: true,
  })
  detectionTechnician!: string | null;

  /////** FSD MT: Prioridad. Origen: SAP o carga manual POE. Dominio: priority. */
  @Column({ name: MtGridEventColumns.PRIORITY, type: 'varchar2', length: 10, nullable: true })
  priority!: string | null;

  // TODO(BA/SAP): confirmar si TPLNR del Aviso y TPLNR de la Orden pueden divergir o si siempre deben tratarse como el mismo dato funcional. En CSV actuales AVISO.TPLNR y ORDEN.TPLNR coinciden para las ordenes cruzadas.
  /** FSD MT: Ubicacion Tecnica. Origen CSV SAP TCV_AVISO_MT.TPLNR o dato principal correlacionado del caso. ODS Mapeo-SAP: TPLNR identifica fisicamente el lugar en el mapa de activos SAP y equivale a Ubicacion Tecnica; la UT se asigna primero al Aviso y despues a la Orden. Dominio: technicalLocation del caso. */
  @Column({
    name: MtGridEventColumns.TECHNICAL_LOCATION,
    type: 'varchar2',
    length: 200,
    nullable: true,
  })
  technicalLocation!: string | null;

  /** FSD MT: estado operativo interno normalizado. No representa activo/historico. Dominio: status. */
  @Column({ name: MtGridEventColumns.EVENT_STATUS, type: 'varchar2', length: 30 })
  eventStatus!: string;

  /////** FSD MT: Estado de la Reparacion. Origen: ingreso manual a nivel usuario mediante lista desplegable; estado operativo actual del caso. Persistencia: valor vigente en MT_GRID_EVENTS. Dominio: repairStatus (MtRepairStatus). Campo fuente para derivar EVENT_STATUS, POWER_BI_STATUS y la ventana activo/historico mediante REPAIR_STATUS_UPDATED_AT. */
  @Column({ name: MtGridEventColumns.REPAIR_STATUS, type: 'varchar2', length: 40, nullable: true })
  repairStatus!: string | null;

  /////** FSD MT: fecha tecnica del ultimo cambio real de Estado de la Reparacion. Origen: calculado por SDR al modificar REPAIR_STATUS; no es ingreso manual directo ni fecha de frontera SAP. Uso: gobierna ventana activo/historico junto con repairStatus/powerBiStatus. Dominio: repairStatusUpdatedAt. */
  @Column({
    name: MtGridEventColumns.REPAIR_STATUS_UPDATED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  repairStatusUpdatedAt!: DateTime | null;

  /////** FSD MT: Estado PBI. Origen: automatico; mapeo derivado desde REPAIR_STATUS mediante RepairStatusToPowerBiStatusPolicy. Persistencia: valor denormalizado e indexado en MT_GRID_EVENTS para reporting/filtros; no es ingreso manual ni fuente de verdad. Dominio: powerBiStatus. */
  @Column({
    name: MtGridEventColumns.POWER_BI_STATUS,
    type: 'varchar2',
    length: 30,
    nullable: true,
  })
  powerBiStatus!: string | null;

  /** FSD MT: momento funcional en que el caso pasa a historico; null significa no historico. */
  @Column({
    name: MtGridEventColumns.HISTORICAL_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  historicalAt!: DateTime | null;

  /** FSD MT: Afecta Suministro. Origen: logica del sistema; se deriva de Afectados Ahora: true/Si si affectedCustomers > 0, false/No si affectedCustomers = 0, null si no hay dato. Persistencia: NUMBER(1) derivado en MT_GRID_EVENTS para consulta del caso; la representacion Si/No es de UI. Dominio: affectsSupply. */
  @Column({ name: MtGridEventColumns.AFFECTS_SUPPLY, type: 'number', precision: 1, nullable: true })
  affectsSupply!: number | null;

  /////** FSD MT: Equipos Intervinientes. Origen: GeoCall/TDC. Aunque el FSD lo agrupa bajo Datos del documento, se persiste como dato operativo de cabecera del caso en MT_GRID_EVENTS porque no es atributo canonico del Documento Nexus ni debe compartirse automaticamente entre eventos del mismo documento. Dominio: interveningTeams; no reemplaza empresa/oficial/fechas por suborden en FieldAssignment. */
  @Column({ name: MtGridEventColumns.INTERVENING_TEAMS, type: 'clob', nullable: true })
  interveningTeams!: string | null;

  /////** FSD MT: Observaciones Encargado mesa regional. SOLO DE MT Origen: ingreso manual a nivel usuario; comentarios de la mesa regional. Persistencia: dato del caso en MT_GRID_EVENTS, distinto de OBSERVACIONES / NOTAS del seguimiento de la falla. Dominio: regionalDeskRemarks. */
  @Column({
    name: MtGridEventColumns.REGIONAL_DESK_REMARKS,
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  regionalDeskRemarks!: string | null;

  // Nota dominio: WorkOrder.executionRemarks existe hoy, pero el FSD MT ubica OBSERVACIONES / NOTAS bajo Seguimiento de la falla. Se sugiere moverlo al caso o removerlo de WorkOrder.
  /////** FSD MT: Seguimiento de la falla / OBSERVACIONES / NOTAS. Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en MT_GRID_EVENTS, distinto de Observaciones Encargado mesa regional y no dato de orden/suborden. Dominio actual: WorkOrder.executionRemarks; sugerido: propiedad case-level especifica. */
  @Column({ name: MtGridEventColumns.EXECUTION_REMARKS, type: 'clob', nullable: true })
  executionRemarks!: string | null;

  // Nota dominio: WorkOrder.municipalPermit existe hoy, pero el FSD MT ubica Permiso Municipal bajo Seguimiento de la falla. Se sugiere moverlo al caso o removerlo de WorkOrder.
  /////** FSD MT: Seguimiento de la falla / Permiso Municipal. Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en MT_GRID_EVENTS; no dato de orden/suborden. Dominio actual: WorkOrder.municipalPermit; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.MUNICIPAL_PERMIT,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  municipalPermit!: string | null;

  /////** FSD MT: Dano. Origen: carga manual. Dominio: damageByThirdParty. */
  @Column({
    name: MtGridEventColumns.DAMAGE_BY_THIRD_PARTY,
    type: 'number',
    precision: 1,
    nullable: true,
  })
  damageByThirdParty!: number | null;

  /////** FSD MT: Cantidad de fallas. Origen: ingreso manual a nivel usuario. Persistencia: dato del caso/falla en MT_GRID_EVENTS; no dato de orden/suborden. Dominio: failuresCount (FailuresCount), entero positivo cuando viene informado. En MT no derivar automaticamente desde confirmedFailures sin confirmacion de negocio. */
  @Column({ name: MtGridEventColumns.FAILURES_COUNT, type: 'number', nullable: true })
  failuresCount!: number | null;

  // TODO(Dominio): failureAddress hoy existe en WorkOrder, pero el FSD lo ubica bajo seguimiento de la falla/caso. Al alinear dominio, moverlo al caso si se confirma este ownership.
  /** FSD MT: Direccion de la falla. Origen: GeoCall (TDC), direccion en la que se encuentra la falla. No es dato SAP ni Nexus y no figura como ingreso manual; se hidrata desde integracion GeoCall/TDC. Persistencia: dato del caso/falla, no de cada orden/suborden. */
  @Column({
    name: MtGridEventColumns.FAILURE_ADDRESS,
    type: 'varchar2',
    length: 300,
    nullable: true,
  })
  failureAddress!: string | null;

  // TODO(Dominio): geoLocation hoy existe en WorkOrder, pero el FSD lo ubica bajo seguimiento de la falla/caso. Al alinear dominio, moverlo al caso si se confirma este ownership.
  /** FSD MT: Geolocalizacion (Falla). Origen: ingreso manual a nivel usuario bajo Seguimiento de la falla. No es dato SAP, Nexus ni GeoCall; persistencia: dato del caso/falla, no de cada orden/suborden. */
  @Column({
    name: MtGridEventColumns.GEO_LOCATION,
    type: 'varchar2',
    length: 100,
    nullable: true,
  })
  geoLocation!: string | null;

  /** FSD MT: TRANS (Termo). Origen: carga manual, editable en historico. Dominio: materialUsage.transformerThermo. */
  @Column({
    name: MtGridEventColumns.MATERIAL_TRANSFORMER_THERMO,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  materialTransformerThermo!: string | null;

  /** FSD MT: TRANS (Frio). Origen: carga manual, editable en historico. Dominio: materialUsage.transformerCold. */
  @Column({
    name: MtGridEventColumns.MATERIAL_TRANSFORMER_COLD,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  materialTransformerCold!: string | null;

  /** FSD MT: UNIPOLAR. Origen: carga manual, editable en historico. Dominio: materialUsage.unipolarCable. */
  @Column({
    name: MtGridEventColumns.MATERIAL_UNIPOLAR_CABLE,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  materialUnipolarCable!: string | null;

  /** FSD MT: TERMINAL. Origen: carga manual, editable en historico. Dominio: materialUsage.terminal. */
  @Column({
    name: MtGridEventColumns.MATERIAL_TERMINAL,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  materialTerminal!: string | null;

  /** FSD MT: TERNA (cantidad metros). Origen: carga manual, editable en historico. Dominio: materialUsage.ternaMeters. */
  @Column({ name: MtGridEventColumns.MATERIAL_TERNA_METERS, type: 'number', nullable: true })
  materialTernaMeters!: number | null;

  /** FSD MT: Criticidad. Origen: ingreso manual a nivel usuario mediante lista desplegable; nivel de atencion del caso en escala 1..4. Persistencia: numero en MT_GRID_EVENTS. Dominio: criticality (Criticality), valida entero entre 1 y 4. */
  @Column({ name: MtGridEventColumns.CRITICALITY, type: 'number', precision: 1, nullable: true })
  criticality!: number | null;

  /** FSD MT: Instalacion. Origen: Anomalia Nexus. Dominio: installation. */
  @Column({ name: MtGridEventColumns.INSTALLATION, type: 'varchar2', length: 20, nullable: true })
  installation!: string | null;

  /////** FSD MT: Tipo de Falla (elemento anomalo). Origen: carga manual. Dominio: failureType. */
  @Column({ name: MtGridEventColumns.FAILURE_TYPE, type: 'varchar2', length: 30, nullable: true })
  failureType!: string | null;

  // TODO(BA/SAP): confirmar si TCV_ORDEN_MT.TPLNR puede usarse como fallback para derivar Alimentador/S.E. cuando falte la Jerarquia Electrica. Hasta confirmarlo, TPLNR solo mapea a technicalLocation.
  // TODO(Dominio): WorkOrder.feeder/substation existen hoy, pero el FSD MT ubica Alimentador/S.E. en Datos de la anomalia/caso. Al alinear dominio, eliminar esos campos de WorkOrder salvo confirmacion de snapshot por orden.
  /** FSD MT: Datos de la anomalia / Alimentador. Origen: calculado desde MT_DOCUMENTS.ELECTRICAL_HIERARCHY (Jerarquia Electrica) y editable por usuario. Dominio correcto: MtInterventionCase.feeder. */
  @Column({ name: MtGridEventColumns.FEEDER, type: 'varchar2', length: 60, nullable: true })
  feeder!: string | null;

  /////** FSD MT: Datos de la anomalia / S.E. Origen: calculado desde Jerarquia Electrica y normalizado contra OMS como codigo de 3 digitos. Dominio correcto: MtInterventionCase.substation.code. */
  @Column({ name: MtGridEventColumns.SUBSTATION_CODE, type: 'varchar2', length: 3, nullable: true })
  substationCode!: string | null;

  /////** FSD MT: Datos de la anomalia / S.E. El FSD exige resolver el nombre oficial desde OMS usando la relacion COD + NOM. Origen: consulta/enriquecimiento OMS en Application/Infrastructure. Dominio correcto: MtInterventionCase.substation.name. */
  @Column({
    name: MtGridEventColumns.SUBSTATION_NAME,
    type: 'varchar2',
    length: 120,
    nullable: true,
  })
  substationName!: string | null;

  /** FSD MT: Responsable de entrega. Origen: ingreso manual a nivel usuario mediante lista desplegable; equipo/rol que entrega la instalacion para reparar (GRTC, AUTOENTREGA, SUPERVISOR, JEFE_DE_DPTO, OTROS). Persistencia: dato del caso MT en MT_GRID_EVENTS, no dato de orden/suborden ni dato automatico de GeoCall. Dominio: deliveryResponsibility.responsible. */
  @Column({
    name: MtGridEventColumns.DELIVERY_RESPONSIBLE_ROLE,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  deliveryResponsibleRole!: string | null;

  /** FSD MT: Responsable de entrega = OTROS. Origen: ingreso manual a nivel usuario; texto libre obligatorio cuando la lista cerrada no identifica al responsable concreto. Dominio: deliveryResponsibility.otherText. */
  @Column({
    name: MtGridEventColumns.DELIVERY_RESPONSIBLE_OTHER_TEXT,
    type: 'varchar2',
    length: 200,
    nullable: true,
  })
  deliveryResponsibleOtherText!: string | null;

  /** FSD MT: Tarea de Normalizacion. Origen: automatico segun aclaracion BA; referencia de la orden/suborden de normalizacion que el caso MT debe conocer. Debe guardar el numero concreto de suborden que pertenece a la etapa Normalizacion. No es la etapa de suborden, que se persiste en WorkOrder.stage. Formato esperado: Documento / Orden EAM, pendiente de validacion exacta en dominio. Dominio: pendiente de incorporar como normalizationTaskReference. */
  @Column({
    name: MtGridEventColumns.NORMALIZATION_TASK_REFERENCE,
    type: 'varchar2',
    length: 120,
    nullable: true,
  })
  normalizationTaskReference!: string | null;

  // Nota dominio: WorkOrder.protocolNumber/protocolStartedAt/protocolEndedAt existen hoy, pero el FSD MT ubica Protocolo como dato unico del detalle/caso en Gestion de orden de SAP, no como dato repetido por orden/suborden.
  /////** FSD MT: Gestion de orden de SAP / N Protocolo. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Numero de protocolo de entrega. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.protocolNumber; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.PROTOCOL_NUMBER,
    type: 'varchar2',
    length: 60,
    nullable: true,
  })
  protocolNumber!: string | null;

  /////** FSD MT: Gestion de orden de SAP / Inicio Protocolo. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Fecha de inicio del protocolo. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.protocolStartedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.PROTOCOL_STARTED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  protocolStartedAt!: DateTime | null;

  /////** FSD MT: Gestion de orden de SAP / Fin Protocolo. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Fecha de fin del protocolo. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.protocolEndedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.PROTOCOL_ENDED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  protocolEndedAt!: DateTime | null;

  // Nota dominio: WorkOrder.repairStartedAt/estimatedFinishedAt/actualFinishedAt existen hoy, pero el FSD MT ubica estas fechas bajo Fecha y hora de reparacion a nivel caso/falla.
  /////** FSD MT: Fecha y hora de reparacion / INICIO REPARACION. Origen/regla FSD: debe coincidir con Inicio Protocolo; no viene de integracion/robot como fecha independiente. A nivel negocio se considera la misma fecha de Inicio Protocolo. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.repairStartedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.REPAIR_STARTED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  repairStartedAt!: DateTime | null;

  /** FSD MT: Fecha y hora de reparacion / FECHA PREVISTA FINALIZACION. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.estimatedFinishedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.ESTIMATED_FINISHED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  estimatedFinishedAt!: DateTime | null;

  /** FSD MT: Fecha y hora de reparacion / REAL FINALIZACION. Origen: ingreso manual puro a nivel usuario; no viene de integracion/robot. Persistencia: dato del caso en MT_GRID_EVENTS. Dominio actual: WorkOrder.actualFinishedAt; sugerido: propiedad case-level especifica. */
  @Column({
    name: MtGridEventColumns.ACTUAL_FINISHED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  actualFinishedAt!: DateTime | null;

  /** FSD MT: visualizacion en negrita y proteccion de edicion manual. Origen: tecnico. Dominio: manualOverrides. */
  @Column({
    name: MtGridEventColumns.MANUAL_OVERRIDES,
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  manualOverrides!: string | null;

  /** FSD MT: fecha de borrado logico. Origen: tecnico de persistencia. Domain queda fuera de scope y se conserva sin cambios hasta conectar mapeo. */
  @Column({
    name: MtGridEventColumns.DELETED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  deletedAt!: DateTime | null;

  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: MtGridEventColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: MtGridEventColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /** FSD MT: metadata tecnica para concurrencia optimista del aggregate root. */
  @VersionColumn({ name: MtGridEventColumns.VERSION, type: 'number', default: 1 })
  version!: number;

  // ----------- RELACIONES ----------- //
  /** FSD MT: Documento. Origen: relacion tecnica opcional para casos con Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @ManyToOne(
    () => MtDocumentEntity,
    (document) => document.gridEvents,
    { nullable: true, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: MtGridEventColumns.DOCUMENT_ID, referencedColumnName: 'sid' })
  document?: MtDocumentEntity | null;

  /** FSD MT: validacion de no duplicados. Origen: relacion tecnica a claves calculadas. Dominio: uniquenessKeys. */
  @OneToMany(
    () => MtGridEventKeyEntity,
    (key) => key.gridEvent,
    { createForeignKeyConstraints: false },
  )
  keys?: MtGridEventKeyEntity[];

  /** FSD MT: ordenes y subordenes. Origen: relacion tecnica. Dominio: workOrders. */
  @OneToMany(
    () => MtWorkOrderEntity,
    (workOrder) => workOrder.gridEvent,
    { createForeignKeyConstraints: false },
  )
  workOrders?: MtWorkOrderEntity[];
}