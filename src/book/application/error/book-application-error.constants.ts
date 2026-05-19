export const BookApplicationErrorCode = {
  BOOK_CREATION_ERROR: {
    code: 'BOOK_CREATION_ERROR',
    message: 'An error occurred while creating the book.',
  },
  BOOK_MODIFICATION_ERROR: {
    code: 'BOOK_MODIFICATION_ERROR',
    message: 'An error occurred while modifying the book.',
  },
  BOOK_DELETION_ERROR: {
    code: 'BOOK_DELETION_ERROR',
    message: 'An error occurred while deleting the book.',
  },
  BOOK_RESTORATION_ERROR: {
    code: 'BOOK_RESTORATION_ERROR',
    message: 'An error occurred while restoring the book.',
  },
  BOOK_NOT_FOUND_ERROR: {
    code: 'BOOK_NOT_FOUND_ERROR',
    message: 'The book was not found.',
  },
  BOOK_MAPPING_ERROR: {
    code: 'BOOK_MAPPING_ERROR',
    message: 'An error occurred while mapping the book.',
  },
  BOOK_ID_GENERATION_ERROR: {
    code: 'BOOK_ID_GENERATION_ERROR',
    message: 'An error occurred while generating the book ID.',
  },
  BOOK_PER_YEAR_ERROR: {
    code: 'BOOK_PER_YEAR_ERROR',
    message: 'An error occurred while getting the books per year.',
  },
} as const;