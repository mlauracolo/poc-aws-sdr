import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { MtAffectedCustomersHistoryColumns } from "../../../fields/mt-affected-customers-history-columns.enum";
import { MtTableNames } from "../../../schema/mt-table-names.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { MtDocumentEntity } from "./mt-document.entity";

@Entity({ name: MtTableNames.AFFECTED_CUSTOMERS_HISTORY })
@Index('UK_MT_AFF_HIST_DOMAIN', ['id'], { unique: true })
@Index('IDX_MT_AFF_HIST_DOC_AT', ['documentSid', 'recordedAt'])
export class MtAffectedCustomersHistoryEntity {
  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: MtAffectedCustomersHistoryColumns.ID, type: 'number' })
  sid!: number;

  /** FSD MT: grafico de Cantidad Afectados Ahora. Origen: surrogate tecnico del punto historico. Dominio: affectedCustomersSnapshots[].id. */
  @Column({ name: MtAffectedCustomersHistoryColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /** FSD MT: Documento. Origen: relacion tecnica al documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: MtAffectedCustomersHistoryColumns.DOCUMENT_ID, type: 'number' })
  documentSid!: number;

  /** FSD MT: Cantidad Afectados Ahora. Origen: punto automatico del historial. Dominio: affectedCustomersSnapshots[].affectedCustomers. */
  @Column({ name: MtAffectedCustomersHistoryColumns.AFFECTED_CUSTOMERS, type: 'number' })
  affectedCustomers!: number;

  /** FSD MT: grafico de afectados, eje X hora de actualizacion. Origen: calculado al registrar medicion. Dominio: affectedCustomersSnapshots[].recordedAt. */
  @Column({
    name: MtAffectedCustomersHistoryColumns.RECORDED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  recordedAt!: DateTime;

  /** FSD MT: grafico de afectados. Origen: calculado; momento cero o variacion matematica. Dominio: affectedCustomersSnapshots[].reason. */
  @Column({ name: MtAffectedCustomersHistoryColumns.REASON, type: 'varchar2', length: 20 })
  reason!: string;

  /** FSD MT: grafico de afectados. Origen: tecnico; solo sistema automatico. Dominio: affectedCustomersSnapshots[].source. */
  @Column({ name: MtAffectedCustomersHistoryColumns.SOURCE, type: 'varchar2', length: 30 })
  source!: string;

  /** FSD MT: grafico de afectados. Origen: relacion tecnica al documento Nexus. Dominio: affectedCustomersHistory compartido por casos del documento. */
  @ManyToOne(
    () => MtDocumentEntity,
    (document) => document.affectedCustomersHistory,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({
    name: MtAffectedCustomersHistoryColumns.DOCUMENT_ID,
    referencedColumnName: 'sid',
  })
  document?: MtDocumentEntity;
}