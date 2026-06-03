import { DateTime, Result, errorResult, okResult } from '@pormeldev/axis-common-lib';

import { ApplicationTcvAvisoDto, TcvAvisoDtoParams } from '../../../../../../common/application/dto/application-tcv-aviso.dto';
import { TcvAvisoMappingError } from '../../../../../../common/application/error/tcv-aviso-mapping.error';
import { TcvAvisoEntity } from '../origin/entities/tcv-aviso.entity';
import { TcvAviso } from '@sdr/domain';


export class TcvAvisoTypeOrmMapper {
  static getColumnMapping(): Record<string, string> {
    return {
      noticeNumber: 'AVISO_NRO',
      noticeClass: 'AVISO_CLASE',
      textNotice: 'AVISO_TXT',
      priority: 'PRIORIDAD',
      createdAt: 'FEC_CREACION',
      orderNumber: 'ORDEN_NRO',
      tplnr: 'TPLNR',
      site: 'EMPLAZAMIENTO',
      area: 'AREA',
      division: 'DIVISION',
      adrNr: 'ADRNR',
      eventDate: 'FECHA',
      lastSapDate: 'FEC_ULT_SAP',
      closed: 'CERRADO',
      visible: 'VISIBLE',
      begru: 'BEGRU',
    };
  }

  static mapOracleDBToApplicationDto(
    oracleRow: Record<string, any>,
    timeZone?: string,
  ): Result<TcvAvisoDtoParams, TcvAvisoMappingError> {
    try {
      const dtoResult = ApplicationTcvAvisoDto.create({
        noticeNumber: String(oracleRow.AVISO_NRO ?? ''),
        noticeClass: this.toNullableString(oracleRow.AVISO_CLASE),
        textNotice: this.toNullableString(oracleRow.AVISO_TXT),
        priority: this.toNullableString(oracleRow.PRIORIDAD),
        createdAt: this.toNullableDateTimeIso(oracleRow.FEC_CREACION, timeZone),
        orderNumber: this.toNullableString(oracleRow.ORDEN_NRO),
        tplnr: this.toNullableString(oracleRow.TPLNR),
        site: this.toNullableString(oracleRow.EMPLAZAMIENTO),
        area: this.toNullableString(oracleRow.AREA),
        division: this.toNullableString(oracleRow.DIVISION),
        adrNr: this.toNullableString(oracleRow.ADRNR),
        eventDate: this.toNullableDateTimeIso(oracleRow.FECHA, timeZone),
        lastSapDate: this.toNullableDateTimeIso(oracleRow.FEC_ULT_SAP, timeZone),
        closed: this.toNullableString(oracleRow.CERRADO),
        visible: this.toNullableString(oracleRow.VISIBLE),
        begru: this.toNullableString(oracleRow.BEGRU),
      });

      if (dtoResult.ok) {
        return okResult(dtoResult.value.toParams());
      }

      return errorResult(dtoResult.errors);
    } catch (error) {
      return errorResult([
        new TcvAvisoMappingError('Failed to map Oracle row to TcvAviso DTO', {
          oracleRow,
          timeZone,
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  static mapEntityToDomain(entity: TcvAvisoEntity): Result<TcvAviso, TcvAvisoMappingError> {
    const domainResult = TcvAviso.reconstitute({
      noticeNumber: entity.noticeNumber,
      noticeClass: entity.noticeClass,
      textNotice: entity.textNotice,
      priority: entity.priority,
      createdAt: this.toNullableDateTime(entity.createdAt),
      orderNumber: entity.orderNumber,
      tplnr: entity.tplnr,
      site: entity.site,
      area: entity.area,
      division: entity.division,
      adrNr: entity.adrNr,
      eventDate: this.toNullableDateTime(entity.eventDate) ?? DateTime.fromISO(new Date().toISOString()),
      lastSapDate: this.toNullableDateTime(entity.lastSapDate),
      closed: entity.closed,
      visible: entity.visible,
      begru: entity.begru,
    });

    if (domainResult.ok) {
      return okResult(domainResult.value);
    }

    const fieldErrors = domainResult.errors.flat();

    return errorResult([
      new TcvAvisoMappingError('Failed to map TcvAviso entity to domain', {
        errors: fieldErrors.map((error) => error.message),
      }),
    ]);
  }

  static mapDomainToEntity(domain: TcvAviso): Result<TcvAvisoEntity, TcvAvisoMappingError> {
    try {
      const entity = new TcvAvisoEntity();
      entity.noticeNumber = domain.getNoticeNumber();
      entity.noticeClass = domain.getNoticeClass() ?? null;
      entity.textNotice = domain.getTextNotice() ?? null;
      entity.priority = domain.getPriority() ?? null;
      entity.createdAt = this.toNullableDate(domain.getCreatedAt());
      entity.orderNumber = domain.getOrderNumber() ?? null;
      entity.tplnr = domain.getTplnr() ?? null;
      entity.site = domain.getSite() ?? null;
      entity.area = domain.getArea() ?? null;
      entity.division = domain.getDivision() ?? null;
      entity.adrNr = domain.getAdrNr() ?? null;
      entity.eventDate = this.toNullableDate(domain.getEventDate()) ?? new Date();
      entity.lastSapDate = this.toNullableDate(domain.getLastSapDate());
      entity.closed = domain.getClosed() ?? null;
      entity.visible = domain.getVisible() ?? null;
      entity.begru = domain.getBegru() ?? null;

      return okResult(entity);
    } catch (error) {
      return errorResult([
        new TcvAvisoMappingError('Failed to map TcvAviso domain to entity', {
          error: error instanceof Error ? error.message : error,
        }),
      ]);
    }
  }

  private static toNullableString(value: unknown): string | null {
    return value === null || value === undefined ? null : String(value);
  }

  private static toNullableDateTime(value: Date | null | undefined): DateTime | null {
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
