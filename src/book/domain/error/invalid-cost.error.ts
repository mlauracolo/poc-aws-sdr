import { CodedDomainError } from '@pormeldev/axis-common-lib';
import { BookDomainErrorCode } from './book-domain-error-constants';

export class InvalidCostError extends CodedDomainError {
  constructor(context?: Record<string, unknown>) {
    super(
      BookDomainErrorCode.BOOK_INVALID_COST.message,
      'cost',
      BookDomainErrorCode.BOOK_INVALID_COST.code,
      context ?? {},
    );
    this.name = 'InvalidCostError';
    Object.setPrototypeOf(this, InvalidCostError.prototype);
  }
}