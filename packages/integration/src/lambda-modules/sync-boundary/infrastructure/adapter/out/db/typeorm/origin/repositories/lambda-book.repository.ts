import { Book } from "@sdr/domain";

export class LambdaBookRepository {
	async save(book: Book): Promise<void> {
		const snapshot = book.toSnapshot();

		console.log("LambdaBookRepository saved book", {
			id: snapshot.id,
			title: snapshot.title,
			year: snapshot.year,
			cost: snapshot.cost.toString(),
			availableSince: snapshot.availableSince.toISODate(),
			inLibraryUseOnly: snapshot.inLibraryUseOnly,
		});
	}
}
