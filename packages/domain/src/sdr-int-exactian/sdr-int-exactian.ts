import { FieldError, okResult, Result } from "@pormeldev/axis-common-lib";

export type SdrIntExactianFullData = Readonly<{
  cuit: string | null;
  contractorName: string | null;
  cuil: string | null;
  dni: string | null;
  nombre: string | null;
  status: string | null;
}>;

export type SdrIntExactianCreateInput = Readonly<{
  cuit: string | null;
  contractorName: string | null;
  cuil: string | null;
  dni: string | null;
  nombre: string | null;
  status: string | null;
}>;

export class SdrIntExactian {
  private _errors: FieldError[] = [];

  private constructor(
    public _cuit: string | null,
    public _contractorName: string | null,
    public _cuil: string | null,
    public _dni: string | null,
    public _nombre: string | null,
    public _status: string | null,
  ) {
    this._errors = [];
  }

  static create(
    params: SdrIntExactianCreateInput,
  ): Result<SdrIntExactian, FieldError[]> {
    return okResult(
      new SdrIntExactian(
        params.cuit,
        params.contractorName,
        params.cuil,
        params.dni,
        params.nombre,
        params.status,
      ),
    );
  }

  static reconstitute(params: SdrIntExactianFullData): Result<SdrIntExactian, FieldError[]> {
    return okResult(
      new SdrIntExactian(
        params.cuit,
        params.contractorName,
        params.cuil,
        params.dni,
        params.nombre,
        params.status,
      ),
    );
  }

  public restore(): Result<void, FieldError[]> {
    return okResult(undefined);
  }

  public getCuit(): string | null {
    return this._cuit;
  }

  public getContractorName(): string | null {
    return this._contractorName;
  }

  public getCuil(): string | null {
    return this._cuil;
  }

  public getDni(): string | null {
    return this._dni;
  }

  public getNombre(): string | null {
    return this._nombre;
  }

  public getStatus(): string | null {
    return this._status;
  }

  public getErrors(): FieldError[] {
    return this._errors;
  }
}
