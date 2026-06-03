import { Injectable } from "@nestjs/common";
import { TcvAvisoData, TcvAvisoQueryPort } from "../application/port/tcv-aviso-query.port";

@Injectable()
export class TcvAvisoRepository implements TcvAvisoQueryPort {
  async findAll(): Promise<TcvAvisoData[]> {
    return [
      {
        noticeNumber: "AV-001",
        noticeClass: "M1",
        textNotice: "Aviso de corte programado",
        priority: "1",
        createdAt: null,
        orderNumber: "ORD-001",
        tplnr: null,
        site: "SITE-A",
        area: "AREA-1",
        division: "DIV-01",
        adrNr: null,
        eventDate: null,
        lastSapDate: null,
        closed: "N",
        visible: "Y",
        begru: null,
      },
      {
        noticeNumber: "AV-002",
        noticeClass: "M2",
        textNotice: "Aviso de reparación urgente",
        priority: "2",
        createdAt: null,
        orderNumber: "ORD-002",
        tplnr: null,
        site: "SITE-B",
        area: "AREA-2",
        division: "DIV-02",
        adrNr: null,
        eventDate: null,
        lastSapDate: null,
        closed: "N",
        visible: "Y",
        begru: null,
      },
    ];
  }
}