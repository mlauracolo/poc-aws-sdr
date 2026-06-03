import { DataSource } from 'typeorm';
import { SdrIntExactianDestinationEntity } from '../entities/srd-int-exactian-destination.entity';

export class SdrIntExactianDestinationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(entity: SdrIntExactianDestinationEntity): Promise<void> {
    await this.dataSource.getRepository(SdrIntExactianDestinationEntity).save(entity);
  }
}
  