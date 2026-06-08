import { Injectable } from '@nestjs/common';
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
import { GridEventApplicationErrorCode } from '../../../../../../application/error/grid-event-application-error-constants';
import { MtGridEventQueryError } from '../../../../../../application/error/mt-grid-event-query.error';
import { MtGridEventQueryPort } from '../../../../../../application/port/out/mt-grid-event/mt-grid-event-query.port';
import { MtGridEventListDto } from '../../../../../../application/query/find-mt-grid-events-by-query/mt-grid-event-list.dto';
import { MtGridEventListViewEntity } from '../views/mt/mt-grid-event-list-view.entity';
import { MtGridEventListViewMapper } from './mappers/mt-grid-event-list-view.mapper';

@Injectable()
export class MtGridEventQueryRepository implements MtGridEventQueryPort {
  private readonly queryRepo: BaseQueryRepository<
    MtGridEventListViewEntity,
    PartialProperties<MtGridEventListDto>,
    MtGridEventQueryError
  >;

  constructor(
    @InjectRepository(MtGridEventListViewEntity)
    private readonly mtGridEventListRepo: Repository<MtGridEventListViewEntity>,
  ) {
    this.queryRepo = new BaseQueryRepository<
      MtGridEventListViewEntity,
      PartialProperties<MtGridEventListDto>,
      MtGridEventQueryError
    >(this.mtGridEventListRepo);
  }

  async findByQuery(
    query: QueryDto,
  ): Promise<PagedResult<PartialProperties<MtGridEventListDto>[], MtGridEventQueryError>> {
    const result = await this.queryRepo.findByQuery(
      query,
      MtGridEventListViewMapper.entityToPartialDto,
    );

    if (result.ok) {
      return result;
    }

    return errorPagedResult(result.errors.map((error) => this.toMtGridEventQueryError(error)));
  }

  private toMtGridEventQueryError(error: unknown): MtGridEventQueryError {
    if (error instanceof MtGridEventQueryError) {
      return error;
    }

    if (error instanceof CodedInfrastructureError) {
      return new MtGridEventQueryError(error.message, error.field, error.code, error.context);
    }

    return new MtGridEventQueryError(
      error instanceof Error
        ? error.message
        : GridEventApplicationErrorCode.MT_GRID_EVENT_QUERY_UNEXPECTED.message,
      '*',
      GridEventApplicationErrorCode.MT_GRID_EVENT_QUERY_UNEXPECTED.code,
    );
  }
}