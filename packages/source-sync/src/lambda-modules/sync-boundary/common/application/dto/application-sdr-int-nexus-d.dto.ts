import { okResult, Result } from '@pormeldev/axis-common-lib';
import { SdrIntNexusDMappingError } from '../error/sdr-int-nexus-d-mapping.error';

export interface SdrIntNexusDDtoParams {
  doc_id: number;
  process_date: string;
  document_number: string | null;
  type: string | null;
  last_state_id: number | null;
  weather_condition: string | null;
  start_cut: string | null;
  affected_initial: number | null;
  affected_now: number | null;
  electrical_hierarchy: string | null;
  supply: string | null;
  ssee: string | null;
  confirm_failure: string | null;
  affects_supply: string | null;
  area_op: string | null;
  county: string | null;
  locality: string | null;
}

export class ApplicationSdrIntNexusDDto {
  private constructor(
    public _docId: number,
    public _processDate: string,
    public _documentNumber: string | null,
    public _type: string | null,
    public _lastStateId: number | null,
    public _weatherCondition: string | null,
    public _startCut: string | null,
    public _affectedInitial: number | null,
    public _affectedNow: number | null,
    public _electricalHierarchy: string | null,
    public _supply: string | null,
    public _ssee: string | null,
    public _confirmFailure: string | null,
    public _affectsSupply: string | null,
    public _areaOp: string | null,
    public _county: string | null,
    public _locality: string | null,
  ) {}

  static create(
    params: SdrIntNexusDDtoParams,
  ): Result<ApplicationSdrIntNexusDDto, SdrIntNexusDMappingError> {
    return okResult(
      new ApplicationSdrIntNexusDDto(
        params.doc_id,
        params.process_date,
        params.document_number,
        params.type,
        params.last_state_id,
        params.weather_condition,
        params.start_cut,
        params.affected_initial,
        params.affected_now,
        params.electrical_hierarchy,
        params.supply,
        params.ssee,
        params.confirm_failure,
        params.affects_supply,
        params.area_op,
        params.county,
        params.locality,
      ),
    );
  }

  toParams(): SdrIntNexusDDtoParams {
    return {
      doc_id: this._docId,
      process_date: this._processDate,
      document_number: this._documentNumber,
      type: this._type,
      last_state_id: this._lastStateId,
      weather_condition: this._weatherCondition,
      start_cut: this._startCut,
      affected_initial: this._affectedInitial,
      affected_now: this._affectedNow,
      electrical_hierarchy: this._electricalHierarchy,
      supply: this._supply,
      ssee: this._ssee,
      confirm_failure: this._confirmFailure,
      affects_supply: this._affectsSupply,
      area_op: this._areaOp,
      county: this._county,
      locality: this._locality,
    };
  }
}
