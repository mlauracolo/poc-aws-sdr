import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TCV_AVISO', schema: 'INTSDR' })
export class TcvAvisoEntity {
  @PrimaryColumn({ name: 'AVISO_NRO', type: 'varchar2', length: 12 })
  noticeNumber!: string;

  @Column({ name: 'AVISO_CLASE', type: 'varchar2', length: 2, nullable: true })
  noticeClass!: string | null;

  @Column({ name: 'AVISO_TXT', type: 'varchar2', length: 40, nullable: true })
  textNotice!: string | null;

  @Column({ name: 'PRIORIDAD', type: 'varchar2', length: 1, nullable: true })
  priority!: string | null;

  @Column({ name: 'FEC_CREACION', type: 'date', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'ORDEN_NRO', type: 'varchar2', length: 12, nullable: true })
  orderNumber!: string | null;

  @Column({ name: 'TPLNR', type: 'varchar2', length: 30, nullable: true })
  tplnr!: string | null;

  @Column({ name: 'EMPLAZAMIENTO', type: 'varchar2', length: 10, nullable: true })
  site!: string | null;

  @Column({ name: 'AREA', type: 'varchar2', length: 3, nullable: true })
  area!: string | null;

  @Column({ name: 'DIVISION', type: 'varchar2', length: 4, nullable: true })
  division!: string | null;

  @Column({ name: 'ADRNR', type: 'varchar2', length: 10, nullable: true })
  adrNr!: string | null;

  @Column({ name: 'FECHA', type: 'date', nullable: false })
  eventDate!: Date;

  @Column({ name: 'FEC_ULT_SAP', type: 'date', nullable: true })
  lastSapDate!: Date | null;

  @Column({ name: 'CERRADO', type: 'varchar2', length: 2, nullable: true })
  closed!: string | null;

  @Column({ name: 'VISIBLE', type: 'varchar2', length: 1, nullable: true })
  visible!: string | null;

  @Column({ name: 'BEGRU', type: 'varchar2', length: 2, nullable: true })
  begru!: string | null;
}
