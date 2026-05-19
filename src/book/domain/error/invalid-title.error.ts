import { CodedDomainError } from '@pormeldev/axis-common-lib';
import { BookDomainErrorCode } from './book-domain-error-constants';

export class InvalidTitleError extends CodedDomainError {
  constructor(context?: Record<string, unknown>) {
    super(
      BookDomainErrorCode.BOOK_INVALID_TITLE.message,
      'title',
      BookDomainErrorCode.BOOK_INVALID_TITLE.code,
      context ?? {},
    );
    this.name = 'InvalidTitleError';
    Object.setPrototypeOf(this, InvalidTitleError.prototype);
  }
}