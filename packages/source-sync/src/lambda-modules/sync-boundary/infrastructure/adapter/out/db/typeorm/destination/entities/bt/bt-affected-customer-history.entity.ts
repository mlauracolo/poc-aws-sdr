import type { DateTime } from '@pormeldev/axis-common-lib';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BtDocumentEntity } from './bt-document.entity';

import { oracleDateTimeTransformer } from '../../../transformer/oracle-date-time.transformer';
import { BtTableNames } from '../../../bt-table-names.enum';
import { BtAffectedCustomersHistoryColumns } from '../../../fields/bt-affected-customer-history-columns-enum';

@Entity({ name: BtTableNames.AFFECTED_CUSTOMERS_HISTORY })
@Index('UK_BT_AFF_HIST_DOMAIN', ['id'], { unique: true })
@Index('IDX_BT_AFF_HIST_DOC_AT', ['documentSid', 'recordedAt'])
export class BtAffectedCustomersHistoryEntity {
  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtAffectedCustomersHistoryColumns.ID, type: 'number' })
  sid!: number;

  /** FSD BT #9 grafico de afectados. Origen: surrogate tecnico del punto historico. Dominio: affectedCustomersSnapshots[].id. */
  @Column({ name: BtAffectedCustomersHistoryColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /** FSD BT #2 Documento. Origen: relacion tecnica al documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: BtAffectedCustomersHistoryColumns.DOCUMENT_ID, type: 'number' })
  documentSid!: number;

  /** FSD BT #9 Usuarios Afectados Ahora. Origen: punto automatico del historial. Dominio: affectedCustomersSnapshots[].affectedCustomers. */
  @Column({ name: BtAffectedCustomersHistoryColumns.AFFECTED_CUSTOMERS, type: 'number' })
  affectedCustomers!: number;

  /** FSD BT #9 grafico de afectados. Origen: calculado al registrar una medicion automatica. Dominio: affectedCustomersSnapshots[].recordedAt. */
  @Column({
    name: BtAffectedCustomersHistoryColumns.RECORDED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  recordedAt!: DateTime;

  /** FSD BT #9 grafico de afectados. Origen: calculado; momento cero o variacion matematica. Dominio: affectedCustomersSnapshots[].reason. */
  @Column({ name: BtAffectedCustomersHistoryColumns.REASON, type: 'varchar2', length: 20 })
  reason!: string;

  /** FSD BT #9 grafico de afectados. Origen: tecnico; solo sistema automatico. Dominio: affectedCustomersSnapshots[].source. */
  @Column({ name: BtAffectedCustomersHistoryColumns.SOURCE, type: 'varchar2', length: 30 })
  source!: string;

  /** FSD BT #9 grafico de afectados. Origen: relacion tecnica al documento Nexus. Dominio: affectedCustomersHistory compartido por casos del documento. */
  @ManyToOne(
    () => BtDocumentEntity,
    (document) => document.affectedCustomersHistory,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({
    name: BtAffectedCustomersHistoryColumns.DOCUMENT_ID,
    referencedColumnName: 'sid',
  })
  document?: BtDocumentEntity;
}