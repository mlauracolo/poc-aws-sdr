import { DateTime, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrderMappingError } from '../../../../../../common/application/error/tcv-order-bt-mapping.error';
import { TcvOrderEntity } from '../origin/entities/tcv-order.entity';
import { ApplicationTcvOrderDto, TcvOrderDtoParams } from '../../../../../../common/application/dto/application-tcv-order-bt.dto';
import { TcvOrder } from '@sdr/domain';

export class TcvOrderTypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      orderNumber: 'ORDEN_NRO',
      classOrder: 'ORDEN_CLASE',
      txtOrder: 'ORDEN_TXT',
      createdAt: 'FEC_CREACION',
      lastUpdatedDate: 'FEC_ULT_ACT',
      site: 'EMPLAZAMIENTO',
      status: 'ESTADO',
      hrText: 'HR_TEXT',
      parentOrder: 'ORDEN_PADRE',
      statusCode: 'STATUS',
      noticeNumber: 'AVISO_NRO',
      supOrder: 'ORDEN_SUP',
      visible: 'VISIBLE',
      tplnr: 'TPLNR',
      priority: 'PRIORIDAD',
      noticeArea: 'AREA_AVISO',
      divNotice: 'DIV_AVISO',
      county: 'PARTIDO',
      locality: 'LOCALIDAD',
      noticeDate: 'FEC_AVISO',
      priorNotice: 'PRIOR_AVISO',
      begru: 'FEC_BEGRU',
    };
  }

  static mapOracleToApplicationDto(
    oracleRow: Record<string, any>,
    timeZone?: string,
  ): Result<TcvOrderDtoParams, TcvOrderMappingError> {
    try {
      const dtoResult = ApplicationTcvOrderDto.create({
        orderNumber: String(oracleRow.ORDEN_NRO ?? ''),
        classOrder: this.toNullableString(oracleRow.ORDEN_CLASE),
        txtOrder: this.toNullableString(oracleRow.ORDEN_TXT),
        createdAt: oracleRow.FEC_CREACION ? new Date(oracleRow.FEC_CREACION) : null,
        lastUpdatedDate: oracleRow.FEC_ULT_ACT ? new Date(oracleRow.FEC_ULT_ACT) : null,
        site: this.toNullableString(oracleRow.EMPLAZAMIENTO),
        status: this.toNullableString(oracleRow.ESTADO),
        hrText: this.toNullableString(oracleRow.HR_TEXT),
        parentOrder: this.toNullableString(oracleRow.ORDEN_PADRE),
        statusCode: this.toNullableString(oracleRow.STATUS),
        noticeNumber: this.toNullableString(oracleRow.AVISO_NRO),
        supOrder: this.toNullableString(oracleRow.ORDEN_SUP),
        visible: this.toNullableString(oracleRow.VISIBLE),
        tplnr: this.toNullableString(oracleRow.TPLNR),
        priority: this.toNullableString(oracleRow.PRIORIDAD),
        noticeArea: this.toNullableString(oracleRow.AREA_AVISO),
        divNotice: this.toNullableString(oracleRow.DIV_AVISO),
        county: this.toNullableString(oracleRow.PARTIDO),
        locality: this.toNullableString(oracleRow.LOCALIDAD),
        noticeDate: oracleRow.FEC_AVISO ? new Date(oracleRow.FEC_AVISO) : null,
        priorNotice: this.toNullableString(oracleRow.PRIOR_AVISO),
        begru: this.toNullableString(oracleRow.FEC_BEGRU),
      });
      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new TcvOrderMappingError('Failed to map Oracle row to TcvOrderBt DTO', {
          oracleRow,
          timeZone,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(
    entity: TcvOrderEntity,
  ): Result<TcvOrder, TcvOrderMappingError> {
    const domainResult = TcvOrder.reconstitute({
      orderNumber: entity.orderNumber,
      classOrder: entity.classOrder,
      textOrder: entity.txtOrder,
      createdAt: this.toNullableDateTime(entity.createdAt),
      lastUpdatedDate: this.toNullableDateTime(entity.lastUpdatedDate),
      site: entity.site,
      status: entity.status,
      hrText: entity.hrText,
      parentOrder: entity.parentOrder,
      statusCode: entity.statusCode,
      noticeNumber: entity.noticeNumber,
      supOrder: entity.supOrder,
      visible: entity.visible,
      tplnr: entity.tplnr,
      priority: entity.priority,
      noticeArea: entity.noticeArea,
      divNotice: entity.divNotice,
      county: entity.county,
      locality: entity.locality,
      noticeDate: this.toNullableDateTime(entity.noticeDate),
      priorNotice: entity.priorNotice,
      begru: entity.begru,
      division: null,
      costCenter: null,
      position: null,
      eventDate: null
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new TcvOrderMappingError('Failed to map TcvOrderBt entity to domain', {
        errors: fieldErrors.map((error) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(
    domain: TcvOrder,
  ): Result<TcvOrderEntity, TcvOrderMappingError> {
    try {
      
      const entity = new TcvOrderEntity();
      entity.orderNumber = domain.getOrderNumber() ?? '';
      entity.classOrder = domain.getClassOrder() ?? null;
      entity.txtOrder = domain.getTextOrder() ?? null;
      entity.createdAt = this.toNullableDate(domain.getCreatedAt()) ?? new Date();
      entity.lastUpdatedDate = this.toNullableDate(domain.getLastUpdatedDate()) ?? new Date();
      entity.site = domain.getSite() ?? null;
      entity.status = domain.getStatus() ?? null;
      entity.hrText = domain.getHrText() ?? null;
      entity.parentOrder = domain.getParentOrder() ?? null;
      entity.statusCode = domain.getStatusCode() ?? null;
      entity.noticeNumber = domain.getNoticeNumber();
      entity.supOrder = domain.getSupOrder() ?? null;
      entity.visible = domain.getVisible() ?? null;
      entity.tplnr = domain.getTplnr() ?? null;
      entity.priority = domain.getPriority() ?? null;
      entity.noticeArea = domain.getNoticeArea() ?? null;
      entity.divNotice = domain.getNoticeDivision() ?? null;
      entity.county = domain.getCounty() ?? null;
      entity.locality = domain.getLocality() ?? null;
      entity.noticeDate = this.toNullableDate(domain.getNoticeDate()) ?? new Date();
      entity.priorNotice = domain.getPriorNotice() ?? null;
      entity.begru = domain.getBegru() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new TcvOrderMappingError('Failed to map TcvOrderBt domain to entity', {
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  private static toNullableString(value: unknown): string | null {
    return value === null || value === undefined ? null : String(value);
  }

  private static toNullableDateTime(value: Date | null): DateTime | null {
    return value ? DateTime.fromISO(value) : null;
  }

  private static toNullableDate(value: DateTime | null): Date | null {
    return value ? new Date(value.toISO()) : null;
  }

  private static toNullableDateTimeIso(value: unknown, timeZone?: string): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const dateTime = DateTime.fromISO(value as string | Date);
    return timeZone ? dateTime.toISOInZone(timeZone) : dateTime.toISO();
  }
}
