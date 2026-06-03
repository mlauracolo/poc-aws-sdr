import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class TcvAvisoMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'tcv_aviso', 'TCV_AVISO_MAPPING_ERROR', context);
    this.name = 'TcvAvisoMappingError';
    Object.setPrototypeOf(this, TcvAvisoMappingError.prototype);
  }
}
