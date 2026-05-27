/**
 * test-sample-sync.ts
 *
 * Ejecuta un sync completo (lectura origen → escritura destino) con los
 * últimos N registros de cada tabla. Útil para validar el pipeline sin
 * depender de un rango de fechas.
 *
 * Uso:
 *   pnpm run test:sample                  # últimos 10 por tabla (default)
 *   SNAPSHOT_LIMIT=50 pnpm run test:sample
 */

import { DataSource } from 'typeorm';

// ── Entidades origen ───────────────────────────────────────────────────────────
import { SdrIntExactianEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-exactian.entity';
import { SdrIntNexusAEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity';
import { SdrIntNexusDEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity';
import { TcvAvisoEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-aviso.entity';
import { TcvOrderEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/entities/tcv-order.entity';

// ── Entidades destino ──────────────────────────────────────────────────────────
import { SdrIntExactianDestinationEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/entities/srd-int-exactian-destination.entity';
import { SdrIntNexusADestEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/entities/sdr-int-nexus-a.destination.entity';
import { SdrIntNexusDDestinationEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/entities/sdr-int-nexus-d.destination.entity';
import { TcvNoticeDestinationEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/entities/tcv-aviso.destination.entity';
import { TcvOrderDestinationEntity } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/entities/tcv-order.destination.entity';

// ── Repositorios origen ────────────────────────────────────────────────────────
import { SdrIntExactianRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-exactian.origin.repository';
import { SdrIntNexusAOriginRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-a.origin.repository';
import { SdrIntNexusDOriginRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-d.origin.repository';
import { TcvNoticeOriginRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-aviso.origin.repository';
import { TcvOrderOriginRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-order.origin.repository';

// ── Repositorios destino ───────────────────────────────────────────────────────
import { SdrIntExactianDestinationRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-exactian-destination.repository';
import { SdrIntNexusADestinationRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-nexus-a-destination.repository';
import { SdrIntNexusDDestinationRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-nexus-d-destination.repository';
import { TcvNoticeDestinationRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/repositories/tcv-notice-destination.repository';
import { TcvOrderDestinationRepository } from '../src/lambda-modules/sync-boundary/infrastructure/adapter/out/db/typeorm/destination/repositories/tcv-order-destination.repository';

// ── Mappers ────────────────────────────────────────────────────────────────────
import { mapSdrIntExactianEntityToDomain } from '../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-exactian.mapper';
import { mapSdrIntNexusAEntityToDomain } from '../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-a.mapper';
import { mapSdrIntNexusDEntityToDomain } from '../src/lambda-modules/sync-boundary/infrastructure/mapper/sdr-int-nexus-d.mapper';
import { mapTcvNoticeEntityToDomain } from '../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-aviso.mapper';
import { mapTcvOrderEntityToDomain } from '../src/lambda-modules/sync-boundary/infrastructure/mapper/tcv-order-bt.mapper';

// ── Config ─────────────────────────────────────────────────────────────────────
const LIMIT = Number(process.env.SNAPSHOT_LIMIT ?? 10);

const originDataSource = new DataSource({
	type: 'oracle',
	host: process.env.ORIGIN_DB_HOST,
	port: Number(process.env.ORIGIN_DB_PORT ?? 1521),
	username: process.env.ORIGIN_DB_USER,
	password: process.env.ORIGIN_DB_PASSWORD,
	serviceName: process.env.ORIGIN_DB_SERVICE,
	entities: [SdrIntExactianEntity, SdrIntNexusAEntity, SdrIntNexusDEntity, TcvAvisoEntity, TcvOrderEntity],
});

const destinationDataSource = new DataSource({
	type: 'oracle',
	host: process.env.DEST_DB_HOST,
	port: Number(process.env.DEST_DB_PORT ?? 1521),
	username: process.env.DEST_DB_USER,
	password: process.env.DEST_DB_PASSWORD,
	serviceName: process.env.DEST_DB_SERVICE,
	entities: [
		SdrIntExactianDestinationEntity,
		SdrIntNexusADestEntity,
		SdrIntNexusDDestinationEntity,
		TcvNoticeDestinationEntity,
		TcvOrderDestinationEntity,
	],
});

// ── Sync por tabla ─────────────────────────────────────────────────────────────
async function syncSdrIntExactian(): Promise<void> {
	const originRepo = new SdrIntExactianRepository(originDataSource);
	const destRepo = new SdrIntExactianDestinationRepository(destinationDataSource);
	const entities = await originRepo.findLatest(LIMIT);
	let saved = 0;

	for (const entity of entities) {
		const result = mapSdrIntExactianEntityToDomain(entity);
		if (!result.ok) {
			console.warn('[SdrIntExactian] mapping error', result.errors);
			continue;
		}
		const d = result.value;
		const dest = new SdrIntExactianDestinationEntity();
		dest.cuit = d.getCuit() ?? '';
		dest.contractorName = d.getContractorName() ?? null;
		dest.cuil = d.getCuil() ?? null;
		dest.dni = d.getDni() ?? null;
		dest.nombre = d.getNombre() ?? null;
		dest.status = d.getStatus() ?? null;
		await destRepo.save(dest);
		saved++;
	}
	console.log(`[SdrIntExactian] leídos=${entities.length} guardados=${saved}`);
}

async function syncSdrIntNexusA(): Promise<void> {
	const originRepo = new SdrIntNexusAOriginRepository(originDataSource);
	const destRepo = new SdrIntNexusADestinationRepository(destinationDataSource);
	const entities = await originRepo.findLatest(LIMIT);
	let saved = 0;

	for (const entity of entities) {
		const result = mapSdrIntNexusAEntityToDomain(entity);
		if (!result.ok) {
			console.warn('[SdrIntNexusA] mapping error', result.errors);
			continue;
		}
		const d = result.value;
		const dest = new SdrIntNexusADestEntity();
		dest.anomalyNumber = d._anomalyNumber;
		dest.processDate = d._processDate;
		dest.docId = d._docId;
		dest.avisoOt = d._otNotice;
		dest.stateId = d._stateId;
		dest.stateDescription = d._stateDescription;
		dest.detectionDate = d._detectionDate;
		dest.installation = d._installation;
		dest.anomalyObservation = d._anomalyObservation;
		dest.areaOp = d._areaOp;
		dest.county = d._county;
		dest.locality = d._locality;
		await destRepo.save(dest);
		saved++;
	}
	console.log(`[SdrIntNexusA] leídos=${entities.length} guardados=${saved}`);
}

async function syncSdrIntNexusD(): Promise<void> {
	const originRepo = new SdrIntNexusDOriginRepository(originDataSource);
	const destRepo = new SdrIntNexusDDestinationRepository(destinationDataSource);
	const entities = await originRepo.findLatest(LIMIT);
	let saved = 0;

	for (const entity of entities) {
		const result = mapSdrIntNexusDEntityToDomain(entity);
		if (!result.ok) {
			console.warn('[SdrIntNexusD] mapping error', result.errors);
			continue;
		}
		const d = result.value;
		const dest = new SdrIntNexusDDestinationEntity();
		dest.docId = d._docId;
		dest.processDate = d._processDate;
		dest.documentNumber = d._documentNumber;
		dest.type = d._type;
		dest.lastStateId = d._lastStateId;
		dest.weatherCondition = d._weatherCondition;
		dest.startCut = d._startCut ?? null;
		dest.affectedInitial = d._affectedInitial;
		dest.affectedNow = d._affectedNow;
		dest.electricalHierarchy = d._electricalHierarchy;
		dest.supply = d._supply;
		dest.ssee = d._ssee;
		dest.confirmFailure = d._confirmFailure;
		dest.affectsSupply = d._affectsSupply;
		dest.areaOp = d._areaOp;
		dest.county = d._county;
		dest.locality = d._locality;
		await destRepo.save(dest);
		saved++;
	}
	console.log(`[SdrIntNexusD] leídos=${entities.length} guardados=${saved}`);
}

async function syncTcvNotice(): Promise<void> {
	const originRepo = new TcvNoticeOriginRepository(originDataSource);
	const destRepo = new TcvNoticeDestinationRepository(destinationDataSource);
	const entities = await originRepo.findLatest(LIMIT);
	let saved = 0;

	for (const entity of entities) {
		const result = mapTcvNoticeEntityToDomain(entity);
		if (!result.ok) {
			console.warn('[TcvNotice] mapping error', result.errors);
			continue;
		}
		const d = result.value;
		const dest = new TcvNoticeDestinationEntity();
		dest.noticeNumber = d._noticeNumber;
		dest.noticeClass = d._noticeClass;
		dest.textNotice = d._textNotice;
		dest.priority = d._priority;
		dest.createdAt = d._createdAt;
		dest.orderNumber = d._orderNumber;
		dest.tplnr = d._tplnr;
		dest.site = d._site;
		dest.area = d._area;
		dest.division = d._division;
		dest.adrNr = d._adrNr;
		dest.eventDate = d._eventDate;
		dest.lastSapDate = d._lastSapDate;
		dest.closed = d._closed;
		dest.visible = d._visible;
		dest.begru = d._begru;
		await destRepo.save(dest);
		saved++;
	}
	console.log(`[TcvNotice] leídos=${entities.length} guardados=${saved}`);
}

async function syncTcvOrder(): Promise<void> {
	const originRepo = new TcvOrderOriginRepository(originDataSource);
	const destRepo = new TcvOrderDestinationRepository(destinationDataSource);
	const entities = await originRepo.findLatest(LIMIT);
	let saved = 0;

	for (const entity of entities) {
		const result = mapTcvOrderEntityToDomain(entity);
		if (!result.ok) {
			console.warn('[TcvOrder] mapping error', result.errors);
			continue;
		}
		const d = result.value;
		const dest = new TcvOrderDestinationEntity();
		dest.orderNumber = d._orderNumber;
		dest.classOrder = d._classOrder;
		dest.txtOrder = d._textOrder;
		dest.createdAt = d._createdAt;
		dest.lastUpdatedDate = d._lastUpdatedDate;
		dest.site = d._site;
		dest.status = d._status;
		dest.hrText = d._hrText;
		dest.parentOrder = d._parentOrder;
		dest.statusCode = d._statusCode;
		dest.noticeNumber = d._noticeNumber;
		dest.supOrder = d._supOrder;
		dest.visible = d._visible;
		dest.tplnr = d._tplnr;
		dest.priority = d._priority;
		dest.noticeArea = d._noticeArea;
		dest.divNotice = d._divNotice;
		dest.county = d._county;
		dest.locality = d._locality;
		dest.noticeDate = d._noticeDate;
		dest.priorNotice = d._priorNotice;
		dest.begru = d._begru;
		await destRepo.save(dest);
		saved++;
	}
	console.log(`[TcvOrder] leídos=${entities.length} guardados=${saved}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
	console.log(`\nSAMPLE SYNC — últimos ${LIMIT} registros por tabla`);
	console.log('Conectando a origen y destino...');

	await Promise.all([
		originDataSource.initialize(),
		destinationDataSource.initialize(),
	]);
	console.log('Conexiones OK\n');

	const results = await Promise.allSettled([
		syncSdrIntExactian(),
		syncSdrIntNexusA(),
		syncSdrIntNexusD(),
		syncTcvNotice(),
		syncTcvOrder(),
	]);

	for (const r of results) {
		if (r.status === 'rejected') {
			console.error('Sync parcial fallido:', r.reason);
		}
	}

	await Promise.all([
		originDataSource.destroy(),
		destinationDataSource.destroy(),
	]);
	console.log('\nSample sync completado.');
}

void main().catch((err) => {
	console.error(err);
	process.exit(1);
});
