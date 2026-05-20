import { Book, BookId } from "@sdr/domain";
import { Result } from "@pormeldev/axis-common-lib";
import { BookCreationError } from "../error/book-creation-error";
import { BookMappingError } from "../error/book-mapping.error";

export interface BookRepositoryPort {
	create(
		book: Book,
	): Promise<Result<BookId, BookCreationError | BookMappingError>>;
}

export const BOOK_REPOSITORY = Symbol("BOOK_REPOSITORY");
