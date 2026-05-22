import { DataSource } from 'typeorm';
import { TcvOrderBtEntity } from '../entities/tcv-order-bt.entity';

export class TcvOrderBtOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<TcvOrderBtEntity[]> {
    return this.dataSource.getRepository(TcvOrderBtEntity).find();
  }
}
