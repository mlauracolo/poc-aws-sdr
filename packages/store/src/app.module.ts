import { Module } from "@nestjs/common";
import { BookServiceModule } from "./book/infrastructure/service/book-service.module";

@Module({
	imports: [BookServiceModule],
})
export class AppModule {}
