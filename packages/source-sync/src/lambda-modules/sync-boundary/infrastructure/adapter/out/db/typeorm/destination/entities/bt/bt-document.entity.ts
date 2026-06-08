import type { DateTime } from '@pormeldev/axis-common-lib';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { oracleDateTimeTransformer } from '../../../transformer/oracle-date-time.transformer';
import { BtAffectedCustomersHistoryEntity } from './bt-affected-customer-history.entity';
import { BtGridEventEntity } from './bt-grid-event.entity';
import { BtTableNames } from '../../../bt-table-names.enum';
import { BtDocumentColumns } from '../../../fields/bt-document-columns.enum';

@Entity({ name: BtTableNames.DOCUMENTS })
@Index('UK_BT_DOCS_NEXUS_DOC', ['nexusDocumentNumber'], { unique: true })
@Index('IDX_BT_DOCS_REGION_AREA', ['region', 'operativeArea'])
export class BtDocumentEntity {
  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtDocumentColumns.ID, type: 'number' })
  sid!: number;

  /////** FSD BT #2 Documento. Origen: directo desde Documento Nexus. Dominio: references.nexusDocumentNumber. */
  @Column({ name: BtDocumentColumns.NEXUS_DOCUMENT_NUMBER, type: 'varchar2', length: 20 })
  nexusDocumentNumber!: string;

  /////** FSD BT #3 Inicio del corte. Origen: directo desde Documento Nexus. Dominio: cutStartAt. */
  @Column({
    name: BtDocumentColumns.CUT_START_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  cutStartAt!: DateTime | null;

  /////** FSD BT #1 Condiciones Climaticas. Origen: directo desde Documento Nexus o seleccion manual. Dominio: weatherCondition. */
  @Column({
    name: BtDocumentColumns.WEATHER_CONDITION,
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  weatherCondition!: string | null;

  /////** FSD BT: Region mencionada como filtro/agrupacion de area operativa. Origen: directo/derivado de geografia. Dominio: region. */
  @Column({ name: BtDocumentColumns.REGION, type: 'varchar2', length: 60, nullable: true })
  region!: string | null;

  /////** FSD BT #4 Area operativa. Origen: Documento Nexus o SAP Aviso. Dominio: operativeArea. */
  @Column({ name: BtDocumentColumns.OPERATIVE_AREA, type: 'varchar2', length: 60, nullable: true })
  operativeArea!: string | null;

  /////** FSD BT #5 Partido. Origen: Documento Nexus o SAP Aviso. Dominio: county. */
  @Column({ name: BtDocumentColumns.COUNTY, type: 'varchar2', length: 60, nullable: true })
  county!: string | null;

  /////** FSD BT #6 Localidad. Origen: Documento Nexus o SAP Aviso. Dominio: locality. */
  @Column({ name: BtDocumentColumns.LOCALITY, type: 'varchar2', length: 60, nullable: true })
  locality!: string | null;

  /////** FSD BT #8 Usuarios afectados inicialmente. Origen: calculado desde primer valor real del Documento Nexus. Dominio: initialAffectedCustomers del caso. */
  @Column({ name: BtDocumentColumns.INITIAL_AFFECTED_CUSTOMERS, type: 'number', nullable: true })
  initialAffectedCustomers!: number | null;

  /////** FSD BT #9 Usuarios Afectados Ahora. Origen: ultimo valor vigente del Documento Nexus. Dominio: affectedCustomers del caso. */
  @Column({ name: BtDocumentColumns.AFFECTED_CUSTOMERS, type: 'number', nullable: true })
  affectedCustomers!: number | null;

  /////** FSD BT #7 Cantidad Reclamos Totales. Origen: directo desde Documento Nexus. Dominio: totalClaimsCount. */
  @Column({ name: BtDocumentColumns.TOTAL_CLAIMS_COUNT, type: 'number', nullable: true })
  totalClaimsCount!: number | null;

  /////** FSD BT: fecha de borrado logico. Origen: tecnico de persistencia. Domain queda fuera de scope y se conserva sin cambios hasta conectar mapeo. */
  @Column({
    name: BtDocumentColumns.DELETED_AT,
    type: 'timestamp',
    nullable: true,
    transformer: oracleDateTimeTransformer,
  })
  deletedAt!: DateTime | null;

  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: BtDocumentColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /////** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: BtDocumentColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /////** FSD BT: relacion Documento -> registros/casos. Origen: relacion tecnica. Dominio: references.nexusDocumentNumber resuelve el documento. */
  @OneToMany(
    () => BtGridEventEntity,
    (gridEvent) => gridEvent.document,
    { createForeignKeyConstraints: false },
  )
  gridEvents?: BtGridEventEntity[];

  /////** FSD BT #9 grafico de afectados. Origen: relacion tecnica al historial automatico del documento. Dominio: affectedCustomersHistory compartido por casos del documento. */
  @OneToMany(
    () => BtAffectedCustomersHistoryEntity,
    (history) => history.document,
    { createForeignKeyConstraints: false },
  )
  affectedCustomersHistory?: BtAffectedCustomersHistoryEntity[];
}