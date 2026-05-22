import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class TcvOrderBtMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'tcv_order_bt', 'TCV_ORDER_BT_MAPPING_ERROR', context);
    this.name = 'TcvOrderBtMappingError';
    Object.setPrototypeOf(this, TcvOrderBtMappingError.prototype);
  }
}
