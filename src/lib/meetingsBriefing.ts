import { isWeekend, toDayKey } from '@/lib/demoTime';
import { getDocument, listDocumentsForRole } from '@/lib/corpus';
import type { Document, Meeting, RoleId } from '@/types/knowledge';

const STOP_WORDS = new Set([
  'и',
  'в',
  'на',
  'по',
  'с',
  'к',
  'о',
  'об',
  'для',
  'из',
  'у',
  'а',
  'the',
  'of',
  'to',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[«»""]/g, ' ')
    .split(/[^a-zа-яё0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

export function meetingsOnDay(meetings: Meeting[], dayKey: string): Meeting[] {
  if (isWeekend(dayKey)) return [];
  return meetings
    .filter((m) => toDayKey(m.startsAt) === dayKey)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function daysWithMeetings(meetings: Meeting[]): Set<string> {
  return new Set(
    meetings.map((m) => toDayKey(m.startsAt)).filter((day) => !isWeekend(day)),
  );
}

export type DayDocEntry = Document & {
  meetingIds: string[];
  reason: string;
};

/** Документы к встречам выбранного дня (вложения + knowledge cards), ACL уже на роли. */
export function docsForDay(
  dayMeetings: Meeting[],
  role: RoleId,
  focusMeetingId?: string | null,
): DayDocEntry[] {
  const visible = new Map(listDocumentsForRole(role).map((d) => [d.id, d]));
  const byId = new Map<string, DayDocEntry>();

  const ordered = focusMeetingId
    ? [
        ...dayMeetings.filter((m) => m.id === focusMeetingId),
        ...dayMeetings.filter((m) => m.id !== focusMeetingId),
      ]
    : dayMeetings;

  for (const meeting of ordered) {
    const ids = [
      ...(meeting.attachmentIds ?? []),
      ...(meeting.knowledgeDocId ? [meeting.knowledgeDocId] : []),
    ];
    for (const id of ids) {
      const doc = visible.get(id) ?? getDocument(id);
      if (!doc || !visible.has(doc.id)) continue;
      const existing = byId.get(doc.id);
      if (existing) {
        if (!existing.meetingIds.includes(meeting.id)) existing.meetingIds.push(meeting.id);
        continue;
      }
      byId.set(doc.id, {
        ...doc,
        meetingIds: [meeting.id],
        reason: `К встрече «${meeting.title}»`,
      });
    }

    for (const doc of visible.values()) {
      if (doc.sourceMeetingId === meeting.id && !byId.has(doc.id)) {
        byId.set(doc.id, {
          ...doc,
          meetingIds: [meeting.id],
          reason: 'Карточка знания по встрече',
        });
      }
    }
  }

  return [...byId.values()];
}

export type PriorContextEntry = {
  meeting: Meeting;
  score: number;
  overlapLabel: string;
  excerpt: string;
};

function overlapScore(day: Meeting, past: Meeting): { score: number; label: string } {
  const sharedPeople = day.participants.filter((id) => past.participants.includes(id));
  const dayTokens = new Set([
    ...tokenize(day.title),
    ...tokenize(day.summary),
    ...day.decisions.flatMap(tokenize),
  ]);
  const pastTokens = tokenize(`${past.title} ${past.summary}`);
  const sharedTokens = pastTokens.filter((t) => dayTokens.has(t));

  let score = sharedPeople.length * 3 + sharedTokens.length * 2;
  if (sharedTokens.some((t) => /баз|знан|бз|пре.?скрининг|стендап|дизайн/i.test(t))) {
    score += 2;
  }

  const parts: string[] = [];
  if (sharedPeople.length) {
    parts.push(
      sharedPeople.length === 1
        ? 'общий участник'
        : `${sharedPeople.length} общих участника`,
    );
  }
  if (sharedTokens.length) {
    parts.push(`темы: ${sharedTokens.slice(0, 3).join(', ')}`);
  }

  return {
    score,
    label: parts.join(' · ') || 'похожая встреча',
  };
}

/** Прошлые встречи, подобранные по названию / участникам / смыслу. */
export function priorContextForDay(
  allMeetings: Meeting[],
  dayMeetings: Meeting[],
  dayKey: string,
  focusMeetingId?: string | null,
): PriorContextEntry[] {
  if (dayMeetings.length === 0) return [];

  const focus = focusMeetingId
    ? dayMeetings.find((m) => m.id === focusMeetingId) ?? dayMeetings[0]!
    : dayMeetings[0]!;

  const past = allMeetings.filter((m) => toDayKey(m.startsAt) < dayKey);
  const ranked: PriorContextEntry[] = [];

  for (const m of past) {
    let best = { score: 0, label: '' };
    for (const day of focusMeetingId ? [focus] : dayMeetings) {
      const next = overlapScore(day, m);
      if (next.score > best.score) best = next;
    }
    if (best.score < 4) continue;
    ranked.push({
      meeting: m,
      score: best.score,
      overlapLabel: best.label,
      excerpt: m.summary.slice(0, 160) + (m.summary.length > 160 ? '…' : ''),
    });
  }

  return ranked.sort((a, b) => b.score - a.score || b.meeting.startsAt.localeCompare(a.meeting.startsAt)).slice(0, 4);
}
