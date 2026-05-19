import { CodedApplicationError } from "@pormeldev/axis-common-lib";

export class BookCreationError extends CodedApplicationError {
  constructor(message: string, field?: string, code?: string, context?: Record<string, unknown>) {
    super(message || 'Book creation error',
      field || 'book',
      code ? String(code) : 'BOOK_CREATION_ERROR',
      context || {}
    );
    this.name = 'BookCreationError';
    Object.setPrototypeOf(this, BookCreationError.prototype);
  }
}