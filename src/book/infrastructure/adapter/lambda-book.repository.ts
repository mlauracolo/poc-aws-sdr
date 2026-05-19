import { Book } from '../../domain/book';
import { BookRepositoryPort } from '../../application/port/book-repository.port';
import { errorResult, okResult, Result } from '@pormeldev/axis-common-lib';
import { BookCreationError } from '../../application/error/book-creation-error';
import { BookMappingError } from '../../application/error/book-mapping.error';
import { BookApplicationErrorCode } from '../../application/error/book-application-error.constants';
import { BookId } from '../../domain/value-object/book-id';

export class LambdaBookRepository implements BookRepositoryPort {
  async create(book: Book): Promise<Result<BookId, BookCreationError | BookMappingError>> {
    try {
      await this.save(book);
      return okResult(book.getId());
    } catch (error) {
      if (error instanceof BookMappingError) {
        return errorResult([error]);
      }
      return errorResult([new BookCreationError(BookApplicationErrorCode.BOOK_CREATION_ERROR.message)]);
    }
  }

  async save(book: Book): Promise<void> {
    const snapshot = book.toSnapshot();

    console.log('LambdaBookRepository saved book', {
      id: snapshot.id,
      title: snapshot.title,
      year: snapshot.year,
      cost: snapshot.cost.toString(),
      availableSince: snapshot.availableSince.toISODate(),
      inLibraryUseOnly: snapshot.inLibraryUseOnly,
    });
  }
}
