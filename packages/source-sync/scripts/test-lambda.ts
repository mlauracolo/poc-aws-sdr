import { writeFileSync } from "fs";
import { DataSource } from "typeorm";

import { SdrIntExactianEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-exactian.entity";
import { SdrIntNexusAEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity";
import { SdrIntNexusDEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity";
import { TcvAvisoEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-aviso.entity";
import { TcvOrderEntity } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-order.entity";

import { SdrIntExactianRepository } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-exactian.origin.repository";
import { SdrIntNexusAOriginRepository } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-a.origin.repository";
import { SdrIntNexusDOriginRepository } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-d.origin.repository";
import { TcvNoticeOriginRepository } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-aviso.origin.repository";
import { TcvOrderOriginRepository } from "../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-order.origin.repository";

import { mapSdrIntExactianEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-exactian.mapper";
import { mapSdrIntNexusAEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-a.mapper";
import { mapSdrIntNexusDEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-d.mapper";
import { mapTcvNoticeEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-aviso.mapper";
import { mapTcvOrderEntityToDomain } from "../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-order-bt.mapper";

// ── Conexión solo a origen ─────────────────────────────────────────────────────
const originDataSource = new DataSource({
	type: "oracle",
	host: process.env.ORIGIN_DB_HOST,
	port: Number(process.env.ORIGIN_DB_PORT ?? 1521),
	username: process.env.ORIGIN_DB_USER,
	password: process.env.ORIGIN_DB_PASSWORD,
	serviceName: process.env.ORIGIN_DB_SERVICE,
	entities: [SdrIntExactianEntity, SdrIntNexusAEntity, SdrIntNexusDEntity, TcvAvisoEntity, TcvOrderEntity],
	// Crea las tablas automáticamente si no existen (útil en local/dev)
	synchronize: process.env.DB_SYNCHRONIZE === "false",
});

// ── Formato de fecha YYYYMMDDHHMM ────────────────────────────────────────────
function fmt(d: Date): string {
	return (
		`${d.getUTCFullYear()}` +
		`${String(d.getUTCMonth() + 1).padStart(2, "0")}` +
		`${String(d.getUTCDate()).padStart(2, "0")}` +
		`${String(d.getUTCHours()).padStart(2, "0")}` +
		`${String(d.getUTCMinutes()).padStart(2, "0")}`
	);
}

function buildDefaultRange(daysBack = 7): { startDate: string; endDate: string } {
	const now = new Date();
	const from = new Date(now);
	from.setUTCDate(from.getUTCDate() - daysBack);
	from.setUTCHours(0, 0, 0, 0);
	return { startDate: fmt(from), endDate: fmt(now) };
}

// ── Helper de lectura ──────────────────────────────────────────────────────────
async function dryReadTable(
	label: string,
	read: () => Promise<{ count: number; rows: unknown[] }>,
): Promise<{ count: number; rows: unknown[] }> {
	try {
		const { count, rows } = await read();
		console.log(`\n── ${label}: ${count} registro(s) en el rango ──`);
		for (const row of rows) {
			console.log(JSON.stringify(row, null, 2));
		}
		return { count, rows };
	} catch (err) {
		console.error(`\n── ${label}: ERROR ──`, err);
		return { count: 0, rows: [] };
	}
}

// ── Punto de entrada ───────────────────────────────────────────────────────────
async function main(): Promise<void> {
	// Rango configurable via env vars; si no se proveen: últimos 7 días a hoy.
	// Ejemplo manual: START_DATE=202501010000 END_DATE=202501080000 pnpm run test:lambda
	const defaults = buildDefaultRange(Number(process.env.DAYS_BACK ?? 7));
	const startDate = process.env.START_DATE ?? defaults.startDate;
	const endDate = process.env.END_DATE ?? defaults.endDate;
	const snapshotLimit = process.env.SNAPSHOT_LIMIT ? Number(process.env.SNAPSHOT_LIMIT) : null;

	console.log(snapshotLimit
		? `\nDRY RUN — últimos ${snapshotLimit} registros por tabla (sin filtro de fecha)`
		: `\nDRY RUN — solo lectura, sin escribir en destino\nRango: ${startDate} → ${endDate}`
	);
	console.log("Conectando a origin DB...");

	await originDataSource.initialize();
	console.log("Conexión OK");

	const [sdrIntExactian, sdrIntNexusA, sdrIntNexusD, tcvAviso, tcvOrder] = await Promise.all([
		dryReadTable("SdrIntExactian", async () => {
			const repo = new SdrIntExactianRepository(originDataSource);
			const entities = snapshotLimit
				? await repo.findLatest(snapshotLimit)
				: await repo.findLatestInRange(startDate, endDate);
			return {
				count: entities.length,
				rows: entities.map((e) => {
					const r = mapSdrIntExactianEntityToDomain(e);
					return r.ok ? r.value : { MAP_ERROR: r.errors };
				}),
			};
		}),
		dryReadTable("SdrIntNexusA", async () => {
			const repo = new SdrIntNexusAOriginRepository(originDataSource);
			const entities = snapshotLimit
				? await repo.findLatest(snapshotLimit)
				: await repo.findLatestInRange(startDate, endDate);
			return {
				count: entities.length,
				rows: entities.map((e) => {
					const r = mapSdrIntNexusAEntityToDomain(e);
					return r.ok ? r.value : { MAP_ERROR: r.errors };
				}),
			};
		}),
		dryReadTable("SdrIntNexusD", async () => {
			const repo = new SdrIntNexusDOriginRepository(originDataSource);
			const entities = snapshotLimit
				? await repo.findLatest(snapshotLimit)
				: await repo.findLatestInRange(startDate, endDate);
			return {
				count: entities.length,
				rows: entities.map((e) => {
					const r = mapSdrIntNexusDEntityToDomain(e);
					return r.ok ? r.value : { MAP_ERROR: r.errors };
				}),
			};
		}),
		dryReadTable("TcvAviso", async () => {
			const repo = new TcvNoticeOriginRepository(originDataSource);
			const entities = snapshotLimit
				? await repo.findLatest(snapshotLimit)
				: await repo.findLatestInRange(startDate, endDate);
			return {
				count: entities.length,
				rows: entities.map((e) => {
					const r = mapTcvNoticeEntityToDomain(e);
					return r.ok ? r.value : { MAP_ERROR: r.errors };
				}),
			};
		}),
		dryReadTable("TcvOrder", async () => {
			const repo = new TcvOrderOriginRepository(originDataSource);
			const entities = snapshotLimit
				? await repo.findLatest(snapshotLimit)
				: await repo.findLatestInRange(startDate, endDate);
			return {
				count: entities.length,
				rows: entities.map((e) => {
					const r = mapTcvOrderEntityToDomain(e);
					return r.ok ? r.value : { MAP_ERROR: r.errors };
				}),
			};
		}),
	]);

	const snapshot = {
		generatedAt: new Date().toISOString(),
		...(snapshotLimit ? { limit: snapshotLimit } : { range: { startDate, endDate } }),
		data: { sdrIntExactian, sdrIntNexusA, sdrIntNexusD, tcvAviso, tcvOrder },
	};

	const filename = `snapshot-${endDate}.json`;
	writeFileSync(filename, JSON.stringify(snapshot, null, 2));
	console.log(`\nSnapshot guardado en: ${filename}`);

	await originDataSource.destroy();
	console.log("\nDry run completado.");
}

void main().catch((err) => {
	console.error(err);
	process.exit(1);
});
