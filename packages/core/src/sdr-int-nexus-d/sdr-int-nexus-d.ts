import { DateTime, FieldError, okResult, Result } from "@pormeldev/axis-common-lib";

export type SdrIntNexusDFullData = Readonly<{
  docId: number;
  processDate: string;
  documentNumber: string | null;
  type: string | null;
  lastStateId: number | null;
  weatherCondition: string | null;
  startCut: DateTime | null;
  affectedInitial: number | null;
  affectedNow: number | null;
  electricalHierarchy: string | null;
  supply: string | null;
  ssee: string | null;
  confirmFailure: string | null;
  affectsSupply: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}>;

export type SdrIntNexusDData = Readonly<{
  docId: number;
  processDate: string;
  documentNumber: string | null;
  type: string | null;
  lastStateId: number | null;
  weatherCondition: string | null;
  startCut: DateTime | null;
  affectedInitial: number | null;
  affectedNow: number | null;
  electricalHierarchy: string | null;
  supply: string | null;
  ssee: string | null;
  confirmFailure: string | null;
  affectsSupply: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}>;

export type SdrIntNexusDCreateInput = Readonly<{
  docId: number;
  processDate: string;
  documentNumber: string | null;
  type: string | null;
  lastStateId: number | null;
  weatherCondition: string | null;
  startCut: DateTime | null;
  affectedInitial: number | null;
  affectedNow: number | null;
  electricalHierarchy: string | null;
  supply: string | null;
  ssee: string | null;
  confirmFailure: string | null;
  affectsSupply: string | null;
  areaOp: string | null;
  county: string | null;
  locality: string | null;
}>;

export type SdrIntNexusDUpdateInput = Readonly<Partial<SdrIntNexusDData>>;

export class SdrIntNexusD {
  private _errors: FieldError[] = [];

  private constructor(
    public _docId: number,
    public _processDate: string,
    public _documentNumber: string | null,
    public _type: string | null,
    public _lastStateId: number | null,
    public _weatherCondition: string | null,
    public _startCut: DateTime | null,
    public _affectedInitial: number | null,
    public _affectedNow: number | null,
    public _electricalHierarchy: string | null,
    public _supply: string | null,
    public _ssee: string | null,
    public _confirmFailure: string | null,
    public _affectsSupply: string | null,
    public _areaOp: string | null,
    public _county: string | null,
    public _locality: string | null
  ) {
    this._errors = [];
  }

  static create(params: SdrIntNexusDCreateInput): Result<SdrIntNexusD, FieldError[]> {
    return okResult(
      new SdrIntNexusD(
        params.docId,
        params.processDate,
        params.documentNumber,
        params.type,
        params.lastStateId,
        params.weatherCondition,
        params.startCut,
        params.affectedInitial,
        params.affectedNow,
        params.electricalHierarchy,
        params.supply,
        params.ssee,
        params.confirmFailure,
        params.affectsSupply,
        params.areaOp,
        params.county,
        params.locality
      )
    );
  }

  static reconstitute(params: SdrIntNexusDFullData): Result<SdrIntNexusD, FieldError[]> {
    return okResult(
      new SdrIntNexusD(
        params.docId,
        params.processDate,
        params.documentNumber,
        params.type,
        params.lastStateId,
        params.weatherCondition,
        params.startCut,
        params.affectedInitial,
        params.affectedNow,
        params.electricalHierarchy,
        params.supply,
        params.ssee,
        params.confirmFailure,
        params.affectsSupply,
        params.areaOp,
        params.county,
        params.locality
      )
    );
  }

  public restore(): Result<void, FieldError[]> {
    return okResult(undefined);
  }

  public getDocId(): number {
    return this._docId;
  }

  public getProcessDate(): string {
    return this._processDate;
  }

  public getDocumentNumber(): string | null {
    return this._documentNumber;
  }

  public getType(): string | null {
    return this._type;
  }

  public getLastStateId(): number | null {
    return this._lastStateId;
  }

  public getWeatherCondition(): string | null {
    return this._weatherCondition;
  }

  public getStartCut(): DateTime | null {
    return this._startCut;
  }

  public getAffectedInitial(): number | null {
    return this._affectedInitial;
  }

  public getAffectedNow(): number | null {
    return this._affectedNow;
  }

  public getElectricalHierarchy(): string | null {
    return this._electricalHierarchy;
  }

  public getSupply(): string | null {
    return this._supply;
  }

  public getSsee(): string | null {
    return this._ssee;
  }

  public getConfirmFailure(): string | null {
    return this._confirmFailure;
  }

  public getAffectsSupply(): string | null {
    return this._affectsSupply;
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

  public toSnapshot(): SdrIntNexusDFullData {
		return {
			docId: this._docId,
			processDate: this._processDate,
			documentNumber: this._documentNumber,
			type: this._type,
			lastStateId: this._lastStateId,
			weatherCondition: this._weatherCondition,
			startCut: this._startCut,
			affectedInitial: this._affectedInitial,
			affectedNow: this._affectedNow,
			electricalHierarchy: this._electricalHierarchy,
			supply: this._supply,
			ssee: this._ssee,
			confirmFailure: this._confirmFailure,
			affectsSupply: this._affectsSupply,
			areaOp: this._areaOp,
			county: this._county,
			locality: this._locality
		};
	}

}
