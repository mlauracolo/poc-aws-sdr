import {
	DateOnly,
	DateTime,
	Decimal,
	errorResult,
	okResult,
	Result,
	FieldError,
} from "@pormeldev/axis-common-lib";
import { BookLibraryUsePolicy } from "./policy/book-library-use.policy";
import { unwrapResult } from "@pormeldev/axis-common-lib";
import { BookTitle } from "./value-object/book-title";
import { BookYear } from "./value-object/book-year";
import { BookCost } from "./value-object/book-cost";
import { BookId } from "./value-object/book-id";
import { BookDeletionError } from "./error/invalid-deletion.error";
import { BookRestorationError } from "./error/book-restoration.error";
import { BookInvalidYearForUseLibraryOnlyError } from "./error/book-invalid-year-for-use-library-only.error";

export type BookFullData = Readonly<{
	id: string;
	title: string;
	year: number;
	cost: Decimal;
	availableSince: DateOnly;
	inLibraryUseOnly: boolean;
	createdAt: DateTime;
	updatedAt: DateTime;
	deletedAt: DateTime | null;
}>;

export type BookCreateInput = Readonly<
	Omit<BookFullData, "id" | "createdAt" | "updatedAt" | "deletedAt">
>;

export type BookUpdateInput = Readonly<Partial<BookCreateInput>>;

export type ValidatedBookInput = Readonly<{
	title: BookTitle;
	year: BookYear;
	cost: BookCost;
	availableSince: DateOnly;
	inLibraryUseOnly: boolean;
}>;

export class Book {
	private _errors: FieldError[] = [];

	private constructor(
		private _id: BookId,
		private _title: BookTitle,
		private _year: BookYear,
		private _cost: BookCost,
		private _availableSince: DateOnly,
		private _inLibraryUseOnly: boolean,
		private _createdAt: DateTime,
		private _updatedAt: DateTime,
		private _deletedAt: DateTime | null,
	) {
		this._errors = [];
	}

	static create(params: BookCreateInput): Result<Book, FieldError> {
		const validatedDataResult = Book.getValidatedData(params);

		if (!validatedDataResult.ok) {
			return validatedDataResult;
		}

		const now = DateTime.now();
		const validatedData = validatedDataResult.value;
		return okResult(
			new Book(
				BookId.create(),
				validatedData.title,
				validatedData.year,
				validatedData.cost,
				validatedData.availableSince,
				validatedData.inLibraryUseOnly,
				now,
				now,
				null,
			),
		);
	}

	static reconstitute(params: BookFullData): Result<Book, FieldError> {
		const book = new Book(
			BookId.reconstitute(params.id),
			BookTitle.reconstitute(params.title),
			BookYear.reconstitute(params.year),
			BookCost.reconstitute(params.cost),
			params.availableSince,
			params.inLibraryUseOnly,
			params.createdAt,
			params.updatedAt,
			params.deletedAt,
		);
		return okResult(book);
	}

	public markAsDeleted(): Result<void, BookDeletionError> {
		if (this._deletedAt !== null) {
			const error = new BookDeletionError();
			this._errors.push(error);
			return errorResult([error]);
		}
		const now = DateTime.now();
		this._deletedAt = now;
		this._updatedAt = now;
		return okResult(undefined);
	}

	public restore(): Result<void, BookRestorationError> {
		if (this._deletedAt === null) {
			const error = new BookRestorationError();
			this._errors.push(error);
			return errorResult([error]);
		}
		this._deletedAt = null;
		this._updatedAt = DateTime.now();
		return okResult(undefined);
	}

	public updateDetails(
		params: BookUpdateInput,
	): Result<void, FieldError | BookInvalidYearForUseLibraryOnlyError> {
		const validationResult = this.getValidatedUpdateData(params);

		if (!validationResult.ok) {
			return validationResult;
		}

		const validatedParams = validationResult.value;
		this._title = validatedParams.title;
		this._year = validatedParams.year;
		this._cost = validatedParams.cost;
		this._availableSince = validatedParams.availableSince;
		this._inLibraryUseOnly = validatedParams.inLibraryUseOnly;
		this._updatedAt = DateTime.now();

		return okResult(undefined);
	}

	public getId(): BookId {
		return this._id;
	}
	public getTitle(): BookTitle {
		return this._title;
	}
	public getYear(): BookYear {
		return this._year;
	}
	public getCost(): BookCost {
		return this._cost;
	}
	public getAvailableSince(): DateOnly {
		return this._availableSince;
	}
	public getInLibraryUseOnly(): boolean {
		return this._inLibraryUseOnly;
	}
	public getCreatedAt(): DateTime {
		return this._createdAt;
	}
	public getUpdatedAt(): DateTime {
		return this._updatedAt;
	}
	public getDeletedAt(): DateTime | null {
		return this._deletedAt;
	}

	public toSnapshot(): BookFullData {
		return {
			id: this._id.getValue(),
			title: this._title.getValue(),
			year: this._year.getValue(),
			cost: this._cost.getValue(),
			availableSince: this._availableSince,
			inLibraryUseOnly: this._inLibraryUseOnly,
			createdAt: this._createdAt,
			updatedAt: this._updatedAt,
			deletedAt: this._deletedAt,
		};
	}

	private getValidatedUpdateData(
		params: BookUpdateInput,
	): Result<ValidatedBookInput, FieldError> {
		return Book.getValidatedData({
			title: params.title ?? this._title.getValue(),
			year: params.year ?? this._year.getValue(),
			cost: params.cost ?? this._cost.getValue(),
			availableSince: params.availableSince ?? this._availableSince,
			inLibraryUseOnly: params.inLibraryUseOnly ?? this._inLibraryUseOnly,
		});
	}

	private static getValidatedData(
		params: BookCreateInput,
	): Result<ValidatedBookInput, FieldError> {
		const errors: FieldError[] = [];

		const title = unwrapResult(BookTitle.create(params.title), errors);
		const year = unwrapResult(BookYear.create(params.year), errors);
		const cost = unwrapResult(BookCost.create(params.cost), errors);

		if (year) {
			unwrapResult(
				BookLibraryUsePolicy.validate(year, params.inLibraryUseOnly),
				errors,
			);
		}

		if (errors.length > 0) {
			return errorResult(errors);
		}

		return okResult({
			title: title!,
			year: year!,
			cost: cost!,
			availableSince: params.availableSince,
			inLibraryUseOnly: params.inLibraryUseOnly,
		});
	}
}
