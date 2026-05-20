import { CodedApplicationError } from "@pormeldev/axis-common-lib";
import { BookApplicationErrorCode } from "./book-application-error.constants";

export class BookMappingError extends CodedApplicationError {
	constructor(message?: string, context?: Record<string, unknown>) {
		super(
			message || BookApplicationErrorCode.BOOK_MAPPING_ERROR.message,
			"*",
			BookApplicationErrorCode.BOOK_MAPPING_ERROR.code,
			context || {},
		);
		this.name = "BookMappingError";
		Object.setPrototypeOf(this, BookMappingError.prototype);
	}
}
