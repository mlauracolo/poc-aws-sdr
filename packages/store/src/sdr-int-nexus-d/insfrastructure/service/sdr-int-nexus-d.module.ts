import { Module } from "@nestjs/common";
import { SdrIntNexusDController } from "./sdr-int-nexus-d.controller";
import { INT_NEXUS_D_QUERY_PORT } from "src/sdr-int-nexus-d/application/port/out/sdr-int-nexus-d.query.port";
import { SdrIntNexusDRepository } from "./sdr-int-nexus-d.repository.port";

@Module({
  controllers: [SdrIntNexusDController],
  providers: [
    {
      provide: INT_NEXUS_D_QUERY_PORT,
      useClass: SdrIntNexusDRepository
    },
    // Here we can add more providers related to the SdrIntNexusD module, such as services, query or command handlers, etc.
  ]
})

export class SdrIntNexusDModule {}