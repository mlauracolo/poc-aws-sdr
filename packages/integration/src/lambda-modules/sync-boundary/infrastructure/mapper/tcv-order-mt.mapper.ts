import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrderMt } from '@sdr/domain';
import { TcvOrderMtTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/tcv-order-mt.mapper';
import { TcvOrderMtEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-order-mt.entity';

export function mapTcvOrderMtEntityToDomain(
  entity: TcvOrderMtEntity,
): Result<TcvOrderMt, FieldError[]> {
  const result = TcvOrderMtTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'tcv_order_mt'),
  );
  return errorResult([mappingErrors]);
}
