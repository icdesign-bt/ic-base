import type { IntentScenario } from '@/types/knowledge';

/**
 * Кластеры формулировок → фиксированный результат демо.
 * Источник правды для поиска и чата (фаза 3).
 */
export const INTENT_SCENARIOS: IntentScenario[] = [
  {
    id: 'innovacapital',
    label: 'Документация «Инновационная столица»',
    phrases: [
      'покажи файлы инновационной столицы',
      'нужна актуальная документация по Инновационной столице',
      'актуальная документация по инновационной столице',
      'актуальные документы по инновационной столице',
      'документы инновационная столица',
      'документы инновационной столицы',
      'инновационная столица февраль 2027',
      'программа инновационной столицы',
      'что есть по инновационной столице',
      'материалы мероприятия инновационная столица',
      'бриф инновационная столица',
      'стенды инновационная столица',
      'программа февраля 2027 инновационная столица',
    ],
    searchDocumentIds: [
      'doc-ic-brief',
      'doc-ic-program',
      'doc-ic-stands',
      'doc-ic-deck',
      'doc-ic-map',
      'doc-ic-ideas',
      'doc-txt-readme-ic',
      'doc-ic-overview',
      'doc-ic-2026-brief',
      'doc-ic-2026-program',
      'doc-ic-2026-deck',
      'doc-ic-2025-program',
      'doc-ic-2025-recap',
      'doc-ic-2025-stands',
    ],
    chat: {
      intentId: 'innovacapital',
      answer:
        'Собрал файлы по Инновационной столице за 2025–2027 годы. Актуальный пакет предстоящего мероприятия и архив прошлых лет — в выдаче.',
      citations: [
        { documentId: 'doc-ic-brief', label: 'Бриф мероприятия' },
        { documentId: 'doc-ic-program', label: 'Программа дня' },
        { documentId: 'doc-ic-ideas', label: 'Идеи и предложения 2027' },
      ],
    },
  },
  {
    id: 'start_initiative',
    label: 'Как завести инициативу',
    phrases: [
      'как завести инициативу',
      'как запустить инициативу',
      'как оформить идею в rnd',
      'как пройти пре-скрининг',
      'что такое еди и как заполнить',
      'с чего начать инициативу',
      'инструкция по процессу r&d',
      'как подать идею руководителю',
      'шаблон еди',
    ],
    searchDocumentIds: [
      'doc-rnd-instruction',
      'doc-rnd-edi-template',
      'doc-rnd-pitch-template',
    ],
    chat: {
      intentId: 'start_initiative',
      answer:
        'Чтобы завести инициативу, пройдите шаги RnD: зафиксируйте идею, подтвердите боль с ключевым пользователем, заполните ЕДИ (шаги 1–3) и соберите питч по шаблону. Затем идите на пре-скрининг к своему руководителю.',
      citations: [
        { documentId: 'doc-rnd-instruction', label: 'Инструкция по процессу R&D' },
        { documentId: 'doc-rnd-edi-template', label: 'ЕДИ — шаблон' },
        {
          documentId: 'doc-rnd-pitch-template',
          label: 'Презентация · шаблон этапов 1–2',
        },
      ],
    },
  },
  {
    id: 'acl_sensitive',
    label: 'Чувствительный документ аппарата (демо ACL)',
    phrases: [
      'служебная записка аппарат',
      'закрытый документ аппарата',
      'чувствительная служебная записка',
      'служебка закрытый контур',
    ],
    searchDocumentIds: ['doc-app-sensitive'],
  },
  {
    id: 'meeting_knowledge',
    label: 'Итоги последнего стендапа',
    phrases: [
      'итоги последнего стендапа',
      'итоги стендапа',
      'последний стендап',
      'саммари последнего стендапа',
      'что решили на последнем стендапе',
      'карточка знания стендап',
      'стендап дизайна 04.11',
      'саммари стендапа управления дизайна',
      'знание из встречи стендап',
      'карточка знания из встречи',
      'что решили на стендапе дизайна',
      'транскрипт стендап база знаний',
    ],
    searchDocumentIds: ['doc-meet-standup-card'],
    chat: {
      intentId: 'meeting_knowledge',
      answer:
        'Итоги последнего стендапа управления дизайна (04.11) сохранены как карточка знания: саммари, решения и action items. Файл в папке «Знания из встреч» — можно открыть превью или найти поиском.',
      citations: [
        { documentId: 'doc-meet-standup-card', label: 'Итоги стендапа · 04.11' },
      ],
    },
  },
];

/** Чипы демо для поиска и чата. */
export const DEMO_QUERY_CHIPS: { label: string; query: string }[] = [
  {
    label: 'Инновационная столица',
    query: 'Покажи файлы инновационной столицы',
  },
  {
    label: 'Как завести инициативу',
    query: 'как завести инициативу',
  },
  {
    label: 'ACL · служебная записка',
    query: 'служебная записка аппарат',
  },
  {
    label: 'Итоги стендапа',
    query: 'Итоги последнего стендапа',
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s&]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Лёгкий fuzzy: доля токенов запроса, встретившихся в фразе или наоборот. */
function fuzzyScore(query: string, phrase: string): number {
  const q = normalize(query);
  const p = normalize(phrase);
  if (!q || !p) return 0;
  if (p.includes(q) || q.includes(p)) return 1;
  const qTokens = q.split(' ').filter((t) => t.length > 2);
  const pTokens = new Set(p.split(' ').filter((t) => t.length > 2));
  if (qTokens.length === 0) return 0;
  const hit = qTokens.filter((t) => [...pTokens].some((pt) => pt.includes(t) || t.includes(pt)));
  return hit.length / qTokens.length;
}

export function matchIntent(query: string): IntentScenario | null {
  let best: { scenario: IntentScenario; score: number } | null = null;
  for (const scenario of INTENT_SCENARIOS) {
    for (const phrase of scenario.phrases) {
      const score = fuzzyScore(query, phrase);
      if (score >= 0.55 && (!best || score > best.score)) {
        best = { scenario, score };
      }
    }
  }
  return best?.scenario ?? null;
}
