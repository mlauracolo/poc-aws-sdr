import { DataSource } from 'typeorm';
import { SdrIntNexusAEntity } from '../entities/sdr-int-nexus-a.entity';

export class SdrIntNexusAOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntNexusAEntity[]> {
    return this.dataSource.getRepository(SdrIntNexusAEntity).find();
  }
}
