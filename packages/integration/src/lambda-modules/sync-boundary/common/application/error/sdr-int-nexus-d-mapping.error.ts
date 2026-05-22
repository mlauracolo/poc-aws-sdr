import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class SdrIntNexusDMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'sdr_int_nexus_d', 'SDR_INT_NEXUS_D_MAPPING_ERROR', context);
    this.name = 'SdrIntNexusDMappingError';
    Object.setPrototypeOf(this, SdrIntNexusDMappingError.prototype);
  }
}
