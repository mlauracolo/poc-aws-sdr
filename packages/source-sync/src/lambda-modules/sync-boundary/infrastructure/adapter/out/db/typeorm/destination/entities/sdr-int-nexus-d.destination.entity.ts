import { DateTime } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer } from '@pormeldev/axis-service-database-typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sdr_int_nexus_d', schema: 'sdr' })
export class SdrIntNexusDDestinationEntity {
  @PrimaryColumn({ 
    name: 'docId', 
    type: 'number' 
  })
  docId!: number;

  @PrimaryColumn({ 
    name: 'processDate', 
    type: 'varchar2', 
    length: 15 
  })
  processDate!: string;

  @Column({ 
    name: 'documentNumber', 
    type: 'varchar2', 
    length: 50, 
    nullable: true 
  })
  documentNumber!: string | null;

  @Column({ 
    name: 'type', 
    type: 'char', 
    length: 2, 
    nullable: true 
  })
  type!: string | null;

  @Column({ 
    name: 'lastStateId', 
    type: 'number', 
    nullable: true 
  })
  lastStateId!: number | null;

  @Column({ 
    name: 'COND_CLIMATICA', 
    type: 'varchar2', 
    length: 50, 
    nullable: true 
  })
  weatherCondition!: string | null;

  @Column({ 
    name: 'startCut', 
    type: 'date', 
    nullable: true,
    transformer: new DateTimeTransformer()
  })
  startCut!: DateTime | null;
  

  @Column({ 
    name: 'affectedInitial', 
    type: 'number', 
    nullable: true 
  })
  affectedInitial!: number | null;

  @Column({ 
    name: 'affectedNow', 
    type: 'number', 
    nullable: true 
  })
  affectedNow!: number | null;

  @Column({ 
    name: 'electricalHierarchy',
    type: 'varchar2', 
    length: 255, 
    nullable: true 
  })
  electricalHierarchy!: string | null;

  @Column({ 
    name: 'supply',
    type: 'varchar2', 
    length: 255, 
    nullable: true 
  })
  supply!: string | null;

  @Column({ 
    name: 'ssee', 
    type: 'varchar2', 
    length: 255, 
    nullable: true 
  })
  ssee!: string | null;

  @Column({ 
    name: 'confirmFailure', 
    type: 'varchar2', 
    length: 50, 
    nullable: true 
  })
  confirmFailure!: string | null;

  @Column({ 
    name: 'affectsSupply', 
    type: 'char', 
    length: 2, 
    nullable: true 
  })
  affectsSupply!: string | null;

  @Column({ 
    name: 'areaOp',
    type: 'varchar2', 
    length: 50,
    nullable: true 
  })
  areaOp!: string | null;

  @Column({ 
    name: 'county',
    type: 'varchar2',
    length: 50,
    nullable: true 
  })
  county!: string | null;

  @Column({ 
    name: 'locality',
    type: 'varchar2',
    length: 50,
    nullable: true 
  })
  locality!: string | null;
}