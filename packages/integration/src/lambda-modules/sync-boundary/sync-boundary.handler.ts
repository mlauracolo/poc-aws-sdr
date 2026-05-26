import { SdrIntNexusAOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-a.origin.repository';
import type { Handler } from 'aws-lambda';
import { DataSource } from 'typeorm';
import { SdrIntNexusDOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-d.origin.repository';
import { TcvOrderOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-order.origin.repository';
import { SdrIntNexusADestinationRepository } from './infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-nexus-a-destination.repository';
import { SdrIntNexusDDestinationRepository } from './infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-nexus-d-destination.repository';
import { SdrIntNexusADestEntity } from './infrastructure/adapter/out/db/typeorm/destination/entities/sdr-int-nexus-a.destination.entity';
import { mapSdrIntNexusAEntityToDomain } from './infrastructure/mapper/sdr-int-nexus-a.mapper';
import { mapTcvOrderEntityToDomain } from './infrastructure/mapper/tcv-order-bt.mapper';
import { SdrIntNexusAEntity } from './infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity';
import { SdrIntNexusDEntity } from './infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity';
import { TcvAvisoEntity } from './infrastructure/adapter/out/db/typeorm/origin/entities/tcv-aviso.entity';
import { TcvOrderEntity } from './infrastructure/adapter/out/db/typeorm/origin/entities/tcv-order.entity';
import { SdrIntExactianEntity } from './infrastructure/adapter/out/db/typeorm/origin/entities/sdr-int-exactian.entity';
import { SdrIntNexusDDestinationEntity } from './infrastructure/adapter/out/db/typeorm/destination/entities/sdr-int-nexus-d.destination.entity';
import { TcvNoticeDestinationEntity } from './infrastructure/adapter/out/db/typeorm/destination/entities/tcv-aviso.destination.entity';
import { TcvOrderDestinationEntity } from './infrastructure/adapter/out/db/typeorm/destination/entities/tcv-order.destination.entity';
import { SdrIntExactianDestinationEntity } from './infrastructure/adapter/out/db/typeorm/destination/entities/srd-int-exactian-destination.entity';
import { TcvOrderDestinationRepository } from './infrastructure/adapter/out/db/typeorm/destination/repositories/tcv-order-destination.repository';
import { SdrIntExactianRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-exactian.origin.repository';
import { SdrIntExactianDestinationRepository } from './infrastructure/adapter/out/db/typeorm/destination/repositories/sdr-int-exactian-destination.repository';
import { mapSdrIntExactianEntityToDomain } from './infrastructure/mapper/sdr-int-exactian.mapper';
import { TcvNoticeDestinationRepository } from './infrastructure/adapter/out/db/typeorm/destination/repositories/tcv-notice-destination.repository';
import { TcvNoticeOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-aviso.origin.repository';
import { mapTcvNoticeEntityToDomain } from './infrastructure/mapper/tcv-aviso.mapper';
import { mapSdrIntNexusDEntityToDomain } from './infrastructure/mapper/sdr-int-nexus-d.mapper';

/**
 * Rango de fechas que acepta el handler como payload del evento Lambda.
 * El formato debe coincidir con el almacenado en FEC_PROC (ej. 'YYYYMMDD').
 * Si no se provee, se usa el día anterior como rango de un día.
 */
type SyncBoundaryEvent = {
  startDate?: string;
  endDate?: string;
};

function buildDefaultRange(): { startDate: string; endDate: string } {
  const now = new Date();
  // Formato del cursor: YYYYMMDDHHMM (12 chars). Permite múltiples runs por día
  // sin reprocesar el mismo rango (ej. cada 30 min).
  const fmt = (d: Date): string =>
    `${d.getUTCFullYear()}` +
    `${String(d.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(d.getUTCDate()).padStart(2, '0')}` +
    `${String(d.getUTCHours()).padStart(2, '0')}` +
    `${String(d.getUTCMinutes()).padStart(2, '0')}`;

  // Cursor: último instante procesado exitosamente (formato YYYYMMDDHHMM).
  // Se lee de la variable de entorno CURSOR_DATE.
  // Después de cada ejecución exitosa, actualizar CURSOR_DATE al valor de endDate.
  // TODO: migrar a SSM Parameter Store (/sync-boundary/cursor) para persistencia automática.
  const startDate = process.env.CURSOR_DATE ?? '200001010000';
  return { startDate, endDate: fmt(now) };
}

const originDataSource = new DataSource({
  type: 'oracle',
  // host: process.env.ORIGIN_DB_HOST,
  port: Number(1521),
  // username: process.env.ORIGIN_DB_USER,
  // password: process.env.ORIGIN_DB_PASSWORD,
  // serviceName: process.env.ORIGIN_DB_SERVICE,
  entities: [SdrIntExactianEntity, SdrIntNexusAEntity, SdrIntNexusDEntity, TcvAvisoEntity, TcvOrderEntity],
});

const destinationDataSource = new DataSource({
  type: 'oracle',
  // host: process.env.DEST_DB_HOST,
  port: Number(1521),
  // username: process.env.DEST_DB_USER,
  // password: process.env.DEST_DB_PASSWORD,
  // serviceName: process.env.DEST_DB_SERVICE,
  entities: [
    SdrIntExactianDestinationEntity,
    SdrIntNexusADestEntity,
    SdrIntNexusDDestinationEntity,
    TcvNoticeDestinationEntity,
    TcvOrderDestinationEntity,
  ],
});

async function syncSdrIntNexusA(
  origin: DataSource,
  destiny: DataSource,
  startDate: string,
  endDate: string  
): Promise<void> {
  const originRepo = new SdrIntNexusAOriginRepository(origin);
  const destRepo = new SdrIntNexusADestinationRepository(destiny);
  const entities = await originRepo.findLatestInRange(startDate, endDate);

  for (const entity of entities) {
    const result = mapSdrIntNexusAEntityToDomain(entity);
    if (!result.ok) {
      console.warn('SdrIntNexusA mapping failed', { entity, errors: result.errors });
      continue;
    }
    const d = result.value;
    const destEntity = new SdrIntNexusADestEntity();
    destEntity.anomalyNumber = d._anomalyNumber;
    destEntity.processDate = d._processDate;
    destEntity.docId = d._docId;
    destEntity.avisoOt = d._otNotice;
    destEntity.stateId = d._stateId;
    destEntity.stateDescription = d._stateDescription;
    destEntity.detectionDate = d._detectionDate;
    destEntity.installation = d._installation;
    destEntity.anomalyObservation = d._anomalyObservation;
    destEntity.areaOp = d._areaOp;
    destEntity.county = d._county;
    destEntity.locality = d._locality;
    await destRepo.save(destEntity);
    console.log('SdrIntNexusA saved', d._anomalyNumber);
  }
}

async function syncSdrIntExactian(origin: DataSource, destiny: DataSource, startDate: string, endDate: string): Promise<void> {
  const originRepo = new SdrIntExactianRepository(origin);
  const destinationRepo = new SdrIntExactianDestinationRepository(destiny);
  const entities = await originRepo.findLatestInRange(startDate, endDate);

  for (const entity of entities) {
    const result = mapSdrIntExactianEntityToDomain(entity);
    if (!result.ok) {
      console.warn('SdrIntExactian mapping failed', { entity, errors: result.errors });
      continue;
    }
    const d = result.value;
    const destinyEntity = new SdrIntExactianDestinationEntity();
    destinyEntity.cuit = d._cuit;
    destinyEntity.contractorName = d._contractorName;
    destinyEntity.cuil = d._cuil;
    destinyEntity.dni = d._dni;
    destinyEntity.nombre = d._nombre;
    destinyEntity.status = d._status;
    await destinationRepo.save(destinyEntity);
    console.log('SdrIntExactian saved', d._cuit);
  }
}

async function syncSdrIntNexusD(origin: DataSource, destiny: DataSource, startDate: string, endDate: string): Promise<void> {
  const originRepo = new SdrIntNexusDOriginRepository(origin);
  const destRepo = new SdrIntNexusDDestinationRepository(destiny);
  const entities = await originRepo.findLatestInRange(startDate, endDate);

  for (const entity of entities) {
    const result = mapSdrIntNexusDEntityToDomain(entity);
    if (!result.ok) {
      console.warn('SdrIntNexusD mapping failed', { entity, errors: result.errors });
      continue;
    }
    const d = result.value;
    const destEntity = new SdrIntNexusDDestinationEntity();
    destEntity.docId = d._docId;
    destEntity.processDate = d._processDate;
    destEntity.documentNumber = d._documentNumber;
    destEntity.type = d._type;
    destEntity.lastStateId = d._lastStateId;
    destEntity.weatherCondition = d._weatherCondition;
    destEntity.startCut = d._startCut ? d._startCut : null;
    destEntity.affectedInitial = d._affectedInitial;
    destEntity.affectedNow = d._affectedNow;
    destEntity.affectedInitial = d._affectedInitial;
    destEntity.affectedNow = d._affectedNow;
    destEntity.electricalHierarchy = d._electricalHierarchy;
    destEntity.supply = d._supply;
    destEntity.ssee = d._ssee;
    destEntity.confirmFailure = d._confirmFailure;
    destEntity.affectsSupply = d._affectsSupply;
    destEntity.areaOp = d._areaOp;
    destEntity.county = d._county;
    destEntity.locality = d._locality;
    await destRepo.save(destEntity);
    console.log('SdrIntNexusD saved', d._docId);
  }
}

async function syncTcvNotice(origin: DataSource, destiny: DataSource, startDate: string, endDate: string): Promise<void> {
  const originRepo = new TcvNoticeOriginRepository(origin);
  const destinationRepo = new TcvNoticeDestinationRepository(destiny);
  const entities = await originRepo.findLatestInRange(startDate, endDate);

  for (const entity of entities) {
    const result = mapTcvNoticeEntityToDomain(entity);
    if (!result.ok) {
      console.warn('TcvNotice mapping failed', { entity, errors: result.errors });
      continue;
    }
    const d = result.value;
    const destEntity = new TcvNoticeDestinationEntity();
    destEntity.noticeNumber = d._noticeNumber;
    destEntity.noticeClass = d._noticeClass;
    destEntity.textNotice = d._textNotice;
    destEntity.priority = d._priority;
    destEntity.createdAt = d._createdAt;
    destEntity.orderNumber = d._orderNumber;
    destEntity.tplnr = d._tplnr;
    destEntity.site = d._site;
    destEntity.area = d._area;
    destEntity.division = d._division;
    destEntity.adrNr = d._adrNr;
    destEntity.eventDate = d._eventDate;
    destEntity.lastSapDate = d._lastSapDate;
    destEntity.closed = d._closed;
    destEntity.visible = d._visible;
    destEntity.begru = d._begru;
    
    await destinationRepo.save(destEntity);
    console.log('TcvNotice saved', d._noticeNumber);
  }
}

async function syncTcvOrder(origin: DataSource, destiny: DataSource, startDate: string, endDate: string): Promise<void> {
  const originRepo = new TcvOrderOriginRepository(origin);
  const destRepo = new TcvOrderDestinationRepository(destiny);
  const entities = await originRepo.findLatestInRange(startDate, endDate);

  for (const entity of entities) {
    const result = mapTcvOrderEntityToDomain(entity);
    if (!result.ok) {
      console.warn('TcvOrder mapping failed', { entity, errors: result.errors });
      continue;
    }
    const d = result.value;
    const destEntity = new TcvOrderDestinationEntity();
    destEntity.orderNumber = d._orderNumber;
    destEntity.classOrder = d._classOrder;
    destEntity.txtOrder = d._textOrder;
    destEntity.createdAt = d._createdAt;
    destEntity.lastUpdatedDate = d._lastUpdatedDate;
    destEntity.site = d._site;
    destEntity.status = d._status;
    destEntity.hrText = d._hrText;
    destEntity.parentOrder = d._parentOrder;
    destEntity.statusCode = d._statusCode;
    destEntity.noticeNumber = d._noticeNumber;
    destEntity.supOrder = d._supOrder;
    destEntity.visible = d._visible;
    destEntity.tplnr = d._tplnr;
    destEntity.priority = d._priority;
    destEntity.noticeArea = d._noticeArea;
    destEntity.divNotice = d._divNotice;
    destEntity.county = d._county;
    destEntity.locality = d._locality;
    destEntity.noticeDate = d._noticeDate;
    destEntity.priorNotice = d._priorNotice;
    destEntity.begru = d._begru;
    await destRepo.save(destEntity);
    console.log('TcvOrderBt saved', d._orderNumber);
  }
}

export const handler: Handler<SyncBoundaryEvent> = async (event) => {
  const { startDate, endDate } =
    event.startDate && event.endDate
      ? { startDate: event.startDate, endDate: event.endDate }
      : buildDefaultRange();

  console.log('Sync range', { startDate, endDate });

  await Promise.all([
    originDataSource.isInitialized ? Promise.resolve() : originDataSource.initialize(),
    destinationDataSource.isInitialized ? Promise.resolve() : destinationDataSource.initialize(),
  ]);

  const results = await Promise.allSettled([
    syncSdrIntExactian(originDataSource, destinationDataSource, startDate, endDate),
    syncSdrIntNexusA(originDataSource, destinationDataSource, startDate, endDate),
    syncSdrIntNexusD(originDataSource, destinationDataSource, startDate, endDate),
    syncTcvNotice(originDataSource, destinationDataSource, startDate, endDate),
    syncTcvOrder(originDataSource, destinationDataSource, startDate, endDate),
  ]);

  let allSucceeded = true;
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Sync failed', result.reason);
      allSucceeded = false;
    }
  }

  if (allSucceeded) {
    // Próximo cursor = endDate de este rango. Actualizar CURSOR_DATE en la Lambda
    // (o en SSM Parameter Store cuando se migre).
    console.log(`[CURSOR] Sync completado. Próximo CURSOR_DATE=${endDate}`);
  }
};