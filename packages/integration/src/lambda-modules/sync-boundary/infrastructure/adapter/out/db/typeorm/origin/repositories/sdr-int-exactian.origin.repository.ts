import { DataSource } from "typeorm";
import { SdrIntExactianEntity } from "../entities/sdr-int-exactian.entity";

export class SdrIntExactianRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntExactianEntity[]> {
    return this.dataSource.getRepository(SdrIntExactianEntity).find();
  }

  /**
   * SDR_INT_EXACTIAN no tiene columna de fecha/versión en el esquema actual,
   * por lo que no aplica el patrón snapshot. Se retorna la tabla completa.
   *
   * TODO(snapshot): cuando se agregue FEC_PROC a la entidad, aplicar el mismo
   * patrón de dedup por (clave_negocio, MAX(FEC_PROC)) que SDR_INT_NEXUS_*.
   */
  async findLatestInRange(startDate: string, endDate: string): Promise<SdrIntExactianEntity[]> {
    return this.dataSource
      .getRepository(SdrIntExactianEntity)
      .createQueryBuilder('t')
      .where((qb: any) => {
        const sub = qb
          .subQuery()
          .select('sub.anomalyNumber')
          .addSelect('MAX(sub.processDate)', 'maxProcessDate')
          .from(SdrIntExactianEntity, 'sub')
          .where('sub.processDate BETWEEN :start AND :end')
          .groupBy('sub.anomalyNumber')
          .getQuery();
        return `(t.anomalyNumber, t.processDate) IN ${sub}`;
      })
      .setParameters({ start: startDate, end: endDate })
      .getMany();
  }
}