import { Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntExactian } from '@sdr/domain';
import { ApplicationSdrIntExactianDto, SdrIntExactianDtoParams } from '../../../../../../common/application/dto/application-sdr-int-exactian.dto';
import { SdrIntExactianMappingError } from '../../../../../../common/application/error/sdr-int-exactian-mapping.error';
import { SdrIntExactianEntity } from '../origin/entities/sdr-int-exactian.entity';

export class SdrIntExactianTypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      cuit: 'CUIT',
      contractorName: 'CONTRACTOR_NAME',
      contractor_name: 'CONTRACTOR_NAME',
      cuil: 'CUIL',
      dni: 'DNI',
      nombre: 'NOMBRE',
      status: 'STATUS',
    };
  }

  static mapOracleDBToApplicationDto(
    oracleRow: Record<string, any>,
  ): Result<SdrIntExactianDtoParams, SdrIntExactianMappingError> {
    try {
      const dtoResult = ApplicationSdrIntExactianDto.create({
        cuit: this.toNullableString(oracleRow.CUIT),
        contractor_name: this.toNullableString(oracleRow.CONTRACTOR_NAME),
        cuil: this.toNullableString(oracleRow.CUIL),
        dni: this.toNullableString(oracleRow.DNI),
        nombre: this.toNullableString(oracleRow.NOMBRE),
        status: this.toNullableString(oracleRow.STATUS),
      });

      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new SdrIntExactianMappingError('Failed to map Oracle row to SdrIntExactian DTO', {
          oracleRow,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(
    entity: SdrIntExactianEntity,
  ): Result<SdrIntExactian, SdrIntExactianMappingError> {
    const domainResult = SdrIntExactian.reconstitute({
      cuit: entity.cuit,
      contractorName: entity.contractorName,
      cuil: entity.cuil,
      dni: entity.dni,
      nombre: entity.nombre,
      status: entity.status,
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new SdrIntExactianMappingError('Failed to map SdrIntExactian entity to domain', {
        errors: fieldErrors.map((error: { message: string }) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(
    domain: SdrIntExactian,
  ): Result<SdrIntExactianEntity, SdrIntExactianMappingError> {
    try {
      const entity = new SdrIntExactianEntity();
      entity.cuit = domain.getCuit() ?? null;
      entity.contractorName = domain.getContractorName() ?? null;
      entity.cuil = domain.getCuil() ?? null;
      entity.dni = domain.getDni() ?? null;
      entity.nombre = domain.getNombre() ?? null;
      entity.status = domain.getStatus() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new SdrIntExactianMappingError('Failed to map SdrIntExactian domain to entity', {
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  private static toNullableString(value: unknown): string | null {
    return value === null || value === undefined ? null : String(value);
  }
}
