import { Module } from "@nestjs/common";
import { CreateBookCommandHandler } from "../../application/command/create-book/create-book-command.handler";
import { BOOK_REPOSITORY } from "../../application/port/book-repository.port";
import { InMemoryBookRepository } from "./in-memory-book.repository";
import { BookController } from "./book.controller";

@Module({
	controllers: [BookController],
	providers: [
		{
			provide: BOOK_REPOSITORY,
			useClass: InMemoryBookRepository,
		},
		{
			provide: CreateBookCommandHandler,
			useFactory: (repository: InMemoryBookRepository) =>
				new CreateBookCommandHandler(repository),
			inject: [BOOK_REPOSITORY],
		},
	],
})
export class BookServiceModule {}
