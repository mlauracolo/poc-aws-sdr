import { InvalidCostError } from "../error/invalid-cost.error";
import {
	Decimal,
	Result,
	errorResult,
	okResult,
} from "@pormeldev/axis-common-lib";

export class BookCost {
	private constructor(private readonly value: Decimal) {}

	public getValue(): Decimal {
		return this.value;
	}

	public static create(value: Decimal): Result<BookCost, InvalidCostError> {
		if (!value || value.lessThanOrEqualTo(Decimal.zero())) {
			const error = new InvalidCostError({ value });
			return errorResult([error]);
		}
		return okResult(new BookCost(value));
	}

	public static reconstitute(value: Decimal): BookCost {
		return new BookCost(value);
	}

	public equals(other: BookCost): boolean {
		return this.value.equals(other.value);
	}

	public toString(): string {
		return this.value.toString();
	}
}
