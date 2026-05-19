import { Injectable } from '@nestjs/common';
import { errorResult, okResult, Result } from '@pormeldev/axis-common-lib';
import { BookRepositoryPort } from '../../application/port/book-repository.port';
import { BookCreationError } from '../../application/error/book-creation-error';
import { BookMappingError } from '../../application/error/book-mapping.error';
import { BookApplicationErrorCode } from '../../application/error/book-application-error.constants';
import { Book, BookFullData } from '../../domain/book';
import { BookId } from '../../domain/value-object/book-id';

@Injectable()
export class InMemoryBookRepository implements BookRepositoryPort {
  private readonly books = new Map<string, BookFullData>();

  async create(book: Book): Promise<Result<BookId, BookCreationError | BookMappingError>> {
    try {
      await this.save(book);
      return okResult(book.getId());
    } catch (error) {
      if (error instanceof BookMappingError) {
        return errorResult([error]);
      }

      return errorResult([
        new BookCreationError(BookApplicationErrorCode.BOOK_CREATION_ERROR.message),
      ]);
    }
  }

  async save(book: Book): Promise<void> {
    this.books.set(book.getId().getValue(), book.toSnapshot());
  }
}
