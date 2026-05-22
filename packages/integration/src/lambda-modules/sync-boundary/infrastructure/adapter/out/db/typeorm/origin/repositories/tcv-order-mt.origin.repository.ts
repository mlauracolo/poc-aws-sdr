import { DataSource } from 'typeorm';
import { TcvOrderMtEntity } from '../entities/tcv-order-mt.entity';

export class TcvOrderMtOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<TcvOrderMtEntity[]> {
    return this.dataSource.getRepository(TcvOrderMtEntity).find();
  }
}
