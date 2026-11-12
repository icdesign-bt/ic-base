import { CURRENT_USER } from '@/lib/currentUser';
import type { Meeting } from '@/types/knowledge';

/** Полный транскрипт ~20 мин для демо-страницы встречи. */
const STANDUP_TRANSCRIPT_20MIN = [
  '[00:00] Тимофей: Всем привет. Короткий стендап управления дизайна — статус Базы знаний 2.0 и пре-скрининг.',
  '[00:45] Костя: Привет. Собираем кликабельный образ на моках: поиск по смыслу, чат, встречи с контекстом дня, ACL.',
  '[01:20] Глеб: По адаптивну держим три ширины — desktop, tablet, phone. HIG и Material из коробки ic-kit.',
  '[02:05] Тимофей: Ок. Что именно покажем на пре-скрининге?',
  '[02:40] Костя: Localhost: главная с поиском и чатом, раздел встреч как day-briefing, карточка встречи с саммари и транскриптом, закрытые документы для HR.',
  '[03:30] Глеб: Ещё пустые состояния на днях без встреч и корректный скролл таймлайна дней.',
  '[04:10] Тимофей: Транскрибатор — он уже в образе?',
  '[04:35] Костя: Как to-be: показываем путь «встреча → знание» и аргумент развивать. Живой пайплайн записи не тянем в этот шаг.',
  '[05:20] Глеб: Согласен. Иначе размоем фокус демо на инфраструктуре.',
  '[06:00] Тимофей: Понял. Материалы по Инновационной столице?',
  '[06:25] Костя: Моки-заглушки уже есть. Дальше попрошу у Кати Фатеевой актуальные файлы и подменю в корпус.',
  '[07:15] Глеб: В превью документов оставим плитку и список — ViewModeToggle уже в модалке встречи.',
  '[08:00] Тимофей: А позиционирование относительно Умного поиска и AI-хаба?',
  '[08:30] Костя: БЗ 2.0 — точка входа сотрудника. Сценарии хаба встраиваем в оболочку знаний, овнеры БД остаются на платформе. Это уже согласовано на синке ПО.',
  '[09:40] Глеб: В UI не дублируем отдельный «хаб» — чат и поиск живут внутри БЗ.',
  '[10:20] Тимофей: Хорошо. Action items на эту неделю?',
  '[10:45] Костя: Фазы 0–5 прототипа в ic-base: day-briefing встреч, страница встречи, ACL-демо, скрипт показа 7–8 минут.',
  '[11:30] Глеб: Я дожимаю адаптив карточек дня и аватарки участников без обрезания.',
  '[12:10] Тимофей: Пре-скрининг — когда ориентир?',
  '[12:35] Костя: После того как соберём образ и прогоним сценарий. Цель — показать localhost Тимофею на шаге 4.',
  '[13:20] Глеб: Нужен чеклист: поиск → чат → встречи сегодня → прошлый контекст → карточка встречи → ACL.',
  '[14:00] Костя: Да, зафиксирую в демо-скрипте. Ещё обновлю ЕДИ после показа.',
  '[14:45] Тимофей: Риски?',
  '[15:10] Костя: Контент Инновационной столицы может устареть до материалов Фатеевой — явно помечаем как мок.',
  '[15:50] Глеб: И не обещать live-транскрибацию на пре-скрининге.',
  '[16:25] Тимофей: Ок. Решение: идём в пре-скрининг с кликабельным образом; транскрибатор — to-be.',
  '[17:05] Костя: Принято. Я заведу задачи на фазы прототипа и запрос файлов.',
  '[17:40] Глеб: Я — empty states и проверка на phone.',
  '[18:20] Тимофей: Ещё: кто ведёт запись этой встречи в БЗ?',
  '[18:45] Костя: Карточку саммари сохраним после стендапа — она уже есть в моках как doc-meet-standup-card.',
  '[19:20] Глеб: К ней же привяжем вложения для day-briefing.',
  '[19:50] Тимофей: Отлично. Тогда расходимся. Спасибо.',
  '[20:10] Костя: Спасибо, хорошего дня.',
].join('\n');

export const MEETINGS: Meeting[] = [
  {
    id: 'mtg-standup-1104',
    title: 'Стендап управления дизайна',
    startsAt: '2026-11-04T10:00:00+03:00',
    endsAt: '2026-11-04T10:25:00+03:00',
    organizerId: 'pers-timofey',
    agenda: [
      'Статус образа Базы знаний 2.0',
      'Сценарий пре-скрининга и артефакты',
      'Транскрибатор: to-be vs сейчас',
      'Материалы Инновационной столицы',
      'Action items на неделю',
    ],
    participants: ['pers-kostya', 'pers-timofey', 'pers-gleb'],
    summary:
      'Договорились собирать образ Базы знаний 2.0 на моках к пре-скринингу. ИИ-слой встраиваем как наработки хаба, не забирая продукты. Моки Инновационной столицы — заглушки, затем материалы Фатеевой.',
    decisions: [
      'Идём в пре-скрининг к Тимофею с кликабельным образом',
      'Транскрибатор показываем как to-be / аргумент развивать',
    ],
    actionItems: [
      'Курылев: фазы 0–5 прототипа в ic-base',
      'Запросить у Кати Фатеевой актуальные файлы по Инновационной столице',
    ],
    transcript: STANDUP_TRANSCRIPT_20MIN,
    acl: [],
    mentions: [
      {
        id: 'men-1',
        meetingId: 'mtg-standup-1104',
        taskContext: 'Сборка образа БЗ 2.0 к пре-скринингу',
        excerpt:
          'Костя: Собираем образ на моках: поиск, чат, встречи, ACL. … Катю Фатееву попрошу материалы по Инновационной столице.',
      },
      {
        id: 'men-2',
        meetingId: 'mtg-standup-1104',
        taskContext: 'Адаптив UI (HIG / Material)',
        excerpt: 'Глеб: Не забыть адаптив. Костя: Да, HIG и Material из коробки.',
      },
    ],
    knowledgeDocId: 'doc-meet-standup-card',
    attachmentIds: ['doc-meet-standup-card', 'doc-po-kb-card', 'doc-rnd-instruction'],
    recordingUrl: 'https://example.local/recordings/mtg-standup-1104',
    comments: [
      {
        id: 'cmt-1',
        authorId: 'pers-gleb',
        createdAt: '2026-11-04T11:10:00+03:00',
        text: 'Чеклист демо на phone прогнал — empty states ок. Аватарки на узкой ширине ещё подкручу.',
      },
      {
        id: 'cmt-2',
        authorId: 'pers-kostya',
        createdAt: '2026-11-04T12:05:00+03:00',
        text: 'Карточку саммари сохранил в БЗ. Скрипт показа допилю к пятнице.',
      },
      {
        id: 'cmt-3',
        authorId: 'pers-timofey',
        createdAt: '2026-11-05T09:20:00+03:00',
        text: 'На пре-скрининге держим фокус на localhost, без обещаний live-транскрибации.',
      },
    ],
    color: 'purple',
  },
  {
    id: 'mtg-po-sync-1030',
    title: 'Синк продуктового офиса',
    startsAt: '2026-10-30T15:00:00+03:00',
    endsAt: '2026-10-30T15:40:00+03:00',
    organizerId: 'pers-maria',
    agenda: [
      'Связка БЗ с Умным поиском',
      'Сценарии AI-хаба в оболочке знаний',
      'Формулировки из карточек S-044 / S-052',
    ],
    participants: ['pers-kostya', 'pers-maria', 'pers-yulia', 'pers-anna'],
    summary:
      'Обсудили связку БЗ с Умным поиском и AI-хабом: встраиваем сценарии в оболочку знаний, овнеры БД остаются на платформе.',
    decisions: ['Позиционирование: точка входа для сотрудника = БЗ 2.0'],
    actionItems: ['Подтянуть формулировки из продуктовых карточек S-044/S-052'],
    transcript: [
      '[00:00] Мария: Синк по позиционированию БЗ относительно хаба.',
      '[02:10] Костя: Хотим умный поиск и чат внутри БЗ.',
      '[05:40] Мария: Ок как сценарии хаба, платформа остаётся.',
      '[12:00] Юлия: Зафиксируем формулировки в карточках.',
      '[18:20] Анна: Подтяну S-044 и S-052 к следующей итерации.',
    ].join('\n'),
    acl: [],
    mentions: [
      {
        id: 'men-3',
        meetingId: 'mtg-po-sync-1030',
        taskContext: 'Интеграция сценариев хаба в БЗ',
        excerpt:
          'Костя: Хотим умный поиск и чат внутри БЗ. Мария: Ок как сценарии хаба, платформа остаётся.',
      },
    ],
    attachmentIds: ['doc-po-roadmap', 'doc-po-framework'],
    comments: [
      {
        id: 'cmt-po-1',
        authorId: 'pers-anna',
        createdAt: '2026-10-30T16:15:00+03:00',
        text: 'Карточки S-044/S-052 обновлю до пятницы.',
      },
    ],
    color: 'blue',
  },
  {
    id: 'mtg-hr-week',
    title: 'HR · планерка недели',
    startsAt: '2026-11-05T11:00:00+03:00',
    endsAt: '2026-11-05T11:30:00+03:00',
    organizerId: 'pers-hr',
    agenda: ['Онбординг новых сотрудников', 'ACL кадровых папок'],
    participants: ['pers-hr', 'pers-kostya', 'pers-elena'],
    summary: 'Онбординг двух новых сотрудников, доступы к кадровым папкам.',
    decisions: ['Регламент онбординга остаётся в закрытой папке HR'],
    actionItems: ['Проверить ACL на регламенте онбординга'],
    transcript: [
      '[00:00] HR: Планерка — онбординг и доступы.',
      '[05:00] Елена: Два новых сотрудника, нужны папки.',
      '[12:00] Костя: Регламент остаётся в закрытой папке HR.',
      '[22:00] HR: Проверим ACL на этой неделе.',
    ].join('\n'),
    acl: ['hr', 'apparatus'],
    mentions: [],
    attachmentIds: ['doc-hr-onboarding'],
    comments: [],
    color: 'pink',
  },
  {
    id: 'mtg-kb-os',
    title: 'ОС по системе «База знаний»',
    startsAt: '2026-11-06T14:30:00+03:00',
    endsAt: '2026-11-06T15:00:00+03:00',
    organizerId: 'pers-yulia',
    agenda: [
      'Статус образа БЗ 2.0',
      'Доступы и ACL',
      'Подготовка к пре-скринингу',
    ],
    participants: [
      'pers-yulia',
      'pers-kostya',
      'pers-anna',
      'pers-elena',
      'pers-gleb',
    ],
    summary:
      'Операционка по БЗ: статус образа 2.0, доступы, подготовка к пре-скринингу. Материалы во вложениях.',
    decisions: ['Показ localhost Тимофею на пре-скрининге'],
    actionItems: ['Дожать демо-сценарии поиска и ACL'],
    transcript: [
      '[00:00] Юлия: Статус БЗ?',
      '[01:30] Костя: Образ на моках готов к показу.',
      '[08:00] Глеб: Адаптив на трёх ширинах.',
      '[15:00] Анна: Материалы во вложениях к встрече.',
      '[24:00] Елена: Дожимаем сценарии поиска и ACL.',
    ].join('\n'),
    acl: [],
    mentions: [],
    attachmentIds: ['doc-ic-brief', 'doc-ic-program', 'doc-po-kb-card'],
    recordingUrl: 'https://example.local/recordings/mtg-kb-os',
    comments: [
      {
        id: 'cmt-os-1',
        authorId: 'pers-yulia',
        createdAt: '2026-11-06T15:40:00+03:00',
        text: 'После пре-скрининга обновим ЕДИ — напомню в треде.',
      },
      {
        id: 'cmt-os-2',
        authorId: 'pers-elena',
        createdAt: '2026-11-06T16:05:00+03:00',
        text: 'Сценарий ACL проверила на роли hr — закрытая папка ок.',
      },
    ],
    color: 'purple',
  },
  {
    id: 'mtg-prescreen-1108',
    title: 'Пре-скрининг · База знаний 2.0',
    startsAt: '2026-11-09T11:00:00+03:00',
    endsAt: '2026-11-09T11:40:00+03:00',
    organizerId: 'pers-kostya',
    agenda: [
      'Показ образа: поиск и чат',
      'Встречи → знание',
      'ACL-демо',
      'Вопросы и next steps',
    ],
    joinUrl: 'https://telemost.yandex.ru/j/82108848514915',
    participants: ['pers-kostya', 'pers-timofey', 'pers-yulia', 'pers-gleb'],
    summary:
      'Показ кликабельного образа БЗ 2.0: поиск по смыслу, чат, встречи → знание, ACL. Решения по позиционированию и next steps после пре-скрининга.',
    decisions: [
      'Демо на localhost как основной артефакт шага 4',
      'Транскрибатор в образе — to-be / аргумент развивать',
    ],
    actionItems: [
      'Курылев: дожать демо-скрипт 7–8 мин',
      'Зафиксировать вопросы Тимофея в ЕДИ',
    ],
    transcript: [
      '[00:00] Тимофей: Покажи образ.',
      '[01:20] Костя: Главная — поиск и чат, встречи с контекстом и документами к дню.',
      '[08:00] Глеб: Адаптив на трёх ширинах.',
      '[15:00] Юлия: После показа обновим ЕДИ.',
      '[22:00] Тимофей: Вопросы зафиксируем отдельно.',
    ].join('\n'),
    acl: [],
    mentions: [
      {
        id: 'men-4',
        meetingId: 'mtg-prescreen-1108',
        taskContext: 'Демо-скрипт пре-скрининга',
        excerpt:
          'Костя: Главная — поиск и чат, встречи с контекстом и документами к дню.',
      },
    ],
    attachmentIds: [
      'doc-po-kb-card',
      'doc-rnd-instruction',
      'doc-meet-standup-card',
      'doc-rnd-pitch-template',
    ],
    comments: [],
    color: 'orange',
  },
  {
    id: 'mtg-design-sync-1108',
    title: 'Синк дизайна · образ встреч',
    startsAt: '2026-11-09T16:00:00+03:00',
    endsAt: '2026-11-09T16:30:00+03:00',
    organizerId: 'pers-kostya',
    agenda: [
      'Day-briefing: таймлайн и hour-grid',
      'Документы к сегодня',
      'Контекст прошлых транскриптов',
    ],
    joinUrl: 'https://telemost.yandex.ru/j/82108848514915',
    participants: ['pers-kostya', 'pers-gleb', 'pers-anna'],
    summary:
      'Сверка day-briefing раздела «Встречи»: таймлайн дней, документы к сегодня, контекст прошлых транскриптов.',
    decisions: ['Оставляем day-centric IA без master-detail списка всех встреч'],
    actionItems: ['Проверить empty states на пустых днях'],
    transcript: [
      '[00:00] Костя: Нужен календарь на день и AI-брифинг.',
      '[04:00] Глеб: Strip дней + hour-grid, на phone — agenda.',
      '[12:00] Анна: Документы к сегодня из вложений встреч.',
      '[20:00] Костя: Прошлый контекст — карточки с саммари.',
    ].join('\n'),
    acl: [],
    mentions: [],
    attachmentIds: ['doc-meet-standup-card', 'doc-po-roadmap'],
    comments: [
      {
        id: 'cmt-ds-1',
        authorId: 'pers-gleb',
        createdAt: '2026-11-09T16:45:00+03:00',
        text: 'Empty states на пустых днях проверю завтра утром.',
      },
    ],
    color: 'green',
  },
];

export type Person = {
  id: string;
  name: string;
  roleLabel: string;
  initials: string;
  avatarColor: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  /** Фото профиля; если задано — показывается вместо инициалов. */
  avatarSrc?: string;
};

export const PEOPLE: Person[] = [
  {
    id: 'pers-kostya',
    name: CURRENT_USER.fullName,
    roleLabel: CURRENT_USER.roleLabel,
    initials: CURRENT_USER.initials,
    avatarColor: 'primary',
    avatarSrc: CURRENT_USER.avatarSrc,
  },
  {
    id: 'pers-timofey',
    name: 'Тимофей Пенской',
    roleLabel: 'Руководитель управления',
    initials: 'ТП',
    avatarColor: 'secondary',
  },
  {
    id: 'pers-gleb',
    name: 'Глеб Любавский',
    roleLabel: 'UX/UI',
    initials: 'ГЛ',
    avatarColor: 'success',
  },
  {
    id: 'pers-maria',
    name: 'Мария Егорова',
    roleLabel: 'Продукт · Большие данные',
    initials: 'МЕ',
    avatarColor: 'warning',
  },
  {
    id: 'pers-hr',
    name: 'Сотрудник HR',
    roleLabel: 'HR',
    initials: 'HR',
    avatarColor: 'error',
  },
  {
    id: 'pers-yulia',
    name: 'Юлия Магнушевская',
    roleLabel: 'Организатор',
    initials: 'ЮМ',
    avatarColor: 'primary',
  },
  {
    id: 'pers-anna',
    name: 'Анна Бонд',
    roleLabel: 'Аналитика',
    initials: 'АБ',
    avatarColor: 'secondary',
  },
  {
    id: 'pers-elena',
    name: 'Елена Живописцева',
    roleLabel: 'Продукт',
    initials: 'ЕЖ',
    avatarColor: 'success',
  },
];

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

/** Последняя встреча для виджета главной (по дате). */
export function getLastMeeting(): Meeting {
  return [...MEETINGS].sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0]!;
}
