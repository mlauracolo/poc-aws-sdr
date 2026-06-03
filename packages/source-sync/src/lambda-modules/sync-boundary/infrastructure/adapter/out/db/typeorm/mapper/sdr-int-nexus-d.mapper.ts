import { DateTime, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntNexusD } from '@sdr/domain';
import { ApplicationSdrIntNexusDDto, SdrIntNexusDDtoParams } from '../../../../../../common/application/dto/application-sdr-int-nexus-d.dto';
import { SdrIntNexusDMappingError } from '../../../../../../common/application/error/sdr-int-nexus-d-mapping.error';
import { SdrIntNexusDEntity } from '../origin/entities/sdr-int-nexus-d.entity';

export class SdrIntNexusDTypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      docId: 'DOC_ID',
      doc_id: 'DOC_ID',
      processDate: 'FEC_PROC',
      process_date: 'FEC_PROC',
      documentNumber: 'NRO_DOCUMENTO',
      document_number: 'NRO_DOCUMENTO',
      type: 'TIPO',
      lastStateId: 'LAST_STATE_ID',
      last_state_id: 'LAST_STATE_ID',
      weatherCondition: 'COND_CLIMATICA',
      weather_condition: 'COND_CLIMATICA',
      startCut: 'INICIO_CORTE',
      start_cut: 'INICIO_CORTE',
      affectedInitial: 'AFECTADOS_INI',
      affected_initial: 'AFECTADOS_INI',
      affectedNow: 'AFECTADOS_AHORA',
      affected_now: 'AFECTADOS_AHORA',
      electricalHierarchy: 'JERARQ_ELECTR',
      electrical_hierarchy: 'JERARQ_ELECTR',
      supply: 'ALIM',
      ssee: 'SSEE',
      confirmFailure: 'CONFIRMAR_FALLA',
      confirm_failure: 'CONFIRMAR_FALLA',
      affectsSupply: 'AFECTA_SUMINISTRO',
      affects_supply: 'AFECTA_SUMINISTRO',
      areaOp: 'AREA_OP',
      area_op: 'AREA_OP',
      county: 'PARTIDO',
      locality: 'LOCALIDAD',
    };
  }

  static mapOracleDBToApplicationDto(
    oracleRow: Record<string, any>,
    timeZone?: string,
  ): Result<SdrIntNexusDDtoParams, SdrIntNexusDMappingError> {
    try {
      const dtoResult = ApplicationSdrIntNexusDDto.create({
        doc_id: Number(oracleRow.DOC_ID),
        process_date: String(oracleRow.FEC_PROC ?? ''),
        document_number: this.toNullableString(oracleRow.NRO_DOCUMENTO),
        type: this.toNullableString(oracleRow.TIPO),
        last_state_id: this.toNullableNumber(oracleRow.LAST_STATE_ID),
        weather_condition: this.toNullableString(oracleRow.COND_CLIMATICA),
        start_cut: this.toNullableDateTimeIso(oracleRow.INICIO_CORTE, timeZone),
        affected_initial: this.toNullableNumber(oracleRow.AFECTADOS_INI),
        affected_now: this.toNullableNumber(oracleRow.AFECTADOS_AHORA),
        electrical_hierarchy: this.toNullableString(oracleRow.JERARQ_ELECTR),
        supply: this.toNullableString(oracleRow.ALIM),
        ssee: this.toNullableString(oracleRow.SSEE),
        confirm_failure: this.toNullableString(oracleRow.CONFIRMAR_FALLA),
        affects_supply: this.toNullableString(oracleRow.AFECTA_SUMINISTRO),
        area_op: this.toNullableString(oracleRow.AREA_OP),
        county: this.toNullableString(oracleRow.PARTIDO),
        locality: this.toNullableString(oracleRow.LOCALIDAD),
      });

      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new SdrIntNexusDMappingError('Failed to map Oracle row to SdrIntNexusD DTO', {
          oracleRow,
          timeZone,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(
    entity: SdrIntNexusDEntity,
  ): Result<SdrIntNexusD, SdrIntNexusDMappingError> {
    const domainResult = SdrIntNexusD.reconstitute({
      docId: entity.docId,
      processDate: entity.processDate,
      documentNumber: entity.documentNumber,
      type: entity.type,
      lastStateId: entity.lastStateId,
      weatherCondition: entity.weatherCondition,
      startCut: this.toNullableDateTime(entity.startCut),
      affectedInitial: entity.affectedInitial,
      affectedNow: entity.affectedNow,
      electricalHierarchy: entity.electricalHierarchy,
      supply: entity.supply,
      ssee: entity.ssee,
      confirmFailure: entity.confirmFailure,
      affectsSupply: entity.affectsSupply,
      areaOp: entity.areaOp,
      county: entity.county,
      locality: entity.locality,
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new SdrIntNexusDMappingError('Failed to map SdrIntNexusD entity to domain', {
        errors: fieldErrors.map((error) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(
    domain: SdrIntNexusD,
  ): Result<SdrIntNexusDEntity, SdrIntNexusDMappingError> {
    try {
      const entity = new SdrIntNexusDEntity();
      entity.docId = domain.getDocId() ?? 0;
      entity.processDate = domain.getProcessDate() ?? '';
      entity.documentNumber = domain.getDocumentNumber() ?? null;
      entity.type = domain.getType() ?? null;
      entity.lastStateId = domain.getLastStateId() ?? null;
      entity.weatherCondition = domain.getWeatherCondition() ?? null;
      entity.startCut = this.toNullableDate(domain.getStartCut());
      entity.affectedInitial = domain.getAffectedInitial() ?? null;
      entity.affectedNow = domain.getAffectedNow() ?? null;
      entity.electricalHierarchy = domain.getElectricalHierarchy() ?? null;
      entity.supply = domain.getSupply() ?? null;
      entity.ssee = domain.getSsee() ?? null;
      entity.confirmFailure = domain.getConfirmFailure() ?? null;
      entity.affectsSupply = domain.getAffectsSupply() ?? null;
      entity.areaOp = domain.getAreaOp() ?? null;
      entity.county = domain.getCounty() ?? null;
      entity.locality = domain.getLocality() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new SdrIntNexusDMappingError('Failed to map SdrIntNexusD domain to entity', {
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  private static toNullableNumber(value: unknown): number | null {
    return value === null || value === undefined ? null : Number(value);
  }

  private static toNullableString(value: unknown): string | null {
    return value === null || value === undefined ? null : String(value);
  }

  private static toNullableDateTime(value: Date | null): DateTime | null {
    return value ? DateTime.fromISO(value) : null;
  }

  private static toNullableDate(value: DateTime | null): Date | null {
    return value ? new Date(value.toISO()) : null;
  }

  private static toNullableDateTimeIso(value: unknown, timeZone?: string): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const dateTime = DateTime.fromISO(value as string | Date);
    return timeZone ? dateTime.toISOInZone(timeZone) : dateTime.toISO();
  }
}
