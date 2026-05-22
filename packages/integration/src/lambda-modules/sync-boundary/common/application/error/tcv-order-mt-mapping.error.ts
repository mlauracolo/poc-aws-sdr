import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class TcvOrderMtMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'tcv_order_mt', 'TCV_ORDER_MT_MAPPING_ERROR', context);
    this.name = 'TcvOrderMtMappingError';
    Object.setPrototypeOf(this, TcvOrderMtMappingError.prototype);
  }
}
