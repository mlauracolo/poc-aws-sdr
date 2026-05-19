import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { DateOnly, Decimal } from '@pormeldev/axis-common-lib';
import { CreateBookCommand } from '../../application/command/create-book/create-book.command';
import { CreateBookCommandHandler } from '../../application/command/create-book/create-book-command.handler';

type CreateBookBody = {
  title: string;
  year: number;
  cost: number | string;
  availableSince?: string;
  inLibraryUseOnly?: boolean;
};

@Controller('books')
export class BookController {
  constructor(private readonly createBookHandler: CreateBookCommandHandler) {}

  @Post()
  async create(@Body() body: CreateBookBody) {
    const result = await this.createBookHandler.execute(
      new CreateBookCommand(
        body.title,
        Number(body.year),
        new Decimal(String(body.cost)),
        body.availableSince
          ? DateOnly.fromISODate(body.availableSince)
          : DateOnly.today(),
        body.inLibraryUseOnly ?? false,
      ),
    );

    if (!result.ok) {
      throw new BadRequestException({
        errors: result.errors.map((error) =>
          'toJSON' in error ? error.toJSON() : error,
        ),
      });
    }

    return { id: result.value };
  }
}
