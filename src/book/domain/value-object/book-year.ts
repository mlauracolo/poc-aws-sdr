
import { Result, errorResult, okResult } from '@pormeldev/axis-common-lib';
import { InvalidYearError } from '../error/invalid-year.error';

export class BookYear {
  private constructor(private readonly value: number) {}

  public getValue(): number {
    return this.value;
  }

  public static create(value: number): Result<BookYear, InvalidYearError> {
    if (value <= 1500) {
      const error = new InvalidYearError({ value });
      return errorResult([error]);
    }
    return okResult(new BookYear(value));
  }

  public static reconstitute(value: number): BookYear {
    return new BookYear(value);
  }

  public equals(other: BookYear): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}