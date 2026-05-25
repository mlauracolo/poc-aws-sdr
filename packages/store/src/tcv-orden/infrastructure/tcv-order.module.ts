import { Module } from "@nestjs/common";
import { TCV_ORDER_QUERY_PORT } from "src/tcv-orden/application/port/tcv-order-query.port";
import { TcvOrderQueryRepository } from "./tcv-order.repository";
import { TcvOrderController } from "./tcv-order.controller";

@Module({
  controllers: [TcvOrderController],
  providers: [
    {
      provide: TCV_ORDER_QUERY_PORT,
      useClass: TcvOrderQueryRepository
    },
  ]
})

export class TcvOrderModule {}