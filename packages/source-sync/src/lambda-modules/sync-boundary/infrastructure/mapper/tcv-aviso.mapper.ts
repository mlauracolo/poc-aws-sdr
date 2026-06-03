import { FieldError, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvAviso } from '@sdr/domain';
import { TcvAvisoTypeOrmMapper } from '../adapter/out/db/typeorm/mapper/tcv-aviso.mapper';
import { TcvAvisoEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-aviso.entity';

export function mapTcvNoticeEntityToDomain(
  entity: TcvAvisoEntity,
): Result<TcvAviso, FieldError[]> {
  const result = TcvAvisoTypeOrmMapper.mapEntityToDomain(entity);

  if (result.ok) {
    return okResult(result.value);
  }

  const mappingErrors = result.errors.map(
    (error) => new FieldError(error.message, 'tcv_aviso'),
  );
  return errorResult([mappingErrors]);
}
