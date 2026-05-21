import type {
	APIGatewayProxyEventV2,
	APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { DateOnly, Decimal } from "@pormeldev/axis-common-lib";
import { Book } from "@sdr/domain";
import { LambdaBookRepository } from "../../adapter/out/db/typeorm/origin/repositories/lambda-book.repository";

type CreateBookPayload = {
	title?: unknown;
	year?: unknown;
	cost?: unknown;
	availableSince?: unknown;
	inLibraryUseOnly?: unknown;
};

export async function handler(
	event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyStructuredResultV2> {
	try {
		const payload = parsePayload(getBody(event));
		const bookResult = Book.create({
			title: stringFrom(payload.title),
			year: numberFrom(payload.year),
			cost: new Decimal(stringFrom(payload.cost)),
			availableSince: dateOnlyFrom(payload.availableSince),
			inLibraryUseOnly: booleanFrom(payload.inLibraryUseOnly),
		});

		if (!bookResult.ok) {
			return {
				statusCode: 400,
				headers: jsonHeaders(),
				body: JSON.stringify({
					errors: bookResult.errors.map(serializeError),
				}),
			};
		}

		const repository = new LambdaBookRepository();
		await repository.save(bookResult.value);

		return {
			statusCode: 201,
			headers: jsonHeaders(),
			body: JSON.stringify({ id: bookResult.value.getId().getValue() }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			headers: jsonHeaders(),
			body: JSON.stringify({
				message: error instanceof Error ? error.message : "Unexpected error",
			}),
		};
	}
}

function getBody(event: APIGatewayProxyEventV2): string | undefined {
	if (!event.body) {
		return undefined;
	}

	if (event.isBase64Encoded) {
		return Buffer.from(event.body, "base64").toString("utf8");
	}

	return event.body;
}

function parsePayload(body: string | null | undefined): CreateBookPayload {
	if (!body) {
		return {};
	}

	const parsed = JSON.parse(body) as unknown;

	if (!parsed || typeof parsed !== "object") {
		throw new Error("Lambda body must be a JSON object");
	}

	return parsed as CreateBookPayload;
}

function stringFrom(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return "";
}

function numberFrom(value: unknown): number {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string" && value.trim() !== "") {
		return Number(value);
	}

	return Number.NaN;
}

function dateOnlyFrom(value: unknown): DateOnly {
	if (typeof value === "string" && value.trim() !== "") {
		return DateOnly.fromISODate(value);
	}

	return DateOnly.today();
}

function booleanFrom(value: unknown): boolean {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		return value.toLowerCase() === "true";
	}

	return false;
}

function serializeError(error: unknown): unknown {
	if (error && typeof error === "object" && "toJSON" in error) {
		const toJSON = (error as { toJSON: () => unknown }).toJSON;
		return toJSON.call(error);
	}

	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
		};
	}

	return error;
}

function jsonHeaders(): Record<string, string> {
	return {
		"content-type": "application/json",
	};
}
