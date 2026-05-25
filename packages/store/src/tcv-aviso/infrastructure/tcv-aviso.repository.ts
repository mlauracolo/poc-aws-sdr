import { Injectable } from "@nestjs/common";
import { TcvAvisoQueryPort } from "../application/port/tcv-aviso-query.port";

@Injectable()
export class TcvAvisoRepository implements TcvAvisoQueryPort {
}