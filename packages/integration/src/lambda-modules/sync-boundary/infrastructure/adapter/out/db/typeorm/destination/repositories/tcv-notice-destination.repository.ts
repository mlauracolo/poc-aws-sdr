import { DataSource } from 'typeorm';
import { TcvNoticeDestinationEntity } from '../entities/tcv-aviso.destination.entity';

export class TcvNoticeDestinationRepository {
  constructor(private readonly dataSource: DataSource) {}

  async save(entity: TcvNoticeDestinationEntity): Promise<void> {
    await this.dataSource.getRepository(TcvNoticeDestinationEntity).save(entity);
  }
}
