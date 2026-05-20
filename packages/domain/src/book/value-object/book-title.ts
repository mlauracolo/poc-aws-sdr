import { InvalidTitleError } from "../error/invalid-title.error";
import { Result, errorResult, okResult } from "@pormeldev/axis-common-lib";

export class BookTitle {
	private constructor(private readonly value: string) {}

	public getValue(): string {
		return this.value;
	}

	public static create(value: string): Result<BookTitle, InvalidTitleError> {
		const trimmed = value ? value.trim() : "";
		if (trimmed.length < 3) {
			const error = new InvalidTitleError({ value });
			return errorResult([error]);
		}
		return okResult(new BookTitle(value));
	}

	public static reconstitute(value: string): BookTitle {
		return new BookTitle(value);
	}

	public equals(other: BookTitle): boolean {
		return this.value === other.value;
	}

	public toString(): string {
		return this.value;
	}
}
