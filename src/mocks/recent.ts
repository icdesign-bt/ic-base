import type { RecentDocumentRef, RecentQuery } from '@/types/knowledge';
import { DEMO_QUERY_CHIPS } from '@/scenarios/intents';

function ago(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

const minute = 60_000;
const hour = 60 * minute;
const day = 24 * hour;

/** Открытия относительно «сейчас», чтобы демо всегда показывало живые относительные даты. */
export const RECENT_DOCUMENTS: RecentDocumentRef[] = [
  { documentId: 'doc-ic-brief', openedAt: ago(2 * minute) },
  { documentId: 'doc-ic-program', openedAt: ago(18 * minute) },
  { documentId: 'doc-po-roadmap', openedAt: ago(55 * minute) },
  { documentId: 'doc-rnd-backlog', openedAt: ago(3 * hour) },
  { documentId: 'doc-ic-stands', openedAt: ago(5 * hour) },
  { documentId: 'doc-rnd-instruction', openedAt: ago(1 * day) },
  { documentId: 'doc-rnd-edi-template', openedAt: ago(2 * day) },
  { documentId: 'doc-meet-standup-card', openedAt: ago(3 * day) },
  { documentId: 'doc-po-kb-card', openedAt: ago(5 * day) },
  { documentId: 'doc-ic-deck', openedAt: ago(12 * day) },
  { documentId: 'doc-app-sensitive', openedAt: ago(20 * day) },
];

/** Последние запросы = сценарии демо (те же query). */
export const RECENT_QUERIES: RecentQuery[] = DEMO_QUERY_CHIPS.map((chip, index) => ({
  id: `rq-${index + 1}`,
  text: chip.query,
  at: ago((index + 1) * hour),
}));
