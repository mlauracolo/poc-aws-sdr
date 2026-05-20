import { CodedDomainError } from "@pormeldev/axis-common-lib";
import { BookDomainErrorCode } from "./book-domain-error-constants";

export class BookInvalidYearForUseLibraryOnlyError extends CodedDomainError {
	constructor(context?: Record<string, unknown>) {
		super(
			BookDomainErrorCode.BOOK_INVALID_YEAR_FOR_USE_LIBRARY_ONLY.message,
			"*",
			BookDomainErrorCode.BOOK_INVALID_YEAR_FOR_USE_LIBRARY_ONLY.code,
			context ?? {},
		);
		this.name = "BookInvalidYearForUseLibraryOnlyError";
		Object.setPrototypeOf(
			this,
			BookInvalidYearForUseLibraryOnlyError.prototype,
		);
	}
}
