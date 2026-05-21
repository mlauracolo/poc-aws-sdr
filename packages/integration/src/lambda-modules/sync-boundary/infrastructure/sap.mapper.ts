
import { TcvAvisoRecord } from "./dto/tcv-aviso.record";
import { TcvOrdenRecord } from "./dto/tcv-orden.record";

export function mapTcvAvisoRecordToSapNotice(
  record: TcvAvisoRecord,
): SapNotice {
  return {
    noticeNumber: record.AVISO_NRO,
    noticeClass: record.AVISO_CLASE ?? null,
    noticeText: record.AVISO_TXT ?? null,
    priority: record.PRIORIDAD ?? null,
    createdAt: record.FEC_CREACION ?? null,
    orderNumber: record.ORDEN_NRO ?? null,
    tplnr: record.TPLNR ?? null,
    site: record.EMPLAZAMIENTO ?? null,
    area: record.AREA ?? null,
    division: record.DIVISION ?? null,
    adrnr: record.ADRNR ?? null,
    eventDate: record.FECHA ?? null,
    lastSapUpdateAt: record.FEC_ULT_SAP ?? null,
    closed: record.CERRADO ?? null,
    visible: record.VISIBLE ?? null,
    userGroup: record.BEGRU ?? null,
  };
}

export function mapTcvOrdenRecordToSapOrder(
  record: TcvOrdenRecord,
): SapOrder {
  return {
    orderNumber: record.ORDEN_NRO,
    orderClass: record.ORDEN_CLASE ?? null,
    orderText: record.ORDEN_TXT ?? null,
    createdAt: record.FEC_CREACION ?? null,
    lastUpdatedAt: record.FEC_ULT_ACT ?? null,
    site: record.EMPLAZAMIENTO ?? null,
    division: record.DIVISION ?? null,
    costCenter: record.C_COSTO ?? null,
    position: record.PUESTO ?? null,
    eventDate: record.FECHA ?? null,
    status: record.ESTADO ?? null,
    hrText: record.HR_TEXT ?? null,
    parentOrderNumber: record.ORDEN_PADRE ?? null,
    statusCode: record.STATUS ?? null,
    noticeNumber: record.AVISO_NRO ?? null,
    supervisorOrder: record.ORDEN_SUP ?? null,
    visible: record.VISIBLE ?? null,
    tplnr: record.TPLNR ?? null,
    priority: record.PRIORIDAD ?? null,
    noticeArea: record.AREA_AVISO ?? null,
    noticeDivision: record.DIV_AVISO ?? null,
    district: record.PARTIDO ?? null,
    location: record.LOCALIDAD ?? null,
    noticeEventDate: record.FEC_AVISO ?? null,
    noticePriority: record.PRIOR_AVISO ?? null,
    userGroup: record.BEGRU ?? null,
  };
}