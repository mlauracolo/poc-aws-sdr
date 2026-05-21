export type TcvAvisoRecord = {
  AVISO_NRO: string;
  AVISO_CLASE?: string | null;
  AVISO_TXT?: string | null;
  PRIORIDAD?: string | null;
  FEC_CREACION?: Date | string | null;
  ORDEN_NRO?: string | null;
  TPLNR?: string | null;
  EMPLAZAMIENTO?: string | null;
  AREA?: string | null;
  DIVISION?: string | null;
  ADRNR?: string | null;
  FECHA?: Date | string | null;
  FEC_ULT_SAP?: Date | string | null;
  CERRADO?: string | null;
  VISIBLE?: string | null;
  BEGRU?: string | null;
};