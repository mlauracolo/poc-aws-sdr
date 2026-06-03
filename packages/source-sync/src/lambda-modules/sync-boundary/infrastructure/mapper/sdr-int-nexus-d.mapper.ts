import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntNexusD } from '@sdr/domain';
import { SdrIntNexusDTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/sdr-int-nexus-d.mapper';
import { SdrIntNexusDEntity } from '../adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity';

export function mapSdrIntNexusDEntityToDomain(
  entity: SdrIntNexusDEntity,
): Result<SdrIntNexusD, FieldError[]> {
  const result = SdrIntNexusDTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'sdr_int_nexus_d'),
  );
  return errorResult([mappingErrors]);
}
