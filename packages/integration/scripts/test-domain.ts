/**
 * test-domain.ts
 *
 * Verifica que los mappers y la capa de dominio funcionan correctamente
 * usando entidades dummy — sin necesidad de conexión a base de datos.
 *
 * Uso:
 *   pnpm --filter @sdr/integration run test:domain
 */

import { SdrIntExactianEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-exactian.entity";
import { SdrIntNexusAEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity";
import { SdrIntNexusDEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity";
import { TcvAvisoEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-aviso.entity";
import { TcvOrderEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-order.entity";

import { mapSdrIntExactianEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-exactian.mapper";
import { mapSdrIntNexusAEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-a.mapper";
import { mapSdrIntNexusDEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-d.mapper";
import { mapTcvNoticeEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-aviso.mapper";
import { mapTcvOrderEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-order-bt.mapper";

// ── Helpers ────────────────────────────────────────────────────────────────────
function makeEntity<T>(Cls: new () => T, data: Partial<T>): T {
	return Object.assign(new Cls(), data);
}

function testMapper<T>(label: string, entity: T, map: (e: T) => { ok: boolean; value?: unknown; errors?: unknown }): void {
	const result = map(entity);
	if (result.ok) {
		console.log(`\n✔  ${label} — OK`);
		console.log(JSON.stringify(result.value, null, 2));
	} else {
		console.error(`\n✘  ${label} — MAP_ERROR`);
		console.error(JSON.stringify(result.errors, null, 2));
	}
}

// ── Entidades dummy ────────────────────────────────────────────────────────────
const dummySdrIntExactian = makeEntity(SdrIntExactianEntity, {
	cuit: "20-12345678-9",
	contractorName: "Empresa Dummy SA",
	cuil: "20-12345678-9",
	dni: "12345678",
	nombre: "Juan Pérez",
	status: "ACTIVE",
});

const dummySdrIntNexusA = makeEntity(SdrIntNexusAEntity, {
	anomalyNumber: 100001,
	processDate: "20250101120000",
	docId: 999,
	otNotice: 111,
	stateId: 1,
	stateDescription: "DETECTADA",
	detectionDate: new Date("2025-01-01") as never,
	installation: "INST-001",
	anomalyObservation: "Observación de prueba",
	areaOp: "AREA-OP-1",
	county: "LA PLATA",
	locality: "CITY BELL",
});

const dummySdrIntNexusD = makeEntity(SdrIntNexusDEntity, {
	docId: 200001,
	processDate: "20250101120000",
	documentNumber: "DOC-001",
	type: "CT",
	lastStateId: 3,
	weatherCondition: "DESPEJADO",
	startCut: new Date("2025-01-01T08:00:00"),
	affectedInitial: 50,
	affectedNow: 10,
	electricalHierarchy: "MT/BT",
	supply: "ALI-001",
	ssee: "SSEE-001",
	confirmFailure: "SI",
	affectsSupply: "S",
	areaOp: "AREA-OP-2",
	county: "BERISSO",
	locality: "BARRIO SUR",
});

const dummyTcvAviso = makeEntity(TcvAvisoEntity, {
	noticeNumber: "AV-99001",
	noticeClass: "M1",
	textNotice: "Aviso de prueba dummy",
	priority: "1",
	createdAt: new Date("2025-01-15"),
	orderNumber: "ORD-99001",
	tplnr: "TPLNR-001",
	site: "SITE-X",
	area: "A01",
	division: "D001",
	adrNr: null,
	eventDate: new Date("2025-01-15"),
	lastSapDate: new Date("2025-01-16"),
	closed: "N",
	visible: "Y",
	begru: null,
});

const dummyTcvOrder = makeEntity(TcvOrderEntity, {
	orderNumber: "ORD-99001",
	classOrder: "PM01",
	txtOrder: "Orden de prueba dummy",
	createdAt: new Date("2025-01-15"),
	lastUpdatedDate: new Date("2025-01-16"),
	site: "SITE-X",
	status: "ABIERTO",
	hrText: null,
	parentOrder: null,
	statusCode: "ABRT",
	noticeNumber: "AV-99001",
	supOrder: null,
	visible: "Y",
	tplnr: "TPLNR-001",
	priority: "1",
	noticeArea: "A01",
	divNotice: "D001",
	county: "QUILMES",
	locality: "BERNAL",
	noticeDate: new Date("2025-01-15"),
	priorNotice: "1",
	begru: null,
});

// ── Ejecutar ───────────────────────────────────────────────────────────────────
console.log("=== TEST DOMAIN — sin conexión a DB ===\n");

testMapper("SdrIntExactian", dummySdrIntExactian, mapSdrIntExactianEntityToDomain);
testMapper("SdrIntNexusA",   dummySdrIntNexusA,   mapSdrIntNexusAEntityToDomain);
testMapper("SdrIntNexusD",   dummySdrIntNexusD,   mapSdrIntNexusDEntityToDomain);
testMapper("TcvAviso",       dummyTcvAviso,       mapTcvNoticeEntityToDomain);
testMapper("TcvOrder",       dummyTcvOrder,       mapTcvOrderEntityToDomain);

console.log("\n=== FIN ===");
