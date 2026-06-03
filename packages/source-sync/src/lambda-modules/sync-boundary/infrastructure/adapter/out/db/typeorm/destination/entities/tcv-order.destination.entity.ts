import { DateTime } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer } from '@pormeldev/axis-service-database-typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tcv_order', schema: 'sdr' })
export class TcvOrderDestinationEntity {
  @PrimaryColumn({ name: 'orderNumber', type: 'varchar2', length: 12 })
  orderNumber!: string;

  @Column({ name: 'classOrder', type: 'varchar2', length: 24, nullable: true })
  classOrder!: string | null;

  @Column({ name: 'txtOrder', type: 'varchar2', length: 40, nullable: true })
  txtOrder!: string | null;

  @Column({ name: 'createdAt', type: 'date', nullable: true, transformer: new DateTimeTransformer() })
  createdAt!: DateTime | null;

  @Column({ name: 'lastUpdatedDate', type: 'date', nullable: true, transformer: new DateTimeTransformer() })
  lastUpdatedDate!: DateTime | null;

  @Column({ name: 'site', type: 'varchar2', length: 10, nullable: true })
  site!: string | null;

  @Column({ name: 'status', type: 'varchar2', length: 18, nullable: true })
  status!: string | null;

  @Column({ name: 'hrText', type: 'varchar2', length: 50, nullable: true })
  hrText!: string | null;
  
  @Column({ name: 'parentOrder', type: 'varchar2', length: 12, nullable: true })
  parentOrder!: string | null;

  @Column({ name: 'statusCode', type: 'varchar2', length: 4, nullable: true })
  statusCode!: string | null;

  @Column({ name: 'noticeNumber', type: 'varchar2', length: 12, nullable: true })
  noticeNumber!: string | null;

  @Column({ name: 'supOrder', type: 'varchar2', length: 12, nullable: true })
  supOrder!: string | null;

  @Column({ name: 'visible', type: 'varchar2', length: 1, nullable: true })
  visible!: string | null;

  @Column({ name: 'tplnr', type: 'varchar2', length: 30, nullable: true })
  tplnr!: string | null;

  @Column({ name: 'priority', type: 'varchar2', length: 10, nullable: true })
  priority!: string | null;
  
  @Column({ name: 'noticeArea', type: 'varchar2', length: 3, nullable: true })
  noticeArea!: string | null;
  
  @Column({ name: 'divNotice', type: 'varchar2', length: 4, nullable: true })
  divNotice!: string | null;

  @Column({ name: 'county', type: 'varchar2', length: 30, nullable: true })
  county!: string | null;

  @Column({ name: 'locality', type: 'varchar2', length: 30, nullable: true })
  locality!: string | null;
  
  @Column({ name: 'noticeDate', type: 'date', nullable: true, transformer: new DateTimeTransformer() })
  noticeDate!: DateTime | null;

  @Column({ name: 'priorNotice', type: 'varchar2', length: 1, nullable: true })
  priorNotice!: string | null;

  @Column({ name: 'begru', type: 'varchar2', length: 2, nullable: true })
  begru!: string | null;
}