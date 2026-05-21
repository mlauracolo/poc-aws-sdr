import { SdrIntNexusARecord } from "./dto/sdr-int-nexus-a.record";
import { SdrIntNexusDRecord } from "./dto/sdr-int-nexus-d.record";

export function mapSdrIntNexusARecordToNexusAnomaly(
  record: SdrIntNexusARecord,
): NexusAnomaly {
  return {
    anomalyNumber: record.NRO_ANOMALIA,
    documentId: record.DOC_ID ?? null,
    noticeOrOt: record.AVISO_OT ?? null,
    stateId: record.STATE_ID ?? null,
    statusDescription: record.DESC_ESTADO ?? null,
    detectionDate: record.FECHA_DETECCION ?? null,
    installation: record.INSTALACION ?? null,
    deviceId: record.DEVICE_ID ?? null,
    observation: record.OBS_ANOMALIA ?? null,
    operationalArea: record.AREA_OP ?? null,
    district: record.PARTIDO ?? null,
    location: record.LOCALIDAD ?? null,
    processedAtRaw: record.FEC_PROC,
  };
}

export function mapSdrIntNexusDRecordToNexusDocument(
  record: SdrIntNexusDRecord,
): NexusDocument {
  return {
    documentId: record.DOC_ID,
    documentNumber: record.NRO_DOCUMENTO ?? null,
    typeId: record.TYPE_ID ?? null,
    type: record.TIPO ?? null,
    lastStateId: record.LAST_STATE_ID ?? null,
    stateDescription: record.DESCR_ESTADO ?? null,
    automaticCondition: record.COND_CINUMATICA ?? null,
    cutStartDate: record.INICIO_CORTE ?? null,
    affectedCustomersInitial: record.AFECTADOS_INI ?? null,
    affectedCustomersNow: record.AFECTADOS_AHORA ?? null,
    totalClaims: record.CANT_RECLAMOS_TOT ?? null,
    electricalSupply: record.JERARQ_ELECTR ?? null,
    alimentador: record.ALIM ?? null,
    substation: record.SSE ?? null,
    confirmFailure: record.CONFIRMAR_FALLA ?? null,
    affectsSupply: record.AFECTA_SUMINISTRO ?? null,
    operationalArea: record.AREA_OP ?? null,
    district: record.PARTIDO ?? null,
    location: record.LOCALIDAD ?? null,
    domA: record.DOM_A ?? null,
    processedAtRaw: record.FEC_PROC,
  };
}