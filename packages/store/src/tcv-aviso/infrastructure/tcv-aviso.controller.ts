import { Get, Inject } from "@nestjs/common";
import { ApiJsonApiController } from "@pormeldev/axis-nestjs-common";
import { TCV_AVISO_QUERY_PORT, TcvAvisoQueryPort } from "../application/port/tcv-aviso-query.port";

@ApiJsonApiController("tcv-aviso")
export class TcvAvisoController {
  constructor(
    @Inject(TCV_AVISO_QUERY_PORT)
    private readonly query: TcvAvisoQueryPort,
  ) {}

  @Get("sample")
  async getSample() {
    return this.query.findAll();
  }
}