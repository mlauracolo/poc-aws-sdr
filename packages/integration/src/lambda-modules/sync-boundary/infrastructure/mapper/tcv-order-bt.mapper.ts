import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrderBt } from '@sdr/domain';
import { TcvOrderBtTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/tcv-order-bt.mapper';
import { TcvOrderBtEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-order-bt.entity';

export function mapTcvOrderBtEntityToDomain(
  entity: TcvOrderBtEntity,
): Result<TcvOrderBt, FieldError[]> {
  const result = TcvOrderBtTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'tcv_order_bt'),
  );
  return errorResult([mappingErrors]);
}
