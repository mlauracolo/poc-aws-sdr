import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handler } from "../src/lambda-modules/migrate-books/migrate-books.handler";

async function main(): Promise<void> {
	const event = createHttpApiEvent({
		title: "Clean Architecture",
		year: 2017,
		cost: 100,
		availableSince: "2017-01-01",
		inLibraryUseOnly: false,
	});

	const response = await handler(event);

	console.log(response);
}

function createHttpApiEvent(
	body: Record<string, unknown>,
): APIGatewayProxyEventV2 {
	return {
		version: "2.0",
		routeKey: "POST /books",
		rawPath: "/books",
		rawQueryString: "",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
		isBase64Encoded: false,
		requestContext: {
			accountId: "123456789012",
			apiId: "local-api",
			domainName: "localhost",
			domainPrefix: "localhost",
			http: {
				method: "POST",
				path: "/books",
				protocol: "HTTP/1.1",
				sourceIp: "127.0.0.1",
				userAgent: "local-test",
			},
			requestId: "local-request",
			routeKey: "POST /books",
			stage: "$default",
			time: new Date().toISOString(),
			timeEpoch: Date.now(),
		},
	};
}

void main();
