import { DataSource } from "typeorm";
import { SdrIntExactianEntity } from "../entities/sdr-int-exactian.entity";

export class SdrIntExactianRepository {
  constructor (private readonly dataSource: DataSource) {}
  
  async findAll(): Promise<SdrIntExactianEntity[]> {
    return this.dataSource.getRepository(SdrIntExactianEntity).find();
  }
}