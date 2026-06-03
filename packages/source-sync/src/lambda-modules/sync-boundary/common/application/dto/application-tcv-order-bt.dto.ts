import { okResult, Result } from '@pormeldev/axis-common-lib';
import { TcvOrderMappingError } from '../error/tcv-order-bt-mapping.error';

export interface TcvOrderDtoParams {
  orderNumber: string,
  classOrder: string | null,
  txtOrder: string | null,
  createdAt: Date | null,
  lastUpdatedDate: Date | null,
  site: string | null,
  status: string | null,
  hrText: string | null,
  parentOrder: string | null,
  statusCode: string | null,
  noticeNumber: string | null,
  supOrder: string | null,
  visible: string | null,
  tplnr: string | null,
  priority: string | null,
  noticeArea: string | null,
  divNotice: string | null,
  county: string | null,
  locality: string | null,
  noticeDate: Date | null,
  priorNotice: string | null,
  begru: string | null,
}

export class ApplicationTcvOrderDto {
  private constructor(
    public _orderNumber: string,
    public _classOrder: string | null,
    public _txtOrder: string | null,
    public _createdAt: Date | null,
    public _lastUpdatedDate: Date | null,
    public _site: string | null,
    public _status: string | null,
    public _hrText: string | null,
    public _parentOrder: string | null,
    public _statusCode: string | null,
    public _noticeNumber: string | null,
    public _supOrder: string | null,
    public _visible: string | null,
    public _tplnr: string | null,
    public _priority: string | null,
    public _noticeArea: string | null,
    public _divNotice: string | null,
    public _county: string | null,
    public _locality: string | null,
    public _noticeDate: Date | null,
    public _priorNotice: string | null,
    public _begru: string | null,
  ) {}

  static create(
    params: TcvOrderDtoParams,
  ): Result<ApplicationTcvOrderDto, TcvOrderMappingError> {
    return okResult(
      new ApplicationTcvOrderDto(
        params.orderNumber,
        params.classOrder,
        params.txtOrder,
        params.createdAt,
        params.lastUpdatedDate,
        params.site,
        params.status,
        params.hrText,
        params.parentOrder,
        params.statusCode,
        params.noticeNumber,
        params.supOrder,
        params.visible,
        params.tplnr,
        params.priority,
        params.noticeArea,
        params.divNotice,
        params.county,
        params.locality,
        params.noticeDate,
        params.priorNotice,
        params.begru,
      ),
    );
  }

  toParams(): TcvOrderDtoParams {
    return {
      orderNumber: this._orderNumber,
      classOrder: this._classOrder,
      txtOrder: this._txtOrder,
      createdAt: this._createdAt,
      lastUpdatedDate: this._lastUpdatedDate,
      site: this._site,
      status: this._status,
      hrText: this._hrText,
      parentOrder: this._parentOrder,
      statusCode: this._statusCode,
      noticeNumber: this._noticeNumber,
      supOrder: this._supOrder,
      visible: this._visible,
      tplnr: this._tplnr,
      priority: this._priority,
      noticeArea: this._noticeArea,
      divNotice: this._divNotice,
      county: this._county,
      locality: this._locality,
      noticeDate: this._noticeDate,
      priorNotice: this._priorNotice,
      begru: this._begru
    };
  }
}
