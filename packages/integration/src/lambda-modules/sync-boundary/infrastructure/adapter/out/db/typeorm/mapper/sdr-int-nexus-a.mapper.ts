import { DateTime, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntNexusA } from '@sdr/domain';
import { ApplicationSdrIntNexusADto, SdrIntNexusADtoParams } from '../../../../../../common/application/dto/application-sdr-int-nexus-a.dto';
import { SdrIntNexusAMappingError } from '../../../../../../common/application/error/sdr-int-nexus-a-mapping.error';
import { SdrIntNexusAEntity } from '../origin/entities/sdr-int-nexus-a.entity';

export class SdrIntNexusATypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      anomalyNumber: 'NRO_ANOMALIA',
      processDate: 'FEC_PROC',
      docId: 'DOC_ID',
      otNotice: 'AVISO_OT',
      stateId: 'STATE_ID',
      stateDescription: 'DESCR_ESTADO',
      detectionDate: 'FECHA_DETECCION',
      installation: 'INSTALACION',
      anomalyObservation: 'OBS_ANOMALIA',
      areaOp: 'AREA_OP',
      county: 'PARTIDO',
      locality: 'LOCALIDAD',
    };
  }

  static mapOracleDBToApplicationDto(
    oracleRow: Record<string, any>,
    timeZone?: string,
  ): Result<SdrIntNexusADtoParams, SdrIntNexusAMappingError> {
    try {
      const dtoResult = ApplicationSdrIntNexusADto.create({
        anomalyNumber: Number(oracleRow.NRO_ANOMALIA),
        processDate: String(oracleRow.FEC_PROC ?? ''),
        docId: Number(oracleRow.DOC_ID),
        otNotice: Number(oracleRow.AVISO_OT),
        stateId: Number(oracleRow.STATE_ID),
        stateDescription: String(oracleRow.DESCR_ESTADO),
        detectionDate: this.toNullableDateTimeIso(oracleRow.FECHA_DETECCION, timeZone),
        installation: String(oracleRow.INSTALACION),
        anomalyObservation: String(oracleRow.OBS_ANOMALIA),
        areaOp: String(oracleRow.AREA_OP),
        county: String(oracleRow.PARTIDO),
        locality: String(oracleRow.LOCALIDAD),
      });

      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new SdrIntNexusAMappingError('Failed to map Oracle row to SdrIntNexusA DTO', {
          oracleRow,
          timeZone,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(
    entity: SdrIntNexusAEntity,
  ): Result<SdrIntNexusA, SdrIntNexusAMappingError> {
    const domainResult = SdrIntNexusA.reconstitute({
      anomalyNumber: entity.anomalyNumber,
      processDate: entity.processDate,
      docId: entity.docId,
      otNotice: entity.otNotice,
      stateId: entity.stateId,
      stateDescription: entity.stateDescription,
      detectionDate: entity.detectionDate,
      installation: entity.installation,
      anomalyObservation: entity.anomalyObservation,
      areaOp: entity.areaOp,
      county: entity.county,
      locality: entity.locality,
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new SdrIntNexusAMappingError('Failed to map SdrIntNexusA entity to domain', {
        errors: fieldErrors.map((error) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(
    domain: SdrIntNexusA,
  ): Result<SdrIntNexusAEntity, SdrIntNexusAMappingError> {
    try {
      const entity = new SdrIntNexusAEntity();
      entity.anomalyNumber = domain.getAnomalyNumber() ?? 0;
      entity.processDate = domain.getProcessDate() ?? '';
      entity.docId = domain.getDocId() ?? null;
      entity.otNotice = domain.getOtNotice() ?? null;
      entity.stateId = domain.getStateId() ?? null;
      entity.stateDescription = domain.getStateDescription() ?? null;
      entity.detectionDate = domain.getDetectionDate() ?? null;
      entity.installation = domain.getInstallation() ?? null;
      entity.anomalyObservation = domain.getAnomalyObservation() ?? null;
      entity.areaOp = domain.getAreaOp() ?? null;
      entity.county = domain.getCounty() ?? null;
      entity.locality = domain.getLocality() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new SdrIntNexusAMappingError('Failed to map SdrIntNexusA domain to entity', {
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  private static toNullableDateTimeIso(value: unknown, timeZone?: string): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const dateTime = DateTime.fromISO(value as string | Date);
    return timeZone ? dateTime.toISOInZone(timeZone) : dateTime.toISO();
  }
}
