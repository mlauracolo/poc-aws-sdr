import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { BtWorkOrderEntity } from "./bt-work-order.entity";
import { BtFieldAssignmentColumns } from "../../../fields/bt-field-assignment-columns.enum";
import { BtTableNames } from "../../../bt-table-names.enum";

@Entity({ name: BtTableNames.FIELD_ASSIGNMENTS })
@Index('UK_BT_FA_DOMAIN', ['id'], { unique: true })
@Index('IDX_BT_FA_WO', ['workOrderSid'])
export class BtFieldAssignmentEntity {
  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: BtFieldAssignmentColumns.ID, type: 'number' })
  sid!: number;

  /** FSD BT: asignacion individual de empresa/oficial. Origen: identidad tecnica de dominio. Dominio: FieldAssignment.id. */
  @Column({ name: BtFieldAssignmentColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /** FSD BT #24/#27/#30 subordenes. Origen: relacion tecnica a la orden/suborden. Dominio: WorkOrder.assignments[]. */
  @Column({ name: BtFieldAssignmentColumns.WORK_ORDER_ID, type: 'number' })
  workOrderSid!: number;

  /** FSD BT #26/#29/#31 empresa por suborden. Origen: GeoCall TDC o carga manual. Dominio: FieldAssignment.company. */
  @Column({ name: BtFieldAssignmentColumns.COMPANY, type: 'varchar2', length: 120 })
  company!: string;

  /** FSD BT #25/#28/#32 oficial por suborden. Origen: GeoCall TDC o carga manual. Dominio: FieldAssignment.technician. */
  @Column({ name: BtFieldAssignmentColumns.TECHNICIAN, type: 'varchar2', length: 120 })
  technician!: string;

  /** FSD BT: fecha de inicio de asignacion por suborden. Origen: GeoCall TDC o carga manual. Dominio: FieldAssignment.startedAt. */
  @Column({
    name: BtFieldAssignmentColumns.STARTED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  startedAt!: DateTime;

  /** FSD BT: fecha de fin de asignacion por suborden. Origen: GeoCall TDC o carga manual. Dominio: FieldAssignment.endedAt. */
  @Column({
    name: BtFieldAssignmentColumns.ENDED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  endedAt!: DateTime;

  /** FSD BT: agregado manual de empresa/oficial. Origen: tecnico para distinguir alta manual. Dominio: FieldAssignment.manuallyAdded. */
  @Column({ name: BtFieldAssignmentColumns.MANUALLY_ADDED, type: 'number', precision: 1 })
  manuallyAdded!: number;

  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: BtFieldAssignmentColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /** FSD BT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: BtFieldAssignmentColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /** FSD BT: asignacion pertenece a una suborden. Origen: relacion tecnica. Dominio: WorkOrder.assignments. */
  @ManyToOne(
    () => BtWorkOrderEntity,
    (workOrder) => workOrder.assignments,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: BtFieldAssignmentColumns.WORK_ORDER_ID, referencedColumnName: 'sid' })
  workOrder?: BtWorkOrderEntity;
}