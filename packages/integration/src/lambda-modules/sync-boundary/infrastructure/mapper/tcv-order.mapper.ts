import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrder } from '@sdr/domain';
import { TcvOrderEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-order.entity';
import { TcvOrderTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/tcv-order.mapper';

export function mapTcvOrderEntityToDomain(
  entity: TcvOrderEntity,
): Result<TcvOrder, FieldError[]> {
  const result = TcvOrderTypeOrmMapper.mapEntityToDomain(entity );

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error: { message: string; }) => new FieldError(error.message, 'tcv_order'),
  );
  return errorResult([mappingErrors]);
}
