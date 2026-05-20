export const BookDomainErrorCode = {
	BOOK_INVALID_ID: {
		code: "BOOK_INVALID_ID",
		message: "Invalid ID. The ID cannot be empty.",
	},
	BOOK_INVALID_TITLE: {
		code: "BOOK_INVALID_TITLE",
		message: "Invalid title. The title must have at least 3 characters.",
	},
	BOOK_INVALID_YEAR: {
		code: "BOOK_INVALID_YEAR",
		message: "The year must be greater than 1500.",
	},
	BOOK_INVALID_COST: {
		code: "BOOK_INVALID_COST",
		message: "The cost must be greater than 0.",
	},
	BOOK_DELETION_ERROR: {
		code: "BOOK_DELETION_ERROR",
		message: "The book cannot be deleted because it is already deleted.",
	},
	BOOK_RESTORATION_ERROR: {
		code: "BOOK_RESTORATION_ERROR",
		message: "The book cannot be restored because it is not deleted.",
	},
	BOOK_INVALID_YEAR_FOR_USE_LIBRARY_ONLY: {
		code: "BOOK_INVALID_YEAR_FOR_USE_LIBRARY_ONLY",
		message:
			"The year must be greater than or equal to 1900 to be used out of the library.",
	},
} as const;
