import { TcvAvisoData } from "@sdr/domain";

export type { TcvAvisoData };

export abstract class TcvAvisoQueryPort {
  abstract findAll(): Promise<TcvAvisoData[]>;
}

export const TCV_AVISO_QUERY_PORT = Symbol("TCV_AVISO_QUERY_PORT");