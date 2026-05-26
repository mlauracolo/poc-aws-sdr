import { DataSource } from 'typeorm';
import { SdrIntNexusAEntity } from '../entities/sdr-int-nexus-a.entity';

export class SdrIntNexusAOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntNexusAEntity[]> {
    return this.dataSource.getRepository(SdrIntNexusAEntity).find();
  }

  /**
   * Devuelve el último snapshot (mayor FEC_PROC) por cada NRO_ANOMALIA
   * dentro del rango [startDate, endDate].
   *
   * Patrón: de todos los snapshots de una anomalía en el rango, solo
   * se retiene el de mayor FEC_PROC (el más reciente).
   *
   * SQL equivalente para probar en DBGate:
   *
   *   SELECT t.*
   *   FROM INTSDR.SDR_INT_NEXUS_A t
   *   WHERE (t.NRO_ANOMALIA, t.FEC_PROC) IN (
   *     SELECT sub.NRO_ANOMALIA, MAX(sub.FEC_PROC)
   *     FROM INTSDR.SDR_INT_NEXUS_A sub
   *     WHERE sub.FEC_PROC BETWEEN '20250101' AND '20250526'
   *     GROUP BY sub.NRO_ANOMALIA
   *   )
   *   ORDER BY t.NRO_ANOMALIA
   */
  async findLatestInRange(startDate: string, endDate: string): Promise<SdrIntNexusAEntity[]> {
    return this.dataSource
      .getRepository(SdrIntNexusAEntity)
      .createQueryBuilder('t')
      .where((qb: any) => {
        const sub = qb
          .subQuery()
          .select('sub.anomalyNumber')
          .addSelect('MAX(sub.processDate)', 'maxProcessDate')
          .from(SdrIntNexusAEntity, 'sub')
          .where('sub.processDate BETWEEN :start AND :end')
          .groupBy('sub.anomalyNumber')
          .getQuery();
        return `(t.anomalyNumber, t.processDate) IN ${sub}`;
      })
      .setParameters({ start: startDate, end: endDate })
      .getMany();
  }
}
