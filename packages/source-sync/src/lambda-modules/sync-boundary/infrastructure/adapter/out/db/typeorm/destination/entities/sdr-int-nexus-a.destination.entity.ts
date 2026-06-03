import { DateTime } from '@pormeldev/axis-common-lib';
import { DateTimeTransformer } from '@pormeldev/axis-service-database-typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sdr_int_nexus_a', schema: 'sdr' })
export class SdrIntNexusADestEntity {
  @PrimaryColumn({ name: 'anomalyNumber', type: 'number' })
  anomalyNumber!: number;

  @PrimaryColumn({ name: 'processDate', type: 'char', length: 15 })
  processDate!: string;

  @Column({ name: 'docId', type: 'number', nullable: true })
  docId!: number | null;

  @Column({ name: 'avisoOt', type: 'number', nullable: true })
  avisoOt!: number | null;

  @Column({ name: 'stateId', type: 'number', nullable: true })
  stateId!: number | null;

  @Column({ name: 'stateDescription', type: 'varchar2', length: 50, nullable: true })
  stateDescription!: string | null;

  @Column({ 
    name: 'detectionDate', 
    type: 'date', 
    nullable: true,
    transformer: new DateTimeTransformer(),
  })
  detectionDate!: DateTime | null;

  @Column({ name: 'installation', type: 'varchar2', length: 50, nullable: true })
  installation!: string | null;

  @Column({ name: 'anomalyObservation', type: 'varchar2', length: 2000, nullable: true })
  anomalyObservation!: string | null;

  @Column({ name: 'areaOp', type: 'varchar2', length: 50, nullable: true })
  areaOp!: string | null;

  @Column({ name: 'county', type: 'varchar2', length: 50, nullable: true })
  county!: string | null;

  @Column({ name: 'locality', type: 'varchar2', length: 50, nullable: true })
  locality!: string | null;
}
