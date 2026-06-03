import { CodedApplicationError } from '@pormeldev/axis-common-lib';

export class SdrIntNexusAMappingError extends CodedApplicationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message, 
      '*',
      'SDR_INT_NEXUS_A_MAPPING_ERROR',
      context
    );
    this.name = 'SdrIntNexusAMappingError';
    Object.setPrototypeOf(this, SdrIntNexusAMappingError.prototype);
  }
}
