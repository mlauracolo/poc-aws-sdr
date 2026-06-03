import { DateTime } from '@pormeldev/axis-common-lib';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'SDR_INT_NEXUS_A', schema: 'INTSDR' })
export class SdrIntNexusAEntity {
  @PrimaryColumn({ name: 'NRO_ANOMALIA', type: 'number' })
  anomalyNumber!: number;

  @PrimaryColumn({ name: 'FEC_PROC', type: 'varchar2', length: 15 })
  processDate!: string;

  @Column({ name: 'DOC_ID', type: 'number', nullable: true })
  docId!: number | null;

  @Column({ name: 'AVISO_OT', type: 'number', nullable: true })
  otNotice!: number | null;

  @Column({ name: 'STATE_ID', type: 'number', nullable: true })
  stateId!: number | null;

  @Column({ name: 'DESCR_ESTADO', type: 'varchar2', length: 50, nullable: true })
  stateDescription!: string | null;

  @Column({ name: 'FECHA_DETECCION', type: 'date', nullable: true })
  detectionDate!: DateTime | null;

  @Column({ name: 'INSTALACION', type: 'varchar2', length: 50, nullable: true })
  installation!: string | null;

  @Column({ name: 'OBS_ANOMALIA', type: 'varchar2', length: 2000, nullable: true })
  anomalyObservation!: string | null;

  @Column({ name: 'AREA_OP', type: 'varchar2', length: 50, nullable: true })
  areaOp!: string | null;

  @Column({ name: 'PARTIDO', type: 'varchar2', length: 50, nullable: true })
  county!: string | null;

  @Column({ name: 'LOCALIDAD', type: 'varchar2', length: 50, nullable: true })
  locality!: string | null;
}