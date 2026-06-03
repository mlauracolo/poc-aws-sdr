import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TCV_ORDEN', schema: 'INTSDR' })
export class TcvOrderEntity {
  @PrimaryColumn({ name: 'ORDEN_NRO', type: 'varchar2', length: 12 })
  orderNumber!: string;

  @Column({ name: 'ORDEN_CLASE', type: 'varchar2', length: 24, nullable: true })
  classOrder!: string | null;

  @Column({ name: 'ORDEN_TXT', type: 'varchar2', length: 40, nullable: true })
  txtOrder!: string | null;

  @Column({ name: 'FEC_CREACION', type: 'date', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'FEC_ULT_ACT', type: 'date', nullable: true })
  lastUpdatedDate!: Date | null;

  @Column({ name: 'EMPLAZAMIENTO', type: 'varchar2', length: 10, nullable: true })
  site!: string | null;

  @Column({ name: 'ESTADO', type: 'varchar2', length: 18, nullable: true })
  status!: string | null;

  @Column({ name: 'HR_TEXT', type: 'varchar2', length: 50, nullable: true })
  hrText!: string | null;
  
  @Column({ name: 'ORDEN_PADRE', type: 'varchar2', length: 12, nullable: true })
  parentOrder!: string | null;

  @Column({ name: 'STATUS', type: 'varchar2', length: 4, nullable: true })
  statusCode!: string | null;

  @Column({ name: 'AVISO_NRO', type: 'varchar2', length: 12, nullable: false })
  noticeNumber!: string;

  @Column({ name: 'ORDEN_SUP', type: 'varchar2', length: 12, nullable: true })
  supOrder!: string | null;

  @Column({ name: 'VISIBLE', type: 'varchar2', length: 1, nullable: true })
  visible!: string | null;

  @Column({ name: 'TPLNR', type: 'varchar2', length: 30, nullable: true })
  tplnr!: string | null;

  @Column({ name: 'PRIORIDAD', type: 'varchar2', length: 10, nullable: true })
  priority!: string | null;
  
  @Column({ name: 'AREA_AVISO', type: 'varchar2', length: 3, nullable: true })
  noticeArea!: string | null;
  
  @Column({ name: 'DIV_AVISO', type: 'varchar2', length: 4, nullable: true })
  divNotice!: string | null;

  @Column({ name: 'PARTIDO', type: 'varchar2', length: 30, nullable: true })
  county!: string | null;

  @Column({ name: 'LOCALIDAD', type: 'varchar2', length: 30, nullable: true })
  locality!: string | null;
  
  @Column({ name: 'FEC_AVISO', type: 'date', nullable: true })
  noticeDate!: Date | null;

  @Column({ name: 'PRIOR_AVISO', type: 'varchar2', length: 1, nullable: true })
  priorNotice!: string | null;

  @Column({ name: 'BEGRU', type: 'varchar2', length: 2, nullable: true })
  begru!: string | null;
}