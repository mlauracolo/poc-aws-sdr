import { DataSource } from 'typeorm';
import { TcvOrderDestinationEntity } from '../entities/tcv-order.destination.entity';

export class TcvOrderDestinationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(entity: TcvOrderDestinationEntity): Promise<void> {
    await this.dataSource.getRepository(TcvOrderDestinationEntity).save(entity);
  }

  
}
