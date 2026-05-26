import { DataSource } from 'typeorm';
import { TcvOrderEntity } from '../entities/tcv-order.entity';

// Acepta formato YYYYMMDD (8 chars) o YYYYMMDDHHMM (12 chars).
function toDate(cursor: string): Date {
  return new Date(Date.UTC(
    Number(cursor.slice(0, 4)),
    Number(cursor.slice(4, 6)) - 1,
    Number(cursor.slice(6, 8)),
    cursor.length >= 10 ? Number(cursor.slice(8, 10)) : 0,
    cursor.length >= 12 ? Number(cursor.slice(10, 12)) : 0,
  ));
}

export class TcvOrderOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<TcvOrderEntity[]> {
    return this.dataSource.getRepository(TcvOrderEntity).find();
  }

  /**
   * Devuelve órdenes cuya FEC_ULT_ACT cae dentro del rango [startDate, endDate].
   *
   * No hay patrón dedup porque el PK es simple (ORDEN_NRO).
   *
   * TODO(snapshot): cuando TCV_ORDEN reciba columna FEC_PROC, aplicar el mismo
   * patrón de dedup por (ORDEN_NRO, MAX(FEC_PROC)) que SDR_INT_NEXUS_*.
   *
   * SQL equivalente para probar en DBGate:
   *
   *   SELECT t.*
   *   FROM INTSDR.TCV_ORDEN t
   *   WHERE t.FEC_ULT_ACT BETWEEN TO_DATE('20250101', 'YYYYMMDD')
   *                           AND TO_DATE('20250526', 'YYYYMMDD')
   *   ORDER BY t.ORDEN_NRO
   */
  async findLatestInRange(startDate: string, endDate: string): Promise<TcvOrderEntity[]> {
    return this.dataSource
      .getRepository(TcvOrderEntity)
      .createQueryBuilder('t')
      .where('t.lastUpdatedDate BETWEEN :start AND :end', {
        start: toDate(startDate),
        end: toDate(endDate),
      })
      .getMany();
  }
}
