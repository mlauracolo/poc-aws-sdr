import { CodedDomainError } from '@pormeldev/axis-common-lib';
import { BookDomainErrorCode } from './book-domain-error-constants';

export class InvalidYearError extends CodedDomainError {
  constructor(context?: Record<string, unknown>) {
    super(
      BookDomainErrorCode.BOOK_INVALID_YEAR.message,
      'year',
      BookDomainErrorCode.BOOK_INVALID_YEAR.code,
      context ?? {},
    );
    this.name = 'InvalidYearError';
    Object.setPrototypeOf(this, InvalidYearError.prototype);
  }
}