export const MATH_DEMO_NUMBERS = [7, 5] as const;

export type MathOperation = "sum" | "multiply";

export function calculateDemoNumbers(operation: MathOperation): number {
	const [left, right] = MATH_DEMO_NUMBERS;

	if (operation === "sum") {
		return left + right;
	}

	return left * right;
}
