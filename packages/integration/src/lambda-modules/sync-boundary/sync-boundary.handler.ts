import type { Handler } from 'aws-lambda';
import { DataSource } from 'typeorm';
import { SdrIntNexusAOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-a.origin.repository';
import { SdrIntNexusDOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/sdr-int-nexus-d.origin.repository';
import { TcvOrderBtOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-order-bt.origin.repository';
import { TcvOrderMtOriginRepository } from './infrastructure/adapter/out/db/typeorm/origin/repositories/tcv-order-mt.origin.repository';
import { mapSdrIntNexusAEntityToDomain } from './infrastructure/mapper/sdr-int-nexus-a.mapper';
import { mapSdrIntNexusDEntityToDomain } from './infrastructure/mapper/sdr-int-nexus-d.mapper';
import { mapTcvOrderBtEntityToDomain } from './infrastructure/mapper/tcv-order-bt.mapper';
import { mapTcvOrderMtEntityToDomain } from './infrastructure/mapper/tcv-order-mt.mapper';

// TODO: configure with real connection options
const originDataSource = new DataSource({
  type: 'oracle',
  // host, port, username, password, sid/serviceName
});

async function syncSdrIntNexusA(dataSource: DataSource): Promise<void> {
  const repo = new SdrIntNexusAOriginRepository(dataSource);
  const entities = await repo.findAll();

  for (const entity of entities) {
    const result = mapSdrIntNexusAEntityToDomain(entity);
    if (result.ok) {
      // TODO: persist result.value via destination repository
      console.log('SdrIntNexusA synced', result.value.getAnomalyNumber());
      continue;
    }

    console.warn('SdrIntNexusA mapping failed', { entity, errors: result.errors });
  }
}

async function syncSdrIntNexusD(dataSource: DataSource): Promise<void> {
  const repo = new SdrIntNexusDOriginRepository(dataSource);
  const entities = await repo.findAll();

  for (const entity of entities) {
    const result = mapSdrIntNexusDEntityToDomain(entity);
    if (result.ok) {
      // TODO: persist result.value via destination repository
      console.log('SdrIntNexusD synced', result.value.getDocId());
      continue;
    }

    console.warn('SdrIntNexusD mapping failed', { entity, errors: result.errors });
  }
}

async function syncTcvOrderBt(dataSource: DataSource): Promise<void> {
  const repo = new TcvOrderBtOriginRepository(dataSource);
  const entities = await repo.findAll();

  for (const entity of entities) {
    const result = mapTcvOrderBtEntityToDomain(entity);
    if (result.ok) {
      // TODO: persist result.value via destination repository
      console.log('TcvOrderBt synced', result.value.getOrderNumber());
      continue;
    }

    console.warn('TcvOrderBt mapping failed', { entity, errors: result.errors });
  }
}

async function syncTcvOrderMt(dataSource: DataSource): Promise<void> {
  const repo = new TcvOrderMtOriginRepository(dataSource);
  const entities = await repo.findAll();

  for (const entity of entities) {
    const result = mapTcvOrderMtEntityToDomain(entity);
    if (result.ok) {
      // TODO: persist result.value via destination repository
      console.log('TcvOrderMt synced', result.value.getOrderNumber());
      continue;
    }

    console.warn('TcvOrderMt mapping failed', { entity, errors: result.errors });
  }
}

export const handler: Handler = async () => {
  if (!originDataSource.isInitialized) {
    await originDataSource.initialize();
  }

  const results = await Promise.allSettled([
    syncSdrIntNexusA(originDataSource),
    syncSdrIntNexusD(originDataSource),
    syncTcvOrderBt(originDataSource),
    syncTcvOrderMt(originDataSource),
  ]);

  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('Sync failed', result.reason);
    }
  }
};
