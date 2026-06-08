import { Entity, Index, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BtGridEventEntity } from "./bt-grid-event.entity";
import { BtTableNames } from "../../../bt-table-names.enum";
import { BtGridEventKeyColumns } from "../../../fields/bt-grid-event-key-columns.enum";

@Entity({ name: BtTableNames.GRID_EVENT_KEYS })
@Index('UK_BT_GE_KEYS', ['keyName', 'keyValue'], { unique: true })
@Index('IDX_BT_GE_KEYS_GE', ['gridEventSid'])
export class BtGridEventKeyEntity {
  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtGridEventKeyColumns.ID, type: 'number' })
  sid!: number;

  /** FSD BT: regla de no duplicidad del registro. Origen: relacion tecnica al caso. Dominio: uniquenessKeys. */
  @Column({ name: BtGridEventKeyColumns.GRID_EVENT_ID, type: 'number' })
  gridEventSid!: number;

  /** FSD BT: regla de no duplicidad documento/anomalia/aviso. Origen: calculado por mapper. Dominio: InterventionUniquenessKeySet.keyName. */
  @Column({ name: BtGridEventKeyColumns.KEY_NAME, type: 'varchar2', length: 40 })
  keyName!: string;

  /** FSD BT: regla de no duplicidad documento/anomalia/aviso. Origen: calculado por mapper. Dominio: InterventionUniquenessKeySet.keyValue. */
  @Column({ name: BtGridEventKeyColumns.KEY_VALUE, type: 'varchar2', length: 120 })
  keyValue!: string;

  /** FSD BT: regla de no duplicidad del registro. Origen: relacion tecnica. Dominio: uniquenessKeys asociados al aggregate. */
  @ManyToOne(
    () => BtGridEventEntity,
    (gridEvent) => gridEvent.keys,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: BtGridEventKeyColumns.GRID_EVENT_ID, referencedColumnName: 'sid' })
  gridEvent?: BtGridEventEntity;
}