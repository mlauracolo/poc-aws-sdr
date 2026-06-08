import { InjectRepository } from '@nestjs/typeorm';
import {
  CodedInfrastructureError,
  errorPagedResult,
  PagedResult,
  PartialProperties,
  QueryDto,
} from '@pormeldev/axis-common-lib';
import { BaseQueryRepository } from '@pormeldev/axis-service-database-typeorm';
import { Repository } from 'typeorm';
import { BtGridEventQueryError } from '../../../../../../application/error/bt-grid-event-query.error';
import { GridEventApplicationErrorCode } from '../../../../../../application/error/grid-event-application-error-constants';
import { BtGridEventQueryPort } from '../../../../../../application/port/out/bt-grid-event/bt-grid-event-query.port';
import { BtGridEventListDto } from '../../../../../../application/query/find-bt-grid-events-by-query/bt-grid-event-list.dto';
import { BtGridEventListViewEntity } from '../views/bt/bt-grid-event-list-view.entity';
import { BtGridEventListViewMapper } from './mappers/bt-grid-event-list-view.mapper';

@Injectable()
export class BtGridEventQueryRepository implements BtGridEventQueryPort {
  private readonly queryRepo: BaseQueryRepository<
    BtGridEventListViewEntity,
    PartialProperties<BtGridEventListDto>,
    BtGridEventQueryError
  >;

  constructor(
    @InjectRepository(BtGridEventListViewEntity)
    private readonly btGridEventListRepo: Repository<BtGridEventListViewEntity>,
  ) {
    this.queryRepo = new BaseQueryRepository<
      BtGridEventListViewEntity,
      PartialProperties<BtGridEventListDto>,
      BtGridEventQueryError
    >(this.btGridEventListRepo);
  }

  async findByQuery(
    query: QueryDto,
  ): Promise<PagedResult<PartialProperties<BtGridEventListDto>[], BtGridEventQueryError>> {
    const result = await this.queryRepo.findByQuery(
      query,
      BtGridEventListViewMapper.entityToPartialDto,
    );

    if (result.ok) {
      return result;
    }

    return errorPagedResult(result.errors.map((error) => this.toBtGridEventQueryError(error)));
  }

  private toBtGridEventQueryError(error: unknown): BtGridEventQueryError {
    if (error instanceof BtGridEventQueryError) {
      return error;
    }

    if (error instanceof CodedInfrastructureError) {
      return new BtGridEventQueryError(error.message, error.field, error.code, error.context);
    }

    return new BtGridEventQueryError(
      error instanceof Error
        ? error.message
        : GridEventApplicationErrorCode.BT_GRID_EVENT_QUERY_UNEXPECTED.message,
      '*',
      GridEventApplicationErrorCode.BT_GRID_EVENT_QUERY_UNEXPECTED.code,
    );
  }
}