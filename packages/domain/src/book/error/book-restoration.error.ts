import { CodedDomainError } from "@pormeldev/axis-common-lib";
import { BookDomainErrorCode } from "./book-domain-error-constants";

export class BookRestorationError extends CodedDomainError {
	constructor(context?: Record<string, unknown>) {
		super(
			BookDomainErrorCode.BOOK_RESTORATION_ERROR.message,
			"*",
			BookDomainErrorCode.BOOK_RESTORATION_ERROR.code,
			context ?? {},
		);
		this.name = "BookRestorationError";
		Object.setPrototypeOf(this, BookRestorationError.prototype);
	}
}
