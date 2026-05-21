import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'SDR_INT_NEXUS_D' })
export class SdrIntNexusDEntity {
  @PrimaryColumn({ name: 'DOC_ID', type: 'number' })
  docId!: number;

  @PrimaryColumn({ name: 'FEC_PROC', type: 'varchar2', length: 15 })
  processDate!: string;

  @Column({ name: 'NRO_DOCUMENTO', type: 'varchar2', length: 50, nullable: true })
  documentNumber!: string | null;

  @Column({ name: 'TIPO', type: 'char', length: 2, nullable: true })
  type!: string | null;

  @Column({ name: 'LAST_STATE_ID', type: 'number', nullable: true })
  lastStateId!: number | null;

  @Column({ name: 'COND_CLIMATICA', type: 'varchar2', length: 50, nullable: true })
  weatherCondition!: string | null;

  @Column({ name: 'INICIO_CORTE', type: 'date', nullable: true })
  startCut!: Date | null;

  @Column({ name: 'AFECTADOS_INI', type: 'number', nullable: true })
  affectedInitial!: number | null;

  @Column({ name: 'AFECTADOS_AHORA', type: 'number', nullable: true })
  affectedNow!: number | null;

  @Column({ name: 'JERARQ_ELECTR', type: 'varchar2', length: 255, nullable: true })
  electricalHierarchy!: string | null;

  @Column({ name: 'ALIM', type: 'varchar2', length: 255, nullable: true })
  supply!: string | null;

  @Column({ name: 'SSEE', type: 'varchar2', length: 255, nullable: true })
  ssee!: string | null;

  @Column({ name: 'CONFIRMAR_FALLA', type: 'varchar2', length: 50, nullable: true })
  confirmFailure!: string | null;

  @Column({ name: 'AFECTA_SUMINISTRO', type: 'char', length: 2, nullable: true })
  affectsSupply!: string | null;

  @Column({ name: 'AREA_OP', type: 'varchar2', length: 50, nullable: true })
  areaOp!: string | null;

  @Column({ name: 'PARTIDO', type: 'varchar2', length: 50, nullable: true })
  county!: string | null;

  @Column({ name: 'LOCALIDAD', type: 'varchar2', length: 50, nullable: true })
  locality!: string | null;
}