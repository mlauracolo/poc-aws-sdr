import { okResult, Result } from '@pormeldev/axis-common-lib';
import { SdrIntNexusAMappingError } from '../error/sdr-int-nexus-a-mapping.error';

export interface SdrIntNexusADtoParams {
  anomalyNumber: number;
  processDate: string;
  docId: number | null;
  otNotice: number | null;
  stateId: number | null;
  stateDescription: string | null;
  detectionDate: string | null;
  installation: string | null;
  anomalyObservation: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}

export class ApplicationSdrIntNexusADto {
  private constructor(
    public _anomalyNumber: number,
    public _processDate: string,
    public _docId: number | null,
    public _otNotice: number | null,
    public _stateId: number | null,
    public _stateDescription: string | null,
    public _detectionDate: string | null,
    public _installation: string | null,
    public _anomalyObservation: string | null,
    public _areaOp: string | null,
    public _county: string | null,
    public _locality: string | null,
  ) {}

  static create(
    params: SdrIntNexusADtoParams,
  ): Result<ApplicationSdrIntNexusADto, SdrIntNexusAMappingError> {
    return okResult(
      new ApplicationSdrIntNexusADto(
        params.anomalyNumber,
        params.processDate,
        params.docId,
        params.otNotice,
        params.stateId,
        params.stateDescription,
        params.detectionDate,
        params.installation,
        params.anomalyObservation,
        params.areaOp,
        params.county,
        params.locality,
      ),
    );
  }

  toParams(): SdrIntNexusADtoParams {
    return {
      anomalyNumber: this._anomalyNumber,
      processDate: this._processDate,
      docId: this._docId,
      otNotice: this._otNotice,
      stateId: this._stateId,
      stateDescription: this._stateDescription,
      detectionDate: this._detectionDate,
      installation: this._installation,
      anomalyObservation: this._anomalyObservation,
      areaOp: this._areaOp,
      county: this._county,
      locality: this._locality,
    };
  }
}
