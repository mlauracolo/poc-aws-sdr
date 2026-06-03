import { Module } from "@nestjs/common";
import { TcvAvisoController } from "./tcv-aviso.controller";
import { TcvAvisoRepository } from "./tcv-aviso.repository";
import { TCV_AVISO_QUERY_PORT } from "../application/port/tcv-aviso-query.port";

@Module({
  controllers: [TcvAvisoController],
  providers: [
    {
      provide: TCV_AVISO_QUERY_PORT,
      useClass: TcvAvisoRepository
    },
  ]
})

export class TcvAvisoModule {}