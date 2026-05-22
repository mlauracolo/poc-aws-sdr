import { DateTime, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { TcvOrderBt } from '@sdr/domain';
import { ApplicationTcvOrderBtDto, TcvOrderBtDtoParams } from '../../../../../../common/application/dto/application-tcv-order-bt.dto';
import { TcvOrderBtMappingError } from '../../../../../../common/application/error/tcv-order-bt-mapping.error';
import { TcvOrderBtEntity } from '../origin/entities/tcv-order-bt.entity';

export class TcvOrderBtTypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      orderNumber: 'ORDEN_NRO',
      order_number: 'ORDEN_NRO',
      textOrder: 'ORDEN_TXT',
      text_order: 'ORDEN_TXT',
      createdAt: 'FEC_CREACION',
      created_at: 'FEC_CREACION',
      lastUpdatedDate: 'FEC_ULT_ACT',
      last_updated_date: 'FEC_ULT_ACT',
      eventDate: 'FECHA',
      event_date: 'FECHA',
      status: 'ESTADO',
      hrText: 'HR_TEXT',
      hr_text: 'HR_TEXT',
      parentOrder: 'ORDEN_PADRE',
      parent_order: 'ORDEN_PADRE',
      statusCode: 'STATUS',
      status_code: 'STATUS',
      noticeNumber: 'AVISO_NRO',
      notice_number: 'AVISO_NRO',
      supOrder: 'ORDEN_SUP',
      sup_order: 'ORDEN_SUP',
      visible: 'VISIBLE',
      tplnr: 'TPLNR',
      priority: 'PRIORIDAD',
      county: 'PARTIDO',
      locality: 'LOCALIDAD',
    };
  }

  static mapOracleDBToApplicationDto(
    oracleRow: Record<string, any>,
    timeZone?: string,
  ): Result<TcvOrderBtDtoParams, TcvOrderBtMappingError> {
    try {
      const dtoResult = ApplicationTcvOrderBtDto.create({
        order_number: String(oracleRow.ORDEN_NRO ?? ''),
        text_order: this.toNullableString(oracleRow.ORDEN_TXT),
        created_at: this.toNullableDateTimeIso(oracleRow.FEC_CREACION, timeZone),
        last_updated_date: this.toNullableDateTimeIso(oracleRow.FEC_ULT_ACT, timeZone),
        event_date: this.toNullableDateTimeIso(oracleRow.FECHA, timeZone),
        status: this.toNullableString(oracleRow.ESTADO),
        hr_text: this.toNullableString(oracleRow.HR_TEXT),
        parent_order: this.toNullableString(oracleRow.ORDEN_PADRE),
        status_code: this.toNullableString(oracleRow.STATUS),
        notice_number: this.toNullableString(oracleRow.AVISO_NRO),
        sup_order: this.toNullableString(oracleRow.ORDEN_SUP),
        visible: this.toNullableString(oracleRow.VISIBLE),
        tplnr: this.toNullableString(oracleRow.TPLNR),
        priority: this.toNullableString(oracleRow.PRIORIDAD),
        county: this.toNullableString(oracleRow.PARTIDO),
        locality: this.toNullableString(oracleRow.LOCALIDAD),
      });

      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new TcvOrderBtMappingError('Failed to map Oracle row to TcvOrderBt DTO', {
          oracleRow,
          timeZone,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(
    entity: TcvOrderBtEntity,
  ): Result<TcvOrderBt, TcvOrderBtMappingError> {
    const domainResult = TcvOrderBt.reconstitute({
      orderNumber: entity.orderNumber,
      textOrder: entity.textOrder,
      createdAt: this.toNullableDateTime(entity.createdAt),
      lastUpdatedDate: this.toNullableDateTime(entity.lastUpdatedDate),
      eventDate: this.toNullableDateTime(entity.eventDate),
      status: entity.status,
      hrText: entity.hrText,
      parentOrder: entity.parentOrder,
      statusCode: entity.statusCode,
      noticeNumber: entity.noticeNumber,
      supOrder: entity.supOrder,
      visible: entity.visible,
      tplnr: entity.tplnr,
      priority: entity.priority,
      county: entity.county,
      locality: entity.locality,
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new TcvOrderBtMappingError('Failed to map TcvOrderBt entity to domain', {
        errors: fieldErrors.map((error) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(
    domain: TcvOrderBt,
  ): Result<TcvOrderBtEntity, TcvOrderBtMappingError> {
    try {
      const entity = new TcvOrderBtEntity();
      entity.orderNumber = domain.getOrderNumber() ?? '';
      entity.textOrder = domain.getTextOrder() ?? null;
      entity.createdAt = this.toNullableDate(domain.getCreatedAt());
      entity.lastUpdatedDate = this.toNullableDate(domain.getLastUpdatedDate());
      entity.eventDate = this.toNullableDate(domain.getEventDate());
      entity.status = domain.getStatus() ?? null;
      entity.hrText = domain.getHrText() ?? null;
      entity.parentOrder = domain.getParentOrder() ?? null;
      entity.statusCode = domain.getStatusCode() ?? null;
      entity.noticeNumber = domain.getNoticeNumber() ?? null;
      entity.supOrder = domain.getSupOrder() ?? null;
      entity.visible = domain.getVisible() ?? null;
      entity.tplnr = domain.getTplnr() ?? null;
      entity.priority = domain.getPriority() ?? null;
      entity.county = domain.getCounty() ?? null;
      entity.locality = domain.getLocality() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new TcvOrderBtMappingError('Failed to map TcvOrderBt domain to entity', {
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
