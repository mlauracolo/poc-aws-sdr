import { DateTime, FieldError, okResult, Result } from "@pormeldev/axis-common-lib";

export type TcvAvisoFullData = Readonly<{
  noticeNumber: string;
  noticeClass: string | null;
  textNotice: string | null;
  priority: string | null;
  createdAt: DateTime | null;
  orderNumber: string | null;
  tplnr: string | null;
  site: string | null;
  area: string | null;
  division: string | null;
  adrNr: string | null;
  eventDate: DateTime | null;
  lastSapDate: DateTime | null;
  closed: string | null;
  visible: string | null;
  begru: string | null;
}>;

export type TcvAvisoData = Readonly<{
  noticeNumber: string;
  noticeClass: string | null;
  textNotice: string | null;
  priority: string | null;
  createdAt: DateTime | null;
  orderNumber: string | null;
  tplnr: string | null;
  site: string | null;
  area: string | null;
  division: string | null;
  adrNr: string | null;
  eventDate: DateTime | null;
  lastSapDate: DateTime | null;
  closed: string | null;
  visible: string | null;
  begru: string | null;
}>;

export type TcvAvisoCreateInput = Readonly<{
  noticeNumber: string;
  noticeClass: string | null;
  textNotice: string | null;
  priority: string | null;
  createdAt: DateTime | null;
  orderNumber: string | null;
  tplnr: string | null;
  site: string | null;
  area: string | null;
  division: string | null;
  adrNr: string | null;
  eventDate: DateTime | null;
  lastSapDate: DateTime | null;
  closed: string | null;
  visible: string | null;
  begru: string | null;
}>;

export type TcvAvisoUpdateInput = Readonly<Partial<TcvAvisoData>>;

export class TcvAviso {
  private _errors: FieldError[] = [];

  private constructor(
    public _noticeNumber: string,
    public _noticeClass: string | null,
    public _textNotice: string | null,
    public _priority: string | null,
    public _createdAt: DateTime | null,
    public _orderNumber: string | null,
    public _tplnr: string | null,
    public _site: string | null,
    public _area: string | null,
    public _division: string | null,
    public _addressNumber: string | null,
    public _eventDate: DateTime | null,
    public _lastSapDate: DateTime | null,
    public _closed: string | null,
    public _visible: string | null,
    public _begru: string | null
  ) {
    this._errors = [];
  }

  static create(params: TcvAvisoCreateInput): Result<TcvAviso, FieldError[]> {
    return okResult(
      new TcvAviso(
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
        params.begru
      )
    );
  }

  static reconstitute(params: TcvAvisoFullData): Result<TcvAviso, FieldError[]> {
    return okResult(
      new TcvAviso(
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
        params.begru
      )
    );
  }

  public restore(): Result<void, FieldError[]> {
    return okResult(undefined);
  }

  public getNoticeNumber(): string {
    return this._noticeNumber;
  }

  public getNoticeClass(): string | null {
    return this._noticeClass;
  }

  public getTextNotice(): string | null {
    return this._textNotice;
  }

  public getPriority(): string | null {
    return this._priority;
  }

  public getCreatedAt(): DateTime | null {
    return this._createdAt;
  }

  public getOrderNumber(): string | null {
    return this._orderNumber;
  }

  public getTplnr(): string | null {
    return this._tplnr;
  }

  public getSite(): string | null {
    return this._site;
  }

  public getArea(): string | null {
    return this._area;
  }

  public getDivision(): string | null {
    return this._division;
  }

  public getAddressNumber(): string | null {
    return this._addressNumber;
  }

  public getEventDate(): DateTime | null {
    return this._eventDate;
  }

  public getLastSapDate(): DateTime | null {
    return this._lastSapDate;
  }

  public getClosed(): string | null {
    return this._closed;
  }

  public getVisible(): string | null {
    return this._visible;
  }

  public getBegru(): string | null {
    return this._begru;
  }
}
