import { Result, errorResult, okResult } from "@pormeldev/axis-common-lib";
import { BookInvalidYearForUseLibraryOnlyError } from "../error/book-invalid-year-for-use-library-only.error";
import { BookYear } from "../value-object/book-year";

export class BookLibraryUsePolicy {
	static validate(
		year: BookYear,
		inLibraryUseOnly: boolean,
	): Result<void, BookInvalidYearForUseLibraryOnlyError> {
		if (year.getValue() < 1900 && inLibraryUseOnly === false) {
			const error = new BookInvalidYearForUseLibraryOnlyError({
				year: year.getValue(),
				inLibraryUseOnly,
			});
			return errorResult([error]);
		}
		return okResult(undefined);
	}
}
