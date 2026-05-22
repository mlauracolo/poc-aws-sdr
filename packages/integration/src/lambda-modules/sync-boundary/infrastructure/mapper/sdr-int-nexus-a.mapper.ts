import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntNexusA } from '@sdr/domain';
import { SdrIntNexusATypeOrmMapper } from '../adapter/out/db/typeorm/mapper/sdr-int-nexus-a.mapper';
import { SdrIntNexusAEntity } from '../adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity';

export function mapSdrIntNexusAEntityToDomain(
  entity: SdrIntNexusAEntity,
): Result<SdrIntNexusA, FieldError[]> {
  const result = SdrIntNexusATypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'sdr_int_nexus_a'),
  );
  return errorResult([mappingErrors]);
}
