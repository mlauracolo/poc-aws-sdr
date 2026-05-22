import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class SdrIntExactianMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'sdr_int_exactian', 'SDR_INT_EXACTIAN_MAPPING_ERROR', context);
    this.name = 'SdrIntExactianMappingError';
    Object.setPrototypeOf(this, SdrIntExactianMappingError.prototype);
  }
}
