import { Column, Entity } from 'typeorm';

@Entity({ name: 'SDR_INT_EXACTIAN', schema: 'INTSDR' })
export class SdrIntExactianEntity {
  @Column({ name: 'CUIT', type: 'varchar2', length: 13, nullable: true })
  cuit!: string | null;

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