import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TCV_ORDEN_MT' })
export class TcvOrderMtEntity {
  @PrimaryColumn({ name: 'ORDEN_NRO', type: 'varchar2', length: 12 })
  orderNumber!: string;

  @Column({ name: 'ORDEN_TXT', type: 'varchar2', length: 40, nullable: true })
  orderText!: string | null;

  @Column({ name: 'FEC_CREACION', type: 'date', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'FEC_ULT_ACT', type: 'date', nullable: true })
  lastUpdatedAt!: Date | null;

  @Column({ name: 'FECHA', type: 'date', nullable: true })
  eventDate!: Date | null;

  @Column({ name: 'ESTADO', type: 'varchar2', length: 18, nullable: true })
  status!: string | null;

  @Column({ name: 'HR_TEXT', type: 'varchar2', length: 40, nullable: true })
  hrText!: string | null;

  @Column({ name: 'ORDEN_PADRE', type: 'varchar2', length: 12, nullable: true })
  parentOrder!: string | null;

  @Column({ name: 'STATUS', type: 'varchar2', length: 4, nullable: true })
  statusCode!: string | null;

  @Column({ name: 'AVISO_NRO', type: 'varchar2', length: 12, nullable: true })
  noticeNumber!: string | null;

  @Column({ name: 'ORDEN_SUP', type: 'varchar2', length: 12, nullable: true })
  supOrder!: string | null;

  @Column({ name: 'VISIBLE', type: 'varchar2', length: 1, nullable: true })
  visible!: string | null;

  @Column({ name: 'TPLNR', type: 'varchar2', length: 30, nullable: true })
  tplnr!: string | null;

  @Column({ name: 'PRIORIDAD', type: 'varchar2', length: 10, nullable: true })
  priority!: string | null;

  @Column({ name: 'PARTIDO', type: 'varchar2', length: 30, nullable: true })
  county!: string | null;

  @Column({ name: 'LOCALIDAD', type: 'varchar2', length: 30, nullable: true })
  locality!: string | null;
}