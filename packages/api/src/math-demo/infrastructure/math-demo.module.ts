import { Module } from "@nestjs/common";
import { MathDemoController } from "./math-demo.controller";

@Module({
	controllers: [MathDemoController],
})
export class MathDemoModule {}
