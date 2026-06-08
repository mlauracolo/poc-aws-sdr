import { DateTime } from "@pormeldev/axis-common-lib";
import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { MtFieldAssignmentColumns } from "../../../fields/mt-field-assignment-columns.enum";
import { MtTableNames } from "../../../schema/mt-table-names.enum";
import { oracleDateTimeTransformer } from "../../../transformer/oracle-date-time.transformer";
import { MtWorkOrderEntity } from "./mt-work-order.entity";

@Entity({ name: MtTableNames.FIELD_ASSIGNMENTS })
@Index('UK_MT_FA_DOMAIN', ['id'], { unique: true })
@Index('IDX_MT_FA_WO', ['workOrderSid'])
export class MtFieldAssignmentEntity {
  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; PK surrogate de Oracle. */
  @PrimaryGeneratedColumn({ name: MtFieldAssignmentColumns.ID, type: 'number' })
  sid!: number;

  /** FSD MT: asignacion individual de empresa/oficial. Origen: identidad tecnica de dominio. Dominio: FieldAssignment.id. */
  @Column({ name: MtFieldAssignmentColumns.DOMAIN_ID, type: 'varchar2', length: 36 })
  id!: string;

  /** FSD MT: suborden/orden SAP. Origen: relacion tecnica a la orden/suborden. Dominio: WorkOrder.assignments[]. */
  @Column({ name: MtFieldAssignmentColumns.WORK_ORDER_ID, type: 'number' })
  workOrderSid!: number;

  /** FSD MT: Empresa por suborden, E.M. Deteccion Empresa o E.M. Normaliza Empresa segun etapa. Origen: GeoCall/frontera o carga manual. Dominio: FieldAssignment.company. */
  @Column({ name: MtFieldAssignmentColumns.COMPANY, type: 'varchar2', length: 120 })
  company!: string;

  /** FSD MT: Oficial por suborden, E.M. Deteccion Oficial o E.M. Normaliza Oficial segun etapa. Origen: GeoCall/frontera o carga manual. Dominio: FieldAssignment.technician. */
  @Column({ name: MtFieldAssignmentColumns.TECHNICIAN, type: 'varchar2', length: 120 })
  technician!: string;

  /** FSD MT: Fecha de inicio de tarea para el oficial de la suborden. Origen: GeoCall/frontera o carga manual. Dominio: FieldAssignment.startedAt. */
  @Column({
    name: MtFieldAssignmentColumns.STARTED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  startedAt!: DateTime;

  /** FSD MT: Fecha de fin de tarea para el oficial de la suborden. Origen: GeoCall/frontera o carga manual. Dominio: FieldAssignment.endedAt. */
  @Column({
    name: MtFieldAssignmentColumns.ENDED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  endedAt!: DateTime;

  /** FSD MT: agregado manual de empresa/oficial. Origen: tecnico para distinguir alta manual. Dominio: FieldAssignment.manuallyAdded. */
  @Column({ name: MtFieldAssignmentColumns.MANUALLY_ADDED, type: 'number', precision: 1 })
  manuallyAdded!: number;

  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; alta en persistencia. */
  @CreateDateColumn({
    name: MtFieldAssignmentColumns.CREATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  createdAt!: DateTime;

  /** FSD MT: sin campo de negocio. Origen: tecnico. Dominio: sin equivalente directo; ultima escritura en persistencia. */
  @UpdateDateColumn({
    name: MtFieldAssignmentColumns.UPDATED_AT,
    type: 'timestamp',
    transformer: oracleDateTimeTransformer,
  })
  updatedAt!: DateTime;

  /** FSD MT: asignacion pertenece a una suborden/orden. Origen: relacion tecnica. Dominio: WorkOrder.assignments. */
  @ManyToOne(
    () => MtWorkOrderEntity,
    (workOrder) => workOrder.assignments,
    { nullable: false, createForeignKeyConstraints: false },
  )
  @JoinColumn({ name: MtFieldAssignmentColumns.WORK_ORDER_ID, referencedColumnName: 'sid' })
  workOrder?: MtWorkOrderEntity;
}