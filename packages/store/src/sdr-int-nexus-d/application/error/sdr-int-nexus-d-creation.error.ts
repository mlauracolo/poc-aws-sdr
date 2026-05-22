import { CodedApplicationError } from "@pormeldev/axis-common-lib";

export class SdrIntNexusDCreationError extends CodedApplicationError {
  constructor(
		message: string,
		field?: string,
		code?: string,
		context?: Record<string, unknown>,
	) {
		super(
			message || "SDR Int Nexus D creation error",
			field || "sdrIntNexusD",
			code ? String(code) : "SDR_INT_NEXUS_D_CREATION_ERROR",
			context || {},
		);
		this.name = "SdrIntNexusDCreationError";
		Object.setPrototypeOf(this, SdrIntNexusDCreationError.prototype);
	}
}