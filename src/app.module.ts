import { Module } from '@nestjs/common';
import { BookModule } from './book/infrastructure/book.module';

@Module({
  imports: [BookModule],
})
export class AppModule {}
