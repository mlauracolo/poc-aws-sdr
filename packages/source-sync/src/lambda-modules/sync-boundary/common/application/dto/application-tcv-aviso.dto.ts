import { okResult, Result } from '@pormeldev/axis-common-lib';
import { TcvAvisoMappingError } from '../error/tcv-aviso-mapping.error';

export interface TcvAvisoDtoParams {
  noticeNumber: string;
  noticeClass: string | null;
  textNotice: string | null;
  priority: string | null;
  createdAt: string | null;
  orderNumber: string | null;
  tplnr: string | null;
  site: string | null;
  area: string | null;
  division: string | null;
  adrNr: string | null;
  eventDate: string | null;
  lastSapDate: string | null;
  closed: string | null;
  visible: string | null;
  begru: string | null;
}

export class ApplicationTcvAvisoDto {
  private constructor(
    public readonly _noticeNumber: string,
    public readonly _noticeClass: string | null,
    public readonly _textNotice: string | null,
    public readonly _priority: string | null,
    public readonly _createdAt: string | null,
    public readonly _orderNumber: string | null,
    public readonly _tplnr: string | null,
    public readonly _site: string | null,
    public readonly _area: string | null,
    public readonly _division: string | null,
    public readonly _adrNr: string | null,
    public readonly _eventDate: string | null,
    public readonly _lastSapDate: string | null,
    public readonly _closed: string | null,
    public readonly _visible: string | null,
    public readonly _begru: string | null,
  ) {}

  static create(params: TcvAvisoDtoParams): Result<ApplicationTcvAvisoDto, TcvAvisoMappingError> {
    return okResult(
      new ApplicationTcvAvisoDto(
        params.noticeNumber,
        params.noticeClass,
        params.textNotice,
        params.priority,
        params.createdAt,
        params.orderNumber,
        params.tplnr,
        params.site,
        params.area,
        params.division,
        params.adrNr,
        params.eventDate,
        params.lastSapDate,
        params.closed,
        params.visible,
        params.begru,
      ),
    );
  }

  toParams(): TcvAvisoDtoParams {
    return {
      noticeNumber: this._noticeNumber,
      noticeClass: this._noticeClass,
      textNotice: this._textNotice,
      priority: this._priority,
      createdAt: this._createdAt,
      orderNumber: this._orderNumber,
      tplnr: this._tplnr,
      site: this._site,
      area: this._area,
      division: this._division,
      adrNr: this._adrNr,
      eventDate: this._eventDate,
      lastSapDate: this._lastSapDate,
      closed: this._closed,
      visible: this._visible,
      begru: this._begru,
    };
  }
}
