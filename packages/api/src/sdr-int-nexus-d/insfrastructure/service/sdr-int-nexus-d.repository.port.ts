import { errorResult, okResult, Result } from "@pormeldev/axis-common-lib";
import { SdrIntNexusD, SdrIntNexusDFullData } from "@sdr/domain";
import { SdrIntNexusDCreationError } from "src/sdr-int-nexus-d/application/error/sdr-int-nexus-d-creation.error";
import { SdrIntNexusDApplicationErrorCode } from "src/sdr-int-nexus-d/application/error/sdr-int-nexus-d-error.constants";
import { SdrIntNexusDMappingError } from "src/sdr-int-nexus-d/application/error/sdr-int-nexus-d-mapping.error";
import { IntNexusDQueryPort } from "src/sdr-int-nexus-d/application/port/out/sdr-int-nexus-d.query.port";

export class SdrIntNexusDRepository implements IntNexusDQueryPort {
  private readonly intNexusD = new Map<string, SdrIntNexusDFullData>();

	async create(
		nexusD: SdrIntNexusD,
	): Promise<Result<number, SdrIntNexusDCreationError | SdrIntNexusDMappingError>> {
		try {
			await this.save(nexusD);
      return okResult(nexusD.getDocId());
		} catch (error) {
			if (error instanceof SdrIntNexusDMappingError) {
				return errorResult([error]);
			}

			return errorResult([new SdrIntNexusDCreationError(SdrIntNexusDApplicationErrorCode.SDR_INT_NEXUS_D_CREATION_ERROR.message)]);
		}
	}

	async save(nexusD: SdrIntNexusD): Promise<void> {
		this.intNexusD.set(nexusD.getDocId().toString(), nexusD as unknown as SdrIntNexusDFullData);
	}
}