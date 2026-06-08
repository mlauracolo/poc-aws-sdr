import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { MtDocumentColumns } from "../../../fields/mt-documents-columns.enum";
import { MtTableNames } from "../../../schema/mt-table-names.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { MtAffectedCustomersHistoryEntity } from "./mt-affected-customers-history.entity";
import { MtGridEventEntity } from "./mt-grid-event.entity";

@Entity({ name: MtTableNames.DOCUMENTS })
@Index('UK_MT_DOCS_NEXUS_DOC', ['nexusDocumentNumber'], { unique: true })
@Index('IDX_MT_DOCS_REGION_AREA', ['region', 'operativeArea'])
export class MtDocumentEntity {
  /////** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: MtDocumentColumns.ID, type: 'number' })
  sid!: number;

  /////** FSD MT: Documento / Nro Documento Nexus. Origen: directo desde Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: MtDocumentColumns.NEXUS_DOCUMENT_NUMBER, type: 'varchar2', length: 20 })
  nexusDocumentNumber!: string;

  /////** FSD MT: INICIO del CORTE. Origen: directo desde Documento Nexus. Dominio: cutStartAt. */
  @Column({
    name: MtDocumentColumns.CUT_START_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  cutStartAt!: DateTime | null;

  /////** FSD MT: Clima / Condiciones Climaticas. Origen: directo desde Documento Nexus o seleccion manual. Dominio: weatherCondition. */
  @Column({
    name: MtDocumentColumns.WEATHER_CONDITION,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  weatherCondition!: string | null;

  /////** FSD MT: Region. Origen: directo/derivado de zona/partido. Dominio: region. */
  @Column({ name: MtDocumentColumns.REGION, type: 'varchar2', length: 60, nullable: true })
  region!: string | null;

  /////** FSD MT: Area Operativa (Zona). Origen: Documento Nexus. Dominio: operativeArea. */
  @Column({ name: MtDocumentColumns.OPERATIVE_AREA, type: 'varchar2', length: 60, nullable: true })
  operativeArea!: string | null;

  /////** FSD MT: Partido. Origen: Documento Nexus con fallback desde anomalia mas antigua. Dominio: county. */
  @Column({ name: MtDocumentColumns.COUNTY, type: 'varchar2', length: 60, nullable: true })
  county!: string | null;

  /////** FSD MT: Localidad. Origen: Documento Nexus con fallback desde anomalia mas antigua. Dominio: locality. */
  @Column({ name: MtDocumentColumns.LOCALITY, type: 'varchar2', length: 60, nullable: true })
  locality!: string | null;

  /////** FSD MT: Cantidad Afectados Inicio. Origen: calculado desde primer valor real del Documento Nexus. Dominio: initialAffectedCustomers del caso. */
  @Column({ name: MtDocumentColumns.INITIAL_AFFECTED_CUSTOMERS, type: 'number', nullable: true })
  initialAffectedCustomers!: number | null;

  /////** FSD MT: Cantidad Afectados Ahora. Origen: ultimo valor vigente del Documento Nexus. Dominio: affectedCustomers del caso. */
  @Column({ name: MtDocumentColumns.AFFECTED_CUSTOMERS, type: 'number', nullable: true })
  affectedCustomers!: number | null;

  /////** FSD MT: Jerarquia Electrica. Origen: directo desde Documento Nexus/frontera; no entra limpia al dominio. Dominio: sin equivalente directo, se usa para derivar feeder/substation antes de hidratar. */
  @Column({
    name: MtDocumentColumns.ELECTRICAL_HIERARCHY,
    type: 'varchar2',
    length: 500,
    nullable: true,
  })
  electricalHierarchy!: string | null;

  /////** FSD MT: Confirmar Falla. Aunque el FSD lo agrupa visualmente bajo Gestion de orden de SAP, el sistema de origen es Documento (Nexus) y en la frontera actual viene de SDR_INT_NEXUS_D.CONFIRMAR_FALLA. Persistencia: string crudo en MT_DOCUMENTS porque todavia no esta confirmado que significa IDMS, que formato real llega ni si los multiples elementos requieren normalizacion. Dominio: MtInterventionCase.confirmedFailure; el mapper futuro debe hidratarlo desde document.confirmedFailure. Si negocio/integracion confirma estructura propia, puede evolucionar a entidad de infraestructura. */
  @Column({
    name: MtDocumentColumns.CONFIRMED_FAILURE,
    type: 'varchar2',
    length: 1000,
    nullable: true,
  })
  confirmedFailure!: string | null;

  /////** FSD MT: fecha de borrado logico. Origen: tecnico de persistencia. Domain queda fuera de scope y se conserva sin cambios hasta conectar mapeo. */
  @Column({
    name: MtDocumentColumns.DELETED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  deletedAt!: DateTime | null;

  /////** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: MtDocumentColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /////** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: MtDocumentColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /////** FSD MT: relacion Documento -> registros/casos. Origen: relacion tecnica. Dominio: references.nexusDocumentNumber resuelve el documento. */
  @OneToMany(
    () => MtGridEventEntity,
    (gridEvent) => gridEvent.document,
    { createForeignKeyConstraints: false },
  )
  gridEvents?: MtGridEventEntity[];

  /////** FSD MT: grafico de Cantidad Afectados Ahora. Origen: relacion tecnica al historial automatico del documento. Dominio: affectedCustomersHistory compartido por casos del documento. */
  @OneToMany(
    () => MtAffectedCustomersHistoryEntity,
    (history) => history.document,
    { createForeignKeyConstraints: false },
  )
  affectedCustomersHistory?: MtAffectedCustomersHistoryEntity[];
}