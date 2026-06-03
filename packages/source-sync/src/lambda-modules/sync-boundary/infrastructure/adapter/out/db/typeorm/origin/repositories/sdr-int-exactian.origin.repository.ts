import { DataSource } from "typeorm";
import { SdrIntExactianEntity } from "../entities/sdr-int-exactian.entity";

export class SdrIntExactianRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntExactianEntity[]> {
    return this.dataSource.getRepository(SdrIntExactianEntity).find();
  }

  async findLatest(limit: number): Promise<SdrIntExactianEntity[]> {
    return this.dataSource
      .getRepository(SdrIntExactianEntity)
      .createQueryBuilder('t')
      .take(limit)
      .getMany();
  }

  /**
   * SDR_INT_EXACTIAN no tiene columna de fecha/versión en el esquema actual,
   * por lo que no aplica el patrón snapshot. Se retorna la tabla completa.
   *
   * TODO(snapshot): cuando se agregue FEC_PROC a la entidad, aplicar el mismo
   * patrón de dedup por (clave_negocio, MAX(FEC_PROC)) que SDR_INT_NEXUS_*.
   */
  async findLatestInRange(_startDate: string, _endDate: string): Promise<SdrIntExactianEntity[]> {
    // SDR_INT_EXACTIAN no tiene columna de fecha — se devuelven todos los registros.
    return this.dataSource.getRepository(SdrIntExactianEntity).find();
  }
}