import type { IntentId } from '@/types/knowledge';

/**
 * Демо-сценарии умного поиска → ИИ-чат с артефактами.
 * Обычный keyword-поиск по имени файлов — позже внутри разделов.
 */

export type AssistantScenarioId = IntentId;

export type AssistantTurn = {
  id: string;
  documentIds: string[];
  answer: string;
  /** Текст, если после ACL-фильтра выдача пустая. */
  emptyAnswer?: string;
  followUpHints?: string[];
  /** Фразы, по которым попадаем в этот шаг из текущего. */
  matchPhrases?: string[];
};

export type AssistantFlow = {
  id: AssistantScenarioId;
  label: string;
  entryPhrases: string[];
  initialTurnId: string;
  turns: Record<string, AssistantTurn>;
  fallbackHint: string;
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9\s&]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesAny(query: string, phrases: string[]): boolean {
  const q = normalize(query);
  if (!q) return false;
  return phrases.some((phrase) => {
    const p = normalize(phrase);
    if (p.includes(q) || q.includes(p)) return true;
    const qTokens = q.split(' ').filter((t) => t.length > 2);
    const pTokens = p.split(' ').filter((t) => t.length > 2);
    if (qTokens.length === 0) return false;
    const hit = qTokens.filter((t) => pTokens.some((pt) => pt.includes(t) || t.includes(pt)));
    return hit.length / qTokens.length >= 0.6;
  });
}

/** —— 1. Инновационная столица —— */
const IC_ALL = [
  'doc-ic-brief',
  'doc-ic-program',
  'doc-ic-stands',
  'doc-ic-deck',
  'doc-ic-map',
  'doc-ic-ideas',
  'doc-ic-overview',
  'doc-txt-readme-ic',
  'doc-user-ic-checklist',
  'doc-user-brief-edit',
  'doc-ic-2026-brief',
  'doc-ic-2026-program',
  'doc-ic-2026-deck',
  'doc-ic-2025-program',
  'doc-ic-2025-recap',
  'doc-ic-2025-stands',
];

const IC_2027 = [
  'doc-ic-brief',
  'doc-ic-program',
  'doc-ic-stands',
  'doc-ic-deck',
  'doc-ic-map',
  'doc-ic-ideas',
];

/** —— 2. Как завести инициативу —— */
const RND_PACK = [
  'doc-rnd-instruction',
  'doc-rnd-edi-template',
  'doc-rnd-pitch-template',
  'doc-rnd-backlog',
  'doc-rnd-charter',
  'doc-po-framework',
];

/** —— 3. ACL / аппарат —— */
const APP_PACK = ['doc-app-sensitive', 'doc-app-index', 'doc-hr-onboarding'];

/** —— 4. Итоги стендапа / знание из встречи —— */
const MEET_PACK = [
  'doc-meet-standup-card',
  'doc-meetings-howto',
  'doc-po-kb-card',
  'doc-ic-brief',
  'doc-user-ic-checklist',
];

export const ASSISTANT_FLOWS: Record<AssistantScenarioId, AssistantFlow> = {
  innovacapital: {
    id: 'innovacapital',
    label: 'Инновационная столица',
    entryPhrases: [
      'покажи файлы инновационной столицы',
      'покажи файлы по инновационной столице',
      'файлы инновационной столицы',
      'все файлы инновационной столицы',
      'документы инновационной столицы',
      'документы инновационная столица',
      'нужна актуальная документация по инновационной столице',
      'актуальная документация по инновационной столице',
      'актуальные документы по инновационной столице',
      'что есть по инновационной столице',
      'материалы мероприятия инновационная столица',
      'инновационная столица февраль 2027',
      'бриф инновационная столица',
      'стенды инновационная столица',
      'программа инновационной столицы',
    ],
    initialTurnId: 'all_years',
    fallbackHint:
      'Могу сузить выдачу: «Только файлы предстоящего мероприятия» или «А где экселька с идеями?».',
    turns: {
      all_years: {
        id: 'all_years',
        documentIds: IC_ALL,
        answer:
          'Собрал файлы по Инновационной столице за 2025–2027 годы: актуальный пакет предстоящего мероприятия и архив прошлых лет. В выдаче — материалы; можно открыть превью любого файла.',
        followUpHints: ['Только файлы предстоящего мероприятия', 'А где экселька с идеями?'],
      },
      upcoming_2027: {
        id: 'upcoming_2027',
        documentIds: IC_2027,
        answer:
          'Оставил только материалы предстоящего мероприятия «Инновационная столица 2027»: бриф, программа, стенды, презентация, схема и экселька с идеями. Архив 2025–2026 убрал из выдачи.',
        followUpHints: ['А где экселька с идеями?'],
        matchPhrases: [
          'только файлы предстоящего мероприятия',
          'только предстоящее мероприятие',
          'только 2027',
          'предстоящее мероприятие',
          'убери архив',
          'только актуальное',
        ],
      },
      ideas_excel: {
        id: 'ideas_excel',
        documentIds: ['doc-ic-ideas'],
        answer:
          'Нашёл эксельку с идеями — «Идеи и предложения по Инновационной столице 2027». Выдачу сузил до этого файла.',
        matchPhrases: [
          'а где экселька с идеями',
          'где экселька с идеями',
          'экселька с идеями',
          'excel с идеями',
          'идеи и предложения',
          'файл с идеями',
          'таблица с идеями',
        ],
      },
    },
  },

  start_initiative: {
    id: 'start_initiative',
    label: 'Как завести инициативу',
    entryPhrases: [
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
    initialTurnId: 'rnd_pack',
    fallbackHint:
      'Могу сузить: «Только шаблоны для заполнения», «Как подготовиться к пре-скринингу?» или «Покажи бэклог инициатив».',
    turns: {
      rnd_pack: {
        id: 'rnd_pack',
        documentIds: RND_PACK,
        answer:
          'Собрал пакет по запуску инициативы: инструкция RnD, шаблоны ЕДИ и питча, устав контура, фреймворк и бэклог. Материалы — в выдаче; уточните, что нужно дальше.',
        followUpHints: [
          'Только шаблоны для заполнения',
          'Как подготовиться к пре-скринингу?',
          'Покажи бэклог инициатив',
        ],
      },
      templates: {
        id: 'templates',
        documentIds: ['doc-rnd-edi-template', 'doc-rnd-pitch-template'],
        answer:
          'Оставил шаблоны для старта: ЕДИ и презентацию этапов 1–2. Их обычно заполняют до пре-скрининга у руководителя.',
        followUpHints: ['Как подготовиться к пре-скринингу?', 'Покажи бэклог инициатив'],
        matchPhrases: [
          'только шаблоны для заполнения',
          'только шаблоны',
          'шаблоны еди и питча',
          'дай шаблоны',
          'шаблон еди',
          'шаблон презентации',
        ],
      },
      prescreen: {
        id: 'prescreen',
        documentIds: ['doc-rnd-instruction', 'doc-rnd-pitch-template'],
        answer:
          'Для пре-скрининга важны инструкция (шаги 1–4) и питч по шаблону. В выдаче — эти два файла; по ним готовят заход к руководителю.',
        followUpHints: ['Только шаблоны для заполнения', 'Покажи бэклог инициатив'],
        matchPhrases: [
          'как подготовиться к пре скринингу',
          'как пройти пре скрининг',
          'подготовка к пре скринингу',
          'пре скрининг',
          'что нужно к прескринингу',
        ],
      },
      backlog: {
        id: 'backlog',
        documentIds: ['doc-rnd-backlog'],
        answer:
          'Нашёл бэклог инициатив RnD — сводная таблица идей, носителей и статусов. Выдачу сузил до этого файла.',
        matchPhrases: [
          'покажи бэклог инициатив',
          'бэклог инициатив',
          'бэклог rnd',
          'таблица инициатив',
          'где бэклог',
        ],
      },
    },
  },

  acl_sensitive: {
    id: 'acl_sensitive',
    label: 'Служебная записка аппарата',
    entryPhrases: [
      'служебная записка аппарат',
      'закрытый документ аппарата',
      'чувствительная служебная записка',
      'служебка закрытый контур',
      'документы аппарата руководителя',
      'материалы аппарата',
      'покажи служебные записки',
    ],
    initialTurnId: 'apparatus_pack',
    fallbackHint:
      'Могу сузить: «Только закрытый контур» или «Покажи оглавление аппарата». Если файлов нет — смените роль на «Аппарат руководителя».',
    turns: {
      apparatus_pack: {
        id: 'apparatus_pack',
        documentIds: APP_PACK,
        answer:
          'Ищу материалы аппарата руководителя. В выдаче — то, что доступно вашей роли: служебные и связанные закрытые документы.',
        emptyAnswer:
          'По запросу есть служебные материалы аппарата, но ACL скрывает их для вашей роли. Переключите роль на «Аппарат руководителя» в настройках шапки — и уточните запрос ещё раз.',
        followUpHints: ['Только закрытый контур', 'Покажи оглавление аппарата'],
      },
      closed_only: {
        id: 'closed_only',
        documentIds: ['doc-app-sensitive'],
        answer:
          'Оставил только чувствительную служебную записку закрытого контура. Превью — в выдаче; документ не для широкой рассылки.',
        emptyAnswer:
          'Чувствительная служебная записка есть в Базе знаний, но для вашей роли скрыта ACL. Смените роль на «Аппарат руководителя».',
        followUpHints: ['Покажи оглавление аппарата'],
        matchPhrases: [
          'только закрытый контур',
          'закрытый контур',
          'чувствительная служебка',
          'чувствительная записка',
          'открой служебную записку',
        ],
      },
      apparatus_index: {
        id: 'apparatus_index',
        documentIds: ['doc-app-index'],
        answer:
          'Нашёл оглавление / индекс папки аппарата. Выдачу сузил до этого файла — по нему ориентируются во внутреннем контуре.',
        emptyAnswer:
          'Оглавление аппарата скрыто ACL для вашей роли. Нужна роль «Аппарат руководителя».',
        matchPhrases: [
          'покажи оглавление аппарата',
          'оглавление аппарата',
          'индекс аппарата',
          'реестр аппарата',
          'что лежит в аппарате',
        ],
      },
    },
  },

  meeting_knowledge: {
    id: 'meeting_knowledge',
    label: 'Итоги стендапа',
    entryPhrases: [
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
      'что решили на встрече',
      'знания из встреч',
    ],
    initialTurnId: 'meet_pack',
    fallbackHint:
      'Могу сузить: «Только итоги стендапа», «Как сохранять знания из встреч?» или «Связанные файлы по БЗ».',
    turns: {
      meet_pack: {
        id: 'meet_pack',
        documentIds: MEET_PACK,
        answer:
          'Нашёл итоги последнего стендапа управления дизайна (04.11): карточку знания с саммари и action items, инструкцию как сохранять такие знания и связанные материалы по БЗ / ИС, которые обсуждали.',
        followUpHints: [
          'Только итоги стендапа',
          'Как сохранять знания из встреч?',
          'Связанные файлы по БЗ',
        ],
      },
      standup_card: {
        id: 'standup_card',
        documentIds: ['doc-meet-standup-card'],
        answer:
          'Оставил только итоги последнего стендапа — карточку знания от 04.11: саммари, решения по БЗ 2.0 и action items. В выдаче — один файл.',
        followUpHints: ['Как сохранять знания из встреч?', 'Связанные файлы по БЗ'],
        matchPhrases: [
          'только итоги стендапа',
          'итоги стендапа',
          'только карточку стендапа 04.11',
          'карточка стендапа',
          'стендап 04.11',
          'саммари стендапа',
          'открой карточку знания',
          'открой итоги',
        ],
      },
      howto: {
        id: 'howto',
        documentIds: ['doc-meetings-howto'],
        answer:
          'Вот инструкция, как сохранять итоги встреч в Базу знаний: путь от транскрипта к карточке знания. Выдачу сузил до этого файла.',
        followUpHints: ['Только итоги стендапа', 'Связанные файлы по БЗ'],
        matchPhrases: [
          'как сохранять знания из встреч',
          'как сохранить знание из встречи',
          'инструкция по знаниям из встреч',
          'как оформить карточку знания',
        ],
      },
      related_kb: {
        id: 'related_kb',
        documentIds: ['doc-po-kb-card', 'doc-ic-brief', 'doc-user-ic-checklist'],
        answer:
          'Связанные с последним стендапом файлы: продуктовая карточка Базы знаний, бриф ИС и чек-лист стенда. Это контекст к решениям со встречи.',
        followUpHints: ['Только итоги стендапа'],
        matchPhrases: [
          'связанные файлы по бз',
          'связанные файлы',
          'материалы по базе знаний',
          'что обсуждали по бз',
          'файлы из встречи',
        ],
      },
    },
  },
};

/** Первая выдача (со скелетоном) — 3–5 с. */
export const ASSISTANT_THINK_MS = 4000;
/** Уточняющие шаги — короче. */
export const ASSISTANT_FOLLOWUP_MS = 1600;

export function matchAssistantEntry(query: string): AssistantScenarioId | null {
  let best: { id: AssistantScenarioId; score: number } | null = null;
  for (const flow of Object.values(ASSISTANT_FLOWS)) {
    for (const phrase of flow.entryPhrases) {
      const q = normalize(query);
      const p = normalize(phrase);
      if (!q || !p) continue;
      let score = 0;
      if (p.includes(q) || q.includes(p)) score = 1;
      else {
        const qTokens = q.split(' ').filter((t) => t.length > 2);
        const pTokens = p.split(' ').filter((t) => t.length > 2);
        if (qTokens.length === 0) continue;
        const hit = qTokens.filter((t) => pTokens.some((pt) => pt.includes(t) || t.includes(pt)));
        score = hit.length / qTokens.length;
      }
      if (score >= 0.55 && (!best || score > best.score)) {
        best = { id: flow.id, score };
      }
    }
  }
  return best?.id ?? null;
}

export function matchAssistantFollowUp(
  query: string,
  scenarioId: AssistantScenarioId,
  currentTurnId: string,
): string | null {
  const flow = ASSISTANT_FLOWS[scenarioId];
  const candidates = Object.values(flow.turns).filter(
    (t) => t.id !== currentTurnId && t.matchPhrases && t.matchPhrases.length > 0,
  );

  let best: { id: string; score: number } | null = null;
  for (const turn of candidates) {
    for (const phrase of turn.matchPhrases ?? []) {
      const q = normalize(query);
      const p = normalize(phrase);
      if (!q || !p) continue;
      let score = 0;
      if (p.includes(q) || q.includes(p)) score = 1;
      else {
        const qTokens = q.split(' ').filter((t) => t.length > 2);
        const pTokens = p.split(' ').filter((t) => t.length > 2);
        if (qTokens.length === 0) continue;
        const hit = qTokens.filter((t) => pTokens.some((pt) => pt.includes(t) || t.includes(pt)));
        score = hit.length / qTokens.length;
      }
      if (score >= 0.55 && (!best || score > best.score)) {
        best = { id: turn.id, score };
      }
    }
  }
  return best?.id ?? null;
}

export function getAssistantTurn(
  scenarioId: AssistantScenarioId,
  turnId: string,
): AssistantTurn {
  const flow = ASSISTANT_FLOWS[scenarioId];
  return flow.turns[turnId] ?? flow.turns[flow.initialTurnId]!;
}
