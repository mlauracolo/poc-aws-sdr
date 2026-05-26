import { DateTime } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer } from '@pormeldev/axis-service-database-typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'tcv_notice', schema: 'sdr' })
export class TcvNoticeDestinationEntity {
  @PrimaryColumn({ name: 'noticeNumber', type: 'varchar2', length: 12 })
  noticeNumber!: string;

  @Column({ name: 'noticeClass', type: 'varchar2', length: 2, nullable: true })
  noticeClass!: string | null;

  @Column({ name: 'textNotice', type: 'varchar2', length: 40, nullable: true })
  textNotice!: string | null;

  @Column({ name: 'priority', type: 'varchar2', length: 1, nullable: true })
  priority!: string | null;

  @Column({
    name: 'createdAt', 
    type: 'date',
    nullable: true,
      transformer: new DateTimeTransformer()

  })
  createdAt!: DateTime | null;

  @Column({ name: 'orderNumber', type: 'varchar2', length: 12, nullable: true })
  orderNumber!: string | null;

  @Column({ name: 'tplnr', type: 'varchar2', length: 30, nullable: true })
  tplnr!: string | null;

  @Column({ name: 'site', type: 'varchar2', length: 10, nullable: true })
  site!: string | null;

  @Column({ name: 'area', type: 'varchar2', length: 3, nullable: true })
  area!: string | null;

  @Column({ name: 'division', type: 'varchar2', length: 4, nullable: true })
  division!: string | null;

  @Column({ name: 'adrNr', type: 'varchar2', length: 10, nullable: true })
  adrNr!: string | null;

  @Column({ 
    name: 'eventDate',
    type: 'date',
    nullable: false, 
    transformer: new DateTimeTransformer() 
  })
  eventDate!: DateTime;

  @Column({
    name: 'lastSapDate', 
    type: 'date',
    nullable: true,
    transformer: new DateTimeTransformer() 
  })
  lastSapDate!: DateTime | null;

  @Column({ name: 'closed', type: 'varchar2', length: 2, nullable: true })
  closed!: string | null;

  @Column({ name: 'visible', type: 'varchar2', length: 1, nullable: true })
  visible!: string | null;

  @Column({ name: 'begru', type: 'varchar2', length: 2, nullable: true })
  begru!: string | null;
}
