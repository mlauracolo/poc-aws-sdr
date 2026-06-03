import { DataSource } from 'typeorm';
import { SdrIntNexusADestEntity } from '../entities/sdr-int-nexus-a.destination.entity';

export class SdrIntNexusADestinationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(entity: SdrIntNexusADestEntity): Promise<void> {
    await this.dataSource.getRepository(SdrIntNexusADestEntity).save(entity);
  }
}
