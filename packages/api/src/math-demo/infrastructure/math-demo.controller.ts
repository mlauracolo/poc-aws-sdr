import { Get } from "@nestjs/common";
import { ApiJsonApiController } from "@pormeldev/axis-nestjs-common";
import { calculateDemoNumbers, MATH_DEMO_NUMBERS } from "@sdr/domain";

@ApiJsonApiController("math-demo")
export class MathDemoController {
	@Get("sample")
	getSample() {

		const result = {
			numbers: MATH_DEMO_NUMBERS,
			sum: calculateDemoNumbers("sum"),
			product: calculateDemoNumbers("multiply"),
		};
		console.log(result);

		return result;


	}
}
