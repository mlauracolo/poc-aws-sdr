import { DateTime, FieldError, okResult, Result } from "@pormeldev/axis-common-lib";

export type TcvOrderBtFullData = Readonly<{
  orderNumber: string;
  textOrder: string | null;
  createdAt: DateTime | null;
  lastUpdatedDate: DateTime | null;
  eventDate: DateTime | null;
  status: string | null;
  hrText: string | null;
  parentOrder: string | null;
  statusCode: string | null;
  noticeNumber: string | null;
  supOrder: string | null;
  visible: string | null;
  tplnr: string | null;
  priority: string | null;
  county: string | null;
  locality: string | null;
}>;

export type TcvOrderBtData = Readonly<{
  orderNumber: string;
  textOrder: string | null;
  createdAt: DateTime | null;
  lastUpdatedDate: DateTime | null;
  eventDate: DateTime | null;
  status: string | null;
  hrText: string | null;
  parentOrder: string | null;
  statusCode: string | null;
  noticeNumber: string | null;
  supOrder: string | null;
  visible: string | null;
  tplnr: string | null;
  priority: string | null;
  county: string | null;
  locality: string | null;
}>;

export type TcvOrderBtCreateInput = Readonly<{
  orderNumber: string;
  textOrder: string | null;
  createdAt: DateTime | null;
  lastUpdatedDate: DateTime | null;
  eventDate: DateTime | null;
  status: string | null;
  hrText: string | null;
  parentOrder: string | null;
  statusCode: string | null;
  noticeNumber: string | null;
  supOrder: string | null;
  visible: string | null;
  tplnr: string | null;
  priority: string | null;
  county: string | null;
  locality: string | null;
}>;

export type TcvOrderBtUpdateInput = Readonly<Partial<TcvOrderBtData>>;

export class TcvOrderBt {
  private _errors: FieldError[] = [];

  private constructor(
    public _orderNumber: string,
    public _textOrder: string | null,
    public _createdAt: DateTime | null,
    public _lastUpdatedDate: DateTime | null,
    public _eventDate: DateTime | null,
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
    public _locality: string | null
  ) {
    this._errors = [];
  }

  static create(params: TcvOrderBtCreateInput): Result<TcvOrderBt, FieldError[]> {
    return okResult(
      new TcvOrderBt(
        params.orderNumber,
        params.textOrder,
        params.createdAt,
        params.lastUpdatedDate,
        params.eventDate,
        params.status,
        params.hrText,
        params.parentOrder,
        params.statusCode,
        params.noticeNumber,
        params.supOrder,
        params.visible,
        params.tplnr,
        params.priority,
        params.county,
        params.locality
      )
    );
  }

  static reconstitute(params: TcvOrderBtFullData): Result<TcvOrderBt, FieldError[]> {
    return okResult(
      new TcvOrderBt(
        params.orderNumber,
        params.textOrder,
        params.createdAt,
        params.lastUpdatedDate,
        params.eventDate,
        params.status,
        params.hrText,
        params.parentOrder,
        params.statusCode,
        params.noticeNumber,
        params.supOrder,
        params.visible,
        params.tplnr,
        params.priority,
        params.county,
        params.locality
      )
    );
  }

  public restore(): Result<void, FieldError[]> {
    return okResult(undefined);
  }

  public getOrderNumber(): string {
    return this._orderNumber;
  }

  public getTextOrder(): string | null {
    return this._textOrder;
  }

  public getCreatedAt(): DateTime | null {
    return this._createdAt;
  }

  public getLastUpdatedDate(): DateTime | null {
    return this._lastUpdatedDate;
  }

  public getEventDate(): DateTime | null {
    return this._eventDate;
  }

  public getStatus(): string | null {
    return this._status;
  }

  public getHrText(): string | null {
    return this._hrText;
  }

  public getParentOrder(): string | null {
    return this._parentOrder;
  }

  public getStatusCode(): string | null {
    return this._statusCode;
  }

  public getNoticeNumber(): string | null {
    return this._noticeNumber;
  }

  public getSupOrder(): string | null {
    return this._supOrder;
  }

  public getVisible(): string | null {
    return this._visible;
  }

  public getTplnr(): string | null {
    return this._tplnr;
  }

  public getPriority(): string | null {
    return this._priority;
  }

  public getCounty(): string | null {
    return this._county;
  }

  public getLocality(): string | null {
    return this._locality;
  }
}
