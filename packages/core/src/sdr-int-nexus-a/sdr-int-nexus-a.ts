import { DateTime, FieldError, okResult, Result } from "@pormeldev/axis-common-lib";

export type SdrIntNexusAFullData = Readonly<{
  anomalyNumber: number;
  processDate: string;
  docId: number | null;
  otNotice: number | null;
  stateId: number | null;
  stateDescription: string | null;
  detectionDate: DateTime | null;
  installation: string | null;
  anomalyObservation: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}> 

export type SdrIntNexusAData = Readonly<{
  anomalyNumber: number;
  processDate: string;
  docId: number | null;
  otNotice: number | null;
  stateId: number | null;
  stateDescription: string | null;
  detectionDate: DateTime | null;
  installation: string | null;
  anomalyObservation: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}>;

export type SdrIntNexusACreateInput = Readonly<{
  anomalyNumber: number;
  processDate: string;
  docId: number | null;
  otNotice: number | null;
  stateId: number | null;
  stateDescription: string | null;
  detectionDate: DateTime | null;
  installation: string | null;
  anomalyObservation: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}>;

export type SdrIntNexusAUpdateInput = Readonly<Partial<SdrIntNexusAData>>;

export class SdrIntNexusA {
  private _errors: FieldError[] = [];

  private constructor(
    public _anomalyNumber: number,
    public _processDate: string,
    public _docId: number | null,
    public _otNotice: number | null,
    public _stateId: number | null,
    public _stateDescription: string | null,
    public _detectionDate: DateTime | null,
    public _installation: string | null,
    public _anomalyObservation: string | null,
    public _areaOp: string | null,
    public _county: string | null,
    public _locality: string | null
  ) {
    this._errors = [];
  }

  static create(params: SdrIntNexusACreateInput): Result<SdrIntNexusA, FieldError[]> {
    return okResult(
      new SdrIntNexusA(
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
        params.locality
      )
    )
  }

  static reconstitute(params: SdrIntNexusAFullData): Result<SdrIntNexusA, FieldError[]> {
    return okResult(
      new SdrIntNexusA(
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
        params.locality
      )
    );
  }

  public restore(): Result<void, FieldError[]> {
    return okResult(undefined);
  }

  public getAnomalyNumber(): number {
    return this._anomalyNumber;
  }

  public getProcessDate(): string {
    return this._processDate;
  }

  public getDocId(): number | null {
    return this._docId;
  }

  public getOtNotice(): number | null {
    return this._otNotice;
  }

  public getStateId(): number | null {
    return this._stateId;
  }

  public getStateDescription(): string | null {
    return this._stateDescription;
  }

  public getDetectionDate(): DateTime | null {
    return this._detectionDate;
  }

  public getInstallation(): string | null {
    return this._installation;
  }

  public getAnomalyObservation(): string | null {
    return this._anomalyObservation;
  }

  public getAreaOp(): string | null {
    return this._areaOp;
  }

  public getCounty(): string | null {
    return this._county;
  }

  public getLocality(): string | null {
    return this._locality;
  }
}