import { okResult, Result } from '@pormeldev/axis-common-lib';
import { TcvOrderBtMappingError } from '../error/tcv-order-bt-mapping.error';

export interface TcvOrderBtDtoParams {
  order_number: string;
  text_order: string | null;
  created_at: string | null;
  last_updated_date: string | null;
  event_date: string | null;
  status: string | null;
  hr_text: string | null;
  parent_order: string | null;
  status_code: string | null;
  notice_number: string | null;
  sup_order: string | null;
  visible: string | null;
  tplnr: string | null;
  priority: string | null;
  county: string | null;
  locality: string | null;
}

export class ApplicationTcvOrderBtDto {
  private constructor(
    public _orderNumber: string,
    public _textOrder: string | null,
    public _createdAt: string | null,
    public _lastUpdatedDate: string | null,
    public _eventDate: string | null,
    public _status: string | null,
    public _hrText: string | null,
    public _parentOrder: string | null,
    public _statusCode: string | null,
    public _noticeNumber: string | null,
    public _supOrder: string | null,
    public _visible: string | null,
    public _tplnr: string | null,
    public _priority: string | null,
    public _county: string | null,
    public _locality: string | null,
  ) {}

  static create(
    params: TcvOrderBtDtoParams,
  ): Result<ApplicationTcvOrderBtDto, TcvOrderBtMappingError> {
    return okResult(
      new ApplicationTcvOrderBtDto(
        params.order_number,
        params.text_order,
        params.created_at,
        params.last_updated_date,
        params.event_date,
        params.status,
        params.hr_text,
        params.parent_order,
        params.status_code,
        params.notice_number,
        params.sup_order,
        params.visible,
        params.tplnr,
        params.priority,
        params.county,
        params.locality,
      ),
    );
  }

  toParams(): TcvOrderBtDtoParams {
    return {
      order_number: this._orderNumber,
      text_order: this._textOrder,
      created_at: this._createdAt,
      last_updated_date: this._lastUpdatedDate,
      event_date: this._eventDate,
      status: this._status,
      hr_text: this._hrText,
      parent_order: this._parentOrder,
      status_code: this._statusCode,
      notice_number: this._noticeNumber,
      sup_order: this._supOrder,
      visible: this._visible,
      tplnr: this._tplnr,
      priority: this._priority,
      county: this._county,
      locality: this._locality,
    };
  }
}
