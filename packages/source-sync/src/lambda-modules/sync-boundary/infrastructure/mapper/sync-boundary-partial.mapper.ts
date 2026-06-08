import { randomUUID } from 'node:crypto';
import type { SdrIntNexusAEntity } from '../adapter/out/db/typeorm/origin/entities/sdr-int-nexus-a.entity';
import type { SdrIntNexusDEntity } from '../adapter/out/db/typeorm/origin/entities/sdr-int-nexus-d.entity';
import type { TcvAvisoEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-aviso.entity';
import type { TcvOrderEntity } from '../adapter/out/db/typeorm/origin/entities/tcv-order.entity';

export type SyncBoundaryOrigins = {
  nexusDocuments: ReadonlyArray<SdrIntNexusDEntity>;
  nexusAnomalies: ReadonlyArray<SdrIntNexusAEntity>;
  sapNotices: ReadonlyArray<TcvAvisoEntity>;
  sapOrders: ReadonlyArray<TcvOrderEntity>;
};

export type SyncBoundaryKind = 'bt' | 'mt';

type SyncBoundaryTemporalValue = Date | string | null;

type SyncBoundaryDocumentDraft = {
  destination: 'bt-document' | 'mt-document';
  nexusDocumentNumber: string;
  cutStartAt: SyncBoundaryTemporalValue;
  weatherCondition: string | null;
  region: string | null;
  operativeArea: string | null;
  county: string | null;
  locality: string | null;
  initialAffectedCustomers: number | null;
  affectedCustomers: number | null;
  electricalHierarchy?: string | null;
  confirmedFailure?: string | null;
};

type SyncBoundaryGridEventDraft = {
  destination: 'bt-grid-event' | 'mt-grid-event';
  id: string;
  nexusDocumentNumber: string | null;
  nexusAnomalyNumber: string | null;
  sapNotificationNumber: string | null;
  sapOrderNumber: string | null;
  eventType: string;
  detectionDate: SyncBoundaryTemporalValue;
  priority: string | null;
  technicalLocation: string | null;
  eventStatus: string;
  affectsSupply: number | null;
  installation: string | null;
  sourceDescription: string | null;
  feeder?: string | null;
  substationCode?: string | null;
};

type SyncBoundaryWorkOrderDraft = {
  destination: 'bt-work-order' | 'mt-work-order';
  id: string;
  sapNotificationNumber: string;
  sapOrderNumber: string;
  parentSapOrderNumber: string | null;
  rootSapOrderNumber: string | null;
  stage: string;
  normalizedStatus: string;
  sapEstado: string | null;
  sapStatusCode: string | null;
  sapLastUpdatedAt: SyncBoundaryTemporalValue;
  sapCursorAt: SyncBoundaryTemporalValue;
  description: string | null;
  technicalLocation: string | null;
  sapIsVisible: number | null;
  sapCreationDate: SyncBoundaryTemporalValue;
};

export type SyncBoundaryDraft = {
  kind: SyncBoundaryKind;
  correlationKey: string;
  sources: {
    physicalFailureKey: string | null;
    sapBridgeKey: string | null;
    documentNumber: string | null;
    docId: number | null;
    anomalyNumber: string | null;
    noticeNumber: string | null;
    rootOrderNumber: string | null;
  };
  document: SyncBoundaryDocumentDraft | null;
  gridEvent: SyncBoundaryGridEventDraft;
  workOrders: SyncBoundaryWorkOrderDraft[];
  mappingNotes: string[];
  missingSources: string[];
};

export type SyncBoundaryDraftResult = {
  drafts: SyncBoundaryDraft[];
  summary: {
    totalDrafts: number;
    btDrafts: number;
    mtDrafts: number;
    documentOnlyDrafts: number;
    orphanNoticeDrafts: number;
    orphanOrderDrafts: number;
  };
  unresolved: string[];
};

type CandidateContext = {
  document?: SdrIntNexusDEntity;
  anomaly?: SdrIntNexusAEntity;
  notice?: TcvAvisoEntity;
  orders: TcvOrderEntity[];
};

export function createEmptySyncBoundaryOrigins(): SyncBoundaryOrigins {
  return {
    nexusDocuments: [],
    nexusAnomalies: [],
    sapNotices: [],
    sapOrders: [],
  };
}

export function buildSyncBoundaryDrafts(origins: Partial<SyncBoundaryOrigins>): SyncBoundaryDraftResult {
  const snapshot = {
    ...createEmptySyncBoundaryOrigins(),
    ...origins,
  };

  const documentsById = new Map(snapshot.nexusDocuments.map((document) => [document.docId, document]));
  const noticesByNumber = new Map(snapshot.sapNotices.map((notice) => [notice.noticeNumber, notice]));
  const ordersByNotice = groupBy(snapshot.sapOrders, (order) => order.noticeNumber);
  const usedDocumentIds = new Set<number>();
  const usedNoticeNumbers = new Set<string>();
  const drafts: SyncBoundaryDraft[] = [];
  const unresolved = ['SdrIntExactian queda fuera de este mapper provisorio.'];

  for (const anomaly of snapshot.nexusAnomalies) {
    const noticeNumber = anomaly.otNotice ? String(anomaly.otNotice) : null;
    const document = anomaly.docId ? documentsById.get(anomaly.docId) : undefined;
    const notice = noticeNumber ? noticesByNumber.get(noticeNumber) : undefined;
    const orders = noticeNumber ? ordersByNotice.get(noticeNumber) ?? [] : [];
    const kind = resolveKind({ document, notice, orders });
    const workOrders = buildWorkOrders(kind, noticeNumber, orders);
    const rootOrderNumber = pickRootOrderNumber(orders);

    if (anomaly.docId) {
      usedDocumentIds.add(anomaly.docId);
    }
    if (noticeNumber) {
      usedNoticeNumbers.add(noticeNumber);
    }

    drafts.push({
      kind,
      correlationKey: buildPhysicalFailureKey(document?.documentNumber, anomaly.anomalyNumber),
      sources: {
        physicalFailureKey: buildPhysicalFailureKey(document?.documentNumber, anomaly.anomalyNumber),
        sapBridgeKey: noticeNumber,
        documentNumber: document?.documentNumber ?? null,
        docId: anomaly.docId ?? null,
        anomalyNumber: String(anomaly.anomalyNumber),
        noticeNumber,
        rootOrderNumber,
      },
      document: buildDocumentDraft(kind, document),
      gridEvent: buildGridEventDraft(kind, {
        document,
        anomaly,
        notice,
        orders,
      }),
      workOrders,
      mappingNotes: buildMappingNotes({ document, anomaly, notice, orders, kind }),
      missingSources: buildMissingSources({ document, anomaly, notice, orders }),
    });
  }

  for (const notice of snapshot.sapNotices) {
    if (usedNoticeNumbers.has(notice.noticeNumber)) {
      continue;
    }

    const orders = ordersByNotice.get(notice.noticeNumber) ?? [];
    const kind = resolveKind({ notice, orders });

    drafts.push({
      kind,
      correlationKey: `notice:${notice.noticeNumber}`,
      sources: {
        physicalFailureKey: null,
        sapBridgeKey: notice.noticeNumber,
        documentNumber: null,
        docId: null,
        anomalyNumber: null,
        noticeNumber: notice.noticeNumber,
        rootOrderNumber: pickRootOrderNumber(orders),
      },
      document: null,
      gridEvent: buildGridEventDraft(kind, { notice, orders }),
      workOrders: buildWorkOrders(kind, notice.noticeNumber, orders),
      mappingNotes: [
        'Caso armado solo con SAP porque no apareció la anomalía Nexus.',
        'Se usa AVISO_NRO como clave técnica provisoria.',
      ],
      missingSources: ['Falta SDR_INT_NEXUS_A para completar la anomalia.'],
    });
  }

  for (const order of snapshot.sapOrders) {
    if (usedNoticeNumbers.has(order.noticeNumber) || noticesByNumber.has(order.noticeNumber)) {
      continue;
    }

    const kind = resolveKind({ orders: [order] });
    drafts.push({
      kind,
      correlationKey: `order:${order.orderNumber}`,
      sources: {
        physicalFailureKey: null,
        sapBridgeKey: order.noticeNumber,
        documentNumber: null,
        docId: null,
        anomalyNumber: null,
        noticeNumber: order.noticeNumber,
        rootOrderNumber: pickRootOrderNumber([order]),
      },
      document: null,
      gridEvent: buildGridEventDraft(kind, { orders: [order] }),
      workOrders: buildWorkOrders(kind, order.noticeNumber, [order]),
      mappingNotes: [
        'Caso huérfano armado solo con TCV_ORDEN.',
        'Sirve para detectar órdenes sin aviso o sin cruce Nexus.',
      ],
      missingSources: [
        'Falta TCV_AVISO para prioridad y descripción del aviso.',
        'Falta SDR_INT_NEXUS_A para documento/anomalía.',
      ],
    });
  }

  for (const document of snapshot.nexusDocuments) {
    if (usedDocumentIds.has(document.docId)) {
      continue;
    }

    const kind = resolveKind({ document, orders: [] });
    drafts.push({
      kind,
      correlationKey: `document:${document.docId}`,
      sources: {
        physicalFailureKey: document.documentNumber ? `doc:${document.documentNumber}` : `document:${document.docId}`,
        sapBridgeKey: null,
        documentNumber: document.documentNumber,
        docId: document.docId,
        anomalyNumber: null,
        noticeNumber: null,
        rootOrderNumber: null,
      },
      document: buildDocumentDraft(kind, document),
      gridEvent: buildGridEventDraft(kind, { document, orders: [] }),
      workOrders: [],
      mappingNotes: [
        'Documento Nexus sin anomalía ni aviso asociado.',
        'Cubre el caso borde de documento macro o corte programado.',
      ],
      missingSources: [
        'Falta SDR_INT_NEXUS_A para obtener el puente AVISO_OT.',
        'Falta SAP para obtener ordenes y ubicación técnica.',
      ],
    });
  }

  return {
    drafts,
    summary: {
      totalDrafts: drafts.length,
      btDrafts: drafts.filter((draft) => draft.kind === 'bt').length,
      mtDrafts: drafts.filter((draft) => draft.kind === 'mt').length,
      documentOnlyDrafts: drafts.filter(
        (draft) => draft.sources.noticeNumber === null && draft.sources.anomalyNumber === null,
      ).length,
      orphanNoticeDrafts: drafts.filter(
        (draft) => draft.sources.noticeNumber !== null && draft.sources.anomalyNumber === null && draft.document === null,
      ).length,
      orphanOrderDrafts: drafts.filter(
        (draft) => draft.correlationKey.startsWith('order:'),
      ).length,
    },
    unresolved,
  };
}

function buildDocumentDraft(
  kind: SyncBoundaryKind,
  document?: SdrIntNexusDEntity,
): SyncBoundaryDocumentDraft | null {
  if (!document?.documentNumber) {
    return null;
  }

  if (kind === 'mt') {
    return {
      destination: 'mt-document',
      nexusDocumentNumber: document.documentNumber,
      cutStartAt: normalizeTemporal(document.startCut),
      weatherCondition: document.weatherCondition,
      region: document.areaOp,
      operativeArea: document.areaOp,
      county: document.county,
      locality: document.locality,
      initialAffectedCustomers: document.affectedInitial,
      affectedCustomers: document.affectedNow,
      electricalHierarchy: document.electricalHierarchy,
      confirmedFailure: document.confirmFailure,
    };
  }

  return {
    destination: 'bt-document',
    nexusDocumentNumber: document.documentNumber,
    cutStartAt: normalizeTemporal(document.startCut),
    weatherCondition: document.weatherCondition,
    region: document.areaOp,
    operativeArea: document.areaOp,
    county: document.county,
    locality: document.locality,
    initialAffectedCustomers: document.affectedInitial,
    affectedCustomers: document.affectedNow,
  };
}

function buildGridEventDraft(
  kind: SyncBoundaryKind,
  candidate: CandidateContext,
): SyncBoundaryGridEventDraft {
  const { document, anomaly, notice, orders } = candidate;
  const firstOrder = orders[0];
  const documentNumber = document?.documentNumber ?? null;
  const sourceDescription = anomaly?.anomalyObservation ?? notice?.textNotice ?? firstOrder?.hrText ?? firstOrder?.txtOrder ?? null;
  const technicalLocation = notice?.tplnr ?? firstOrder?.tplnr ?? null;
  const priority = notice?.priority ?? firstOrder?.priority ?? null;
  const sapOrderNumber = firstOrder?.orderNumber ?? notice?.orderNumber ?? null;
  const detectionDate = normalizeTemporal(
    anomaly?.detectionDate ?? notice?.createdAt ?? firstOrder?.noticeDate ?? null,
  );
  const affectsSupply = normalizeSupplyImpact(document?.affectedNow, document?.affectsSupply);
  const base = {
    destination: kind === 'mt' ? 'mt-grid-event' : 'bt-grid-event',
    id: randomUUID(),
    nexusDocumentNumber: documentNumber,
    nexusAnomalyNumber: anomaly ? String(anomaly.anomalyNumber) : null,
    sapNotificationNumber: anomaly?.otNotice ? String(anomaly.otNotice) : notice?.noticeNumber ?? firstOrder?.noticeNumber ?? null,
    sapOrderNumber,
    eventType: inferEventType(document?.type, notice?.noticeClass),
    detectionDate,
    priority,
    technicalLocation,
    eventStatus: 'ACTIVE',
    affectsSupply,
    installation: anomaly?.installation ?? null,
    sourceDescription,
  } satisfies SyncBoundaryGridEventDraft;

  if (kind === 'mt') {
    return {
      ...base,
      feeder: document?.supply ?? null,
      substationCode: normalizeSubstationCode(document?.ssee),
    };
  }

  return base;
}

function buildWorkOrders(
  kind: SyncBoundaryKind,
  noticeNumber: string | null,
  orders: TcvOrderEntity[],
): SyncBoundaryWorkOrderDraft[] {
  const rootOrderNumber = pickRootOrderNumber(orders);

  return orders.map((order) => ({
    destination: kind === 'mt' ? 'mt-work-order' : 'bt-work-order',
    id: randomUUID(),
    sapNotificationNumber: noticeNumber ?? order.noticeNumber,
    sapOrderNumber: order.orderNumber,
    parentSapOrderNumber: order.parentOrder,
    rootSapOrderNumber: rootOrderNumber,
    stage: inferStage(order),
    normalizedStatus: inferNormalizedStatus(order),
    sapEstado: order.status,
    sapStatusCode: order.statusCode,
    sapLastUpdatedAt: normalizeTemporal(order.lastUpdatedDate),
    sapCursorAt: normalizeTemporal(order.noticeDate),
    description: order.hrText ?? order.txtOrder,
    technicalLocation: order.tplnr,
    sapIsVisible: normalizeVisible(order.visible),
    sapCreationDate: normalizeTemporal(order.createdAt),
  }));
}

function buildMappingNotes(
  candidate: CandidateContext & { kind: SyncBoundaryKind },
): string[] {
  const notes = [
    `Ruteo provisorio hacia ${candidate.kind.toUpperCase()}.`,
    'La identidad física del caso se apoya en Documento Nexus + Anomalía Nexus.',
    'AVISO_NRO / AVISO_OT se usa como puente de correlación con SAP.',
  ];

  if (candidate.document) {
    notes.push('SDR_INT_NEXUS_D aporta documento, clima, geografía y afectados.');
  }
  if (candidate.anomaly) {
    notes.push('SDR_INT_NEXUS_A aporta anomalía, instalación y fecha de detección.');
  }
  if (candidate.notice) {
    notes.push('TCV_AVISO complementa prioridad, OT y ubicación técnica.');
  }
  if (candidate.orders.length > 0) {
    notes.push('TCV_ORDEN arma la jerarquía de órdenes y el snapshot SAP de work orders.');
  }

  return notes;
}

function buildMissingSources(candidate: CandidateContext): string[] {
  const missing: string[] = [];

  if (!candidate.document) {
    missing.push('Sin documento Nexus: faltan clima, afectados y contexto geográfico completo.');
  }
  if (!candidate.anomaly) {
    missing.push('Sin anomalía Nexus: falta instalación y observación de anomalía.');
  }
  if (!candidate.notice) {
    missing.push('Sin aviso SAP: falta prioridad y texto de aviso.');
  }
  if (candidate.orders.length === 0) {
    missing.push('Sin órdenes SAP: no hay árbol de orden/suborden.');
  }

  return missing;
}

function resolveKind(candidate: Pick<CandidateContext, 'document' | 'notice' | 'orders'>): SyncBoundaryKind {
  const begru = candidate.notice?.begru ?? candidate.orders.find((order) => order.begru)?.begru ?? null;
  const normalizedBegru = begru?.trim().toUpperCase() ?? '';

  if (normalizedBegru.includes('MT') || normalizedBegru.startsWith('M')) {
    return 'mt';
  }
  if (normalizedBegru.includes('BT') || normalizedBegru.startsWith('B')) {
    return 'bt';
  }
  if (candidate.document?.electricalHierarchy || candidate.document?.confirmFailure) {
    return 'mt';
  }

  return 'bt';
}

function inferEventType(documentType?: string | null, noticeClass?: string | null): string {
  const type = (documentType ?? noticeClass ?? '').trim().toUpperCase();
  if (type.startsWith('PR') || type === 'P') {
    return 'PROGRAMADO';
  }
  return 'FORZADO';
}

function inferStage(order: TcvOrderEntity): string {
  const text = `${order.hrText ?? ''} ${order.txtOrder ?? ''}`.toUpperCase();

  if (text.includes('LOCAL')) {
    return 'LOCALIZACION';
  }
  if (text.includes('ZANJ') || text.includes('EXCAV')) {
    return 'ZANJEO';
  }
  if (text.includes('NORMAL')) {
    return 'NORMALIZACION';
  }
  if (text.includes('REPAR') || text.includes('EMPAL')) {
    return 'REPARACION';
  }
  if (text.includes('CORTE') || text.includes('PRUEBA')) {
    return 'CORTE_Y_PRUEBA';
  }

  return 'PENDIENTE_MAPEO';
}

function inferNormalizedStatus(order: TcvOrderEntity): string {
  const status = `${order.status ?? ''} ${order.statusCode ?? ''}`.toUpperCase();

  if (status.includes('CIERRE') || status.includes('FELE') || status.includes('FINAL')) {
    return 'CLOSED';
  }
  if (status.includes('BLOQ')) {
    return 'BLOCKED';
  }

  return 'OPEN';
}

function normalizeSupplyImpact(affectedNow?: number | null, affectsSupply?: string | null): number | null {
  if (affectedNow != null) {
    return affectedNow > 0 ? 1 : 0;
  }

  const normalized = affectsSupply?.trim().toUpperCase() ?? '';
  if (['S', 'SI', 'Y'].includes(normalized)) {
    return 1;
  }
  if (['N', 'NO'].includes(normalized)) {
    return 0;
  }

  return null;
}

function normalizeVisible(visible?: string | null): number | null {
  const normalized = visible?.trim().toUpperCase() ?? '';
  if (normalized === 'Y' || normalized === 'S') {
    return 1;
  }
  if (normalized === 'N') {
    return 0;
  }
  return null;
}

function normalizeSubstationCode(value?: string | null): string | null {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (digits.length >= 3) {
    return digits.slice(0, 3);
  }
  return null;
}

function normalizeTemporal(value: unknown): SyncBoundaryTemporalValue {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  return String(value);
}

function pickRootOrderNumber(orders: TcvOrderEntity[]): string | null {
  const root = orders.find((order) => isBlank(order.parentOrder)) ?? orders[0];
  return root?.orderNumber ?? null;
}

function buildPhysicalFailureKey(
  documentNumber: string | null | undefined,
  anomalyNumber: number | string | null | undefined,
): string {
  return `doc:${documentNumber ?? 'unknown'}:anomaly:${anomalyNumber ?? 'unknown'}`;
}

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === '';
}

function groupBy<TItem, TKey extends string>(
  items: ReadonlyArray<TItem>,
  getKey: (item: TItem) => TKey,
): Map<TKey, TItem[]> {
  const map = new Map<TKey, TItem[]>();

  for (const item of items) {
    const key = getKey(item);
    const bucket = map.get(key);
    if (bucket) {
      bucket.push(item);
      continue;
    }
    map.set(key, [item]);
  }

  return map;
}
