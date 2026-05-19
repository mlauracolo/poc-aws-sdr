import { FieldError, okResult, Result } from "@pormeldev/axis-common-lib";
import { CreateBookCommand } from "./create-book.command";
import { BookCreationError } from "../../error/book-creation-error";
import { Book } from "../../../domain/book";
import { BookMappingError } from "../../error/book-mapping.error";
import { BookRepositoryPort } from "../../port/book-repository.port";

export class CreateBookCommandHandler {
  constructor(private readonly repository: BookRepositoryPort) {}

  async execute(
    command: CreateBookCommand,
  ): Promise<
    Result<string, BookCreationError | BookMappingError | FieldError>
  > {
    const bookResult = Book.create({
      title: command.title,
      year: command.year,
      cost: command.cost,
      availableSince: command.availableSince,
      inLibraryUseOnly: command.inLibraryUseOnly,
    });

    if (!bookResult.ok) return bookResult;

    const saveResult = await this.repository.create(bookResult.value);
    if (!saveResult.ok) return saveResult;
    return okResult(bookResult.value.getId().getValue());
  } 
}
