import { DataSource } from 'typeorm';
import { SdrIntNexusDEntity } from '../entities/sdr-int-nexus-d.entity';

export class SdrIntNexusDOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntNexusDEntity[]> {
    return this.dataSource.getRepository(SdrIntNexusDEntity).find();
  }

  async findLatest(limit: number): Promise<SdrIntNexusDEntity[]> {
    return this.dataSource
      .getRepository(SdrIntNexusDEntity)
      .createQueryBuilder('t')
      .orderBy('t.processDate', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Devuelve el último snapshot (mayor FEC_PROC) por cada DOC_ID
   * dentro del rango [startDate, endDate].
   *
   * Patrón: de todos los snapshots de un documento en el rango, solo
   * se retiene el de mayor FEC_PROC (el más reciente).
   *
   * SQL equivalente para probar en DBGate:
   *
   *   SELECT t.*
   *   FROM INTSDR.SDR_INT_NEXUS_D t
   *   WHERE (t.DOC_ID, t.FEC_PROC) IN (
   *     SELECT sub.DOC_ID, MAX(sub.FEC_PROC)
   *     FROM INTSDR.SDR_INT_NEXUS_D sub
   *     WHERE sub.FEC_PROC BETWEEN '20250101' AND '20250526'
   *     GROUP BY sub.DOC_ID
   *   )
   *   ORDER BY t.DOC_ID
   */
  async findLatestInRange(startDate: string, endDate: string): Promise<SdrIntNexusDEntity[]> {
    return this.dataSource
      .getRepository(SdrIntNexusDEntity)
      .createQueryBuilder('t')
      .where((qb) => {
        const sub = qb
          .subQuery()
          .select('sub.docId')
          .addSelect('MAX(sub.processDate)', 'maxProcessDate')
          .from(SdrIntNexusDEntity, 'sub')
          .where('sub.processDate BETWEEN :start AND :end')
          .groupBy('sub.docId')
          .getQuery();
        return `(t.docId, t.processDate) IN ${sub}`;
      })
      .setParameters({ start: startDate, end: endDate })
      .getMany();
  }
}
