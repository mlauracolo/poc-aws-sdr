import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrder } from '@sdr/domain';
import { TcvOrderTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/tcv-order.mapper';
import { TcvOrderEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-order.entity';

export function mapTcvOrderEntityToDomain(
  entity: TcvOrderEntity,
): Result<TcvOrder, FieldError[]> {
  const result = TcvOrderTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = [result.errors].flat().map(
    (error: { message: string }) => new FieldError(error.message, 'tcv_order_bt'),
  );
  return errorResult([mappingErrors]);
}
