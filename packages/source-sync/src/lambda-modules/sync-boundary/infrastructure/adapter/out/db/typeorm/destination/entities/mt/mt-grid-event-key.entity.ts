import { PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { MtGridEventKeyColumns } from "../../../fields/mt-grid-event-key-columns.enum";
import { MtGridEventEntity } from "./mt-grid-event.entity";

export class MtGridEventKeyEntity {
  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: MtGridEventKeyColumns.ID, type: 'number' })
  sid!: number;

  /** FSD MT: reglas de no duplicidad. Origen: relacion tecnica al caso. Dominio: uniquenessKeys. */
  @Column({ name: MtGridEventKeyColumns.GRID_EVENT_ID, type: 'number' })
  gridEventSid!: number;

  /** FSD MT: reglas de unicidad por combinaciones/campos individuales. Origen: calculado por mapper. Dominio: InterventionUniquenessKeySet.keyName. */
  @Column({ name: MtGridEventKeyColumns.KEY_NAME, type: 'varchar2', length: 40 })
  keyName!: string;

  /** FSD MT: reglas de unicidad por combinaciones/campos individuales. Origen: calculado por mapper. Dominio: InterventionUniquenessKeySet.keyValue. */
  @Column({ name: MtGridEventKeyColumns.KEY_VALUE, type: 'varchar2', length: 120 })
  keyValue!: string;

  /** FSD MT: reglas de no duplicidad del registro. Origen: relacion tecnica. Dominio: uniquenessKeys asociados al aggregate. */
  @ManyToOne(
    () => MtGridEventEntity,
    (gridEvent) => gridEvent.keys,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: MtGridEventKeyColumns.GRID_EVENT_ID, referencedColumnName: 'sid' })
  gridEvent?: MtGridEventEntity;
}