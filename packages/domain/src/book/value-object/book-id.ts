import {
	Id,
	Result,
	okResult,
	errorResult,
	DomainError,
} from "@pormeldev/axis-common-lib";

export class BookId extends Id {
	private constructor(value: string) {
		super(value);
	}

	public static create(): BookId {
		const base = Id.create();
		return new BookId(base.getValue());
	}

	public static reconstitute(value: string): BookId {
		return new BookId(value);
	}

	public static fromString(value: string): Result<BookId, DomainError> {
		const res = Id.fromString(value);
		if (!res.ok) return errorResult<BookId, DomainError>(res.errors);
		const bookId = new BookId(res.value.getValue());
		return okResult(bookId);
	}
}
