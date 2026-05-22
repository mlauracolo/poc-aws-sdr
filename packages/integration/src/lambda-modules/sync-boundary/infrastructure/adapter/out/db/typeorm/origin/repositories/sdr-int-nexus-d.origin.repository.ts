import { DataSource } from 'typeorm';
import { SdrIntNexusDEntity } from '../entities/sdr-int-nexus-d.entity';

export class SdrIntNexusDOriginRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<SdrIntNexusDEntity[]> {
    return this.dataSource.getRepository(SdrIntNexusDEntity).find();
  }
}
