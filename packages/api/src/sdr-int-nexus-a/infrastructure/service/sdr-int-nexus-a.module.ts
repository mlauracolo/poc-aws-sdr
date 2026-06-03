import { Module } from "@nestjs/common";
import { SdrIntNexusAQueryRepository } from "./sdr-nexus-a-query.repository";
import { INT_NEXUS_A_QUERY_PORT } from "src/sdr-int-nexus-a/application/port/out/int-nexus-a.query.port";
import { SdrIntNexusAController } from "./sdr-int-nexus-a.controller";

@Module({
  controllers: [SdrIntNexusAController],
  providers: [
    {
      provide: INT_NEXUS_A_QUERY_PORT,
      useClass: SdrIntNexusAQueryRepository
    },
  ]
})

export class SdrIntNexusAModule {}