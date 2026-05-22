import { DateOnly, Decimal } from "@pormeldev/axis-common-lib";

export class CreateBookCommand {
	constructor(
		public readonly title: string,
		public readonly year: number,
		public readonly cost: Decimal,
		public readonly availableSince: DateOnly,
		public readonly inLibraryUseOnly: boolean,
	) {}
}
