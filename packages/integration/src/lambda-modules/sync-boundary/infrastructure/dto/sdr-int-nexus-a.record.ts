export type SdrIntNexusARecord = {
  NRO_ANOMALIA: number;
  DOC_ID?: number | null;
  AVISO_OT?: number | null;
  STATE_ID?: number | null;
  DESC_ESTADO?: string | null;
  FECHA_DETECCION?: Date | string | null;
  INSTALACION?: string | null;
  DEVICE_ID?: number | null;
  OBS_ANOMALIA?: string | null;
  AREA_OP?: string | null;
  PARTIDO?: string | null;
  LOCALIDAD?: string | null;
  FEC_PROC: string;
};