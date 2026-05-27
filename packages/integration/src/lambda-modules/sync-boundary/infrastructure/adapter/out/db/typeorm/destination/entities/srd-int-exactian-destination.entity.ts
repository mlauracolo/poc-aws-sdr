import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'sdr_exactian_destination', schema: 'sdr' })
export class SdrIntExactianDestinationEntity {
  @PrimaryColumn({ name: 'CUIT', type: 'varchar2', length: 13 })
  cuit!: string;

  @Column({ name: 'CONTRACTOR_NAME', type: 'varchar2', length: 100, nullable: true })
  contractorName!: string | null;

  @Column({ name: 'CUIL', type: 'varchar2', length: 13, nullable: true })
  cuil!: string | null;
  
  @Column({ name: 'DNI', type: 'varchar2', length: 8, nullable: true })
  dni!: string | null;

  @Column({ name: 'NOMBRE', type: 'varchar2', length: 100, nullable: true })
  nombre!: string | null;

  @Column({ name: 'STATUS', type: 'varchar2', length: 10, nullable: true })
  status!: string | null;
}