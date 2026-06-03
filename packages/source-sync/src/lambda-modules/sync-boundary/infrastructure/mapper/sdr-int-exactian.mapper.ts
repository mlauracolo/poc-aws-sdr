import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { SdrIntExactian } from '@sdr/domain';
import { SdrIntExactianTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/sdr-int-exactian.mapper';
import { SdrIntExactianEntity } from '../adapter/out/db/typeorm/origin/entities/sdr-int-exactian.entity';

export function mapSdrIntExactianEntityToDomain(
  entity: SdrIntExactianEntity,
): Result<SdrIntExactian, FieldError[]> {
  const result = SdrIntExactianTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'sdr_int_exactian'),
  );
  return errorResult([mappingErrors]);
}
