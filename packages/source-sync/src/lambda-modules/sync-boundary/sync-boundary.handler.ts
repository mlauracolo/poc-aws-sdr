import type { Handler } from 'aws-lambda';
import {
  buildSyncBoundaryDrafts,
  createEmptySyncBoundaryOrigins,
  type SyncBoundaryOrigins,
} from './infrastructure/mapper/sync-boundary-partial.mapper';

type SyncBoundaryEvent = {
  startDate?: string;
  endDate?: string;
  includeDrafts?: boolean;
  origins?: Partial<SyncBoundaryOrigins>;
};

function buildDefaultRange(): { startDate: string; endDate: string } {
  const now = new Date();
  const fmt = (d: Date): string =>
    `${d.getUTCFullYear()}` +
    `${String(d.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(d.getUTCDate()).padStart(2, '0')}` +
    `${String(d.getUTCHours()).padStart(2, '0')}` +
    `${String(d.getUTCMinutes()).padStart(2, '0')}`;

  const startDate = process.env.CURSOR_DATE ?? '200001010000';
  return { startDate, endDate: fmt(now) };
}

export const handler: Handler<SyncBoundaryEvent> = async (event) => {
  const { startDate, endDate } =
    event.startDate && event.endDate
      ? { startDate: event.startDate, endDate: event.endDate }
      : buildDefaultRange();

  const origins = {
    ...createEmptySyncBoundaryOrigins(),
    ...event.origins,
  };

  const result = buildSyncBoundaryDrafts(origins);

  console.log('Sync boundary dry-run', {
    range: { startDate, endDate },
    originCounts: {
      nexusDocuments: origins.nexusDocuments.length,
      nexusAnomalies: origins.nexusAnomalies.length,
      sapNotices: origins.sapNotices.length,
      sapOrders: origins.sapOrders.length,
    },
    summary: result.summary,
    unresolved: result.unresolved,
  });

  return {
    startDate,
    endDate,
    summary: result.summary,
    unresolved: result.unresolved,
    drafts: event.includeDrafts ? result.drafts : undefined,
    notes: [
      'Dry-run sin conexion a Oracle.',
      'El ruteo BT/MT y la derivacion stage/status siguen siendo provisorios.',
    ],
  };
};
