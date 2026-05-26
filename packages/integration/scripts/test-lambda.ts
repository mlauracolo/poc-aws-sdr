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
	port: 1521,
	username: process.env.ORIGIN_DB_USER,
	password: process.env.ORIGIN_DB_PASSWORD,
	serviceName: process.env.ORIGIN_DB_SERVICE,
	entities: [SdrIntExactianEntity, SdrIntNexusAEntity, SdrIntNexusDEntity, TcvAvisoEntity, TcvOrderEntity],
});

// ── Helper de lectura ──────────────────────────────────────────────────────────
async function dryReadTable(
	label: string,
	read: () => Promise<{ count: number; rows: unknown[] }>,
): Promise<void> {
	try {
		const { count, rows } = await read();
		console.log(`\n── ${label}: ${count} registro(s) en el rango ──`);
		for (const row of rows) {
			console.log(JSON.stringify(row, null, 2));
		}
	} catch (err) {
		console.error(`\n── ${label}: ERROR ──`, err);
	}
}

// ── Punto de entrada ───────────────────────────────────────────────────────────
async function main(): Promise<void> {
	// Rango configurable via env vars; si no se proveen usa el default del handler
	const startDate = process.env.START_DATE ?? "202501010000";
	const endDate = process.env.END_DATE ?? "202501020000";

	console.log(`\nDRY RUN — solo lectura, sin escribir en destino`);
	console.log(`Rango: ${startDate} → ${endDate}`);
	console.log("Conectando a origin DB...");

	await originDataSource.initialize();
	console.log("Conexión OK");

	await dryReadTable("SdrIntExactian", async () => {
		const repo = new SdrIntExactianRepository(originDataSource);
		const entities = await repo.findLatestInRange(startDate, endDate);
		return {
			count: entities.length,
			rows: entities.map((e) => {
				const r = mapSdrIntExactianEntityToDomain(e);
				return r.ok ? r.value : { MAP_ERROR: r.errors };
			}),
		};
	});

	await dryReadTable("SdrIntNexusA", async () => {
		const repo = new SdrIntNexusAOriginRepository(originDataSource);
		const entities = await repo.findLatestInRange(startDate, endDate);
		return {
			count: entities.length,
			rows: entities.map((e) => {
				const r = mapSdrIntNexusAEntityToDomain(e);
				return r.ok ? r.value : { MAP_ERROR: r.errors };
			}),
		};
	});

	await dryReadTable("SdrIntNexusD", async () => {
		const repo = new SdrIntNexusDOriginRepository(originDataSource);
		const entities = await repo.findLatestInRange(startDate, endDate);
		return {
			count: entities.length,
			rows: entities.map((e) => {
				const r = mapSdrIntNexusDEntityToDomain(e);
				return r.ok ? r.value : { MAP_ERROR: r.errors };
			}),
		};
	});

	await dryReadTable("TcvAviso", async () => {
		const repo = new TcvNoticeOriginRepository(originDataSource);
		const entities = await repo.findLatestInRange(startDate, endDate);
		return {
			count: entities.length,
			rows: entities.map((e) => {
				const r = mapTcvNoticeEntityToDomain(e);
				return r.ok ? r.value : { MAP_ERROR: r.errors };
			}),
		};
	});

	await dryReadTable("TcvOrder", async () => {
		const repo = new TcvOrderOriginRepository(originDataSource);
		const entities = await repo.findLatestInRange(startDate, endDate);
		return {
			count: entities.length,
			rows: entities.map((e) => {
				const r = mapTcvOrderEntityToDomain(e);
				return r.ok ? r.value : { MAP_ERROR: r.errors };
			}),
		};
	});

	await originDataSource.destroy();
	console.log("\nDry run completado.");
}

void main().catch((err) => {
	console.error(err);
	process.exit(1);
});
