import { Module } from "@nestjs/common";
import { MathDemoModule } from "./math-demo/infrastructure/math-demo.module";
import { SdrIntExactianModule } from "./sdr-int-exactian/infrastructure/service/sdr-int-exactian.module";
import { SdrIntNexusAModule } from "./sdr-int-nexus-a/infrastructure/service/sdr-int-nexus-a.module";
import { SdrIntNexusDModule } from "./sdr-int-nexus-d/insfrastructure/service/sdr-int-nexus-d.module";
import { TcvAvisoModule } from "./tcv-aviso/infrastructure/tcv-aviso.module";
import { TcvOrderModule } from "./tcv-orden/infrastructure/tcv-order.module";

@Module({
	imports: [
		MathDemoModule,
		SdrIntExactianModule,
		SdrIntNexusAModule,
		SdrIntNexusDModule,
		TcvAvisoModule,
		TcvOrderModule,
	],
})
export class AppModule {}
