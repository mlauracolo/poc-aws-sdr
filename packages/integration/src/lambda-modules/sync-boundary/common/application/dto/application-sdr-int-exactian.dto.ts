import { okResult, Result } from '@pormeldev/axis-common-lib';
import { SdrIntExactianMappingError } from '../error/sdr-int-exactian-mapping.error';

export interface SdrIntExactianDtoParams {
  cuit: string | null;
  contractor_name: string | null;
  cuil: string | null;
  dni: string | null;
  nombre: string | null;
  status: string | null;
}

export class ApplicationSdrIntExactianDto {
  private constructor(
    public readonly cuit: string | null,
    public readonly contractor_name: string | null,
    public readonly cuil: string | null,
    public readonly dni: string | null,
    public readonly nombre: string | null,
    public readonly status: string | null,
  ) {}

  static create(
    params: SdrIntExactianDtoParams,
  ): Result<ApplicationSdrIntExactianDto, SdrIntExactianMappingError> {
    return okResult(
      new ApplicationSdrIntExactianDto(
        params.cuit,
        params.contractor_name,
        params.cuil,
        params.dni,
        params.nombre,
        params.status,
      ),
    );
  }

  toParams(): SdrIntExactianDtoParams {
    return {
      cuit: this.cuit,
      contractor_name: this.contractor_name,
      cuil: this.cuil,
      dni: this.dni,
      nombre: this.nombre,
      status: this.status,
    };
  }
}
