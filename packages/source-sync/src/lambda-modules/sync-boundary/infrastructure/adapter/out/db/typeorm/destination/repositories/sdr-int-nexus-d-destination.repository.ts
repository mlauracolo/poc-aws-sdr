import { DataSource } from 'typeorm';
import { SdrIntNexusDDestinationEntity } from '../entities/sdr-int-nexus-d.destination.entity';

export class SdrIntNexusDDestinationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(entity: SdrIntNexusDDestinationEntity): Promise<void> {
    await this.dataSource.getRepository(SdrIntNexusDDestinationEntity).save(entity);
  }
}
  