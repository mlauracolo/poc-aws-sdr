import { Module } from "@nestjs/common";
import { SdrIntExactianQueryRepository } from "./sdr-int-exactian-query.repository";
import { SdrIntExactianController } from "./sdr-int-exactian.controller";
import { INT_EXACTIAN_QUERY_PORT } from "src/sdr-int-exactian/application/port/sdr-int-exactian-query.port";

@Module({
  controllers: [SdrIntExactianController],
  providers: [
    {
      provide: INT_EXACTIAN_QUERY_PORT,
      useClass: SdrIntExactianQueryRepository
    },
    // Here we can add more providers related to the SdrIntExactian module, such as services, query or command handlers, etc.
  ]
})

export class SdrIntExactianModule {}