import { okResult, Result } from '@pormeldev/axis-common-lib';
import { TcvOrderMtMappingError } from '../error/tcv-order-mt-mapping.error';

export interface TcvOrderMtDtoParams {
  order_number: string;
  order_text: string | null;
  created_at: string | null;
  last_updated_at: string | null;
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

export class ApplicationTcvOrderMtDto {
  private constructor(
    public readonly order_number: string,
    public readonly order_text: string | null,
    public readonly created_at: string | null,
    public readonly last_updated_at: string | null,
    public readonly event_date: string | null,
    public readonly status: string | null,
    public readonly hr_text: string | null,
    public readonly parent_order: string | null,
    public readonly status_code: string | null,
    public readonly notice_number: string | null,
    public readonly sup_order: string | null,
    public readonly visible: string | null,
    public readonly tplnr: string | null,
    public readonly priority: string | null,
    public readonly county: string | null,
    public readonly locality: string | null,
  ) {}

  static create(
    params: TcvOrderMtDtoParams,
  ): Result<ApplicationTcvOrderMtDto, TcvOrderMtMappingError> {
    return okResult(
      new ApplicationTcvOrderMtDto(
        params.order_number,
        params.order_text,
        params.created_at,
        params.last_updated_at,
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

  toParams(): TcvOrderMtDtoParams {
    return {
      order_number: this.order_number,
      order_text: this.order_text,
      created_at: this.created_at,
      last_updated_at: this.last_updated_at,
      event_date: this.event_date,
      status: this.status,
      hr_text: this.hr_text,
      parent_order: this.parent_order,
      status_code: this.status_code,
      notice_number: this.notice_number,
      sup_order: this.sup_order,
      visible: this.visible,
      tplnr: this.tplnr,
      priority: this.priority,
      county: this.county,
      locality: this.locality,
    };
  }
}
