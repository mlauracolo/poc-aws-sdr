import { CodedDomainError } from "@pormeldev/axis-common-lib";
import { BookDomainErrorCode } from "./book-domain-error-constants";

export class BookDeletionError extends CodedDomainError {
	constructor(context?: Record<string, unknown>) {
		super(
			BookDomainErrorCode.BOOK_DELETION_ERROR.message,
			"*",
			BookDomainErrorCode.BOOK_DELETION_ERROR.code,
			context ?? {},
		);
		this.name = "BookDeletionError";
		Object.setPrototypeOf(this, BookDeletionError.prototype);
	}
}
