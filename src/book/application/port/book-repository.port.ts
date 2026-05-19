import { Book } from '../../domain/book';
import { Result } from '@pormeldev/axis-common-lib';
import { BookCreationError } from '../error/book-creation-error';
import { BookMappingError } from '../error/book-mapping.error';
import { BookId } from '../../domain/value-object/book-id';


export interface BookRepositoryPort {
  create(
    book: Book,
  ): Promise<Result<BookId, BookCreationError | BookMappingError>>;

}

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');
