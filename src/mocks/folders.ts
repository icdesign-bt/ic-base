import type { Folder } from '@/types/knowledge';

/** Хелпер: папки управлений видны всем ролям в демо; ACL режем на документах. */
const mgmt = (id: string, name: string, parentId: string): Folder => ({
  id,
  name,
  parentId,
  acl: [],
  scope: 'management',
});

export const FOLDERS: Folder[] = [
  { id: 'fld-root', name: 'База знаний ИЦ', parentId: null, acl: [], scope: 'shared' },

  // —— Папки управлений (как в оригинальной БЗ) ——
  mgmt('fld-bigdata', 'Большие данные', 'fld-root'),
  mgmt('fld-analytics', 'Аналитика', 'fld-root'),
  mgmt('fld-modeling', 'Моделирование', 'fld-root'),
  mgmt('fld-consulting', 'Стратегический консалтинг', 'fld-root'),
  mgmt('fld-dev', 'Разработка', 'fld-root'),
  mgmt('fld-design', 'Дизайн', 'fld-root'),
  mgmt('fld-orgdev', 'Организационное развитие', 'fld-root'),
  {
    id: 'fld-apparatus',
    name: 'Аппарат руководителя',
    parentId: 'fld-root',
    acl: ['apparatus'],
    scope: 'management',
  },
  mgmt('fld-afanasiev', 'А.Е. Афанасьев', 'fld-root'),
  mgmt('fld-initiatives', 'База инициатив', 'fld-root'),

  // Дизайн → подпапки
  mgmt('fld-design-internal', 'Внутрянка Дизайна', 'fld-design'),
  mgmt('fld-design-events', 'Мероприятия и события', 'fld-design'),
  mgmt('fld-design-sources', 'База исходников', 'fld-design'),
  mgmt('fld-design-presentations', 'Общие презентации ИЦ', 'fld-design'),
  mgmt('fld-design-products', 'Продукты ИЦ', 'fld-design'),
  mgmt('fld-design-training', 'Обучение | Тренинг', 'fld-design'),
  mgmt('fld-design-archive', 'Архив', 'fld-design'),
  mgmt('fld-design-slides', 'Банк слайдов', 'fld-design'),

  // Внутрянка Дизайна
  mgmt('fld-design-sreda', 'СРЕДА', 'fld-design-internal'),
  mgmt('fld-design-ipr', 'ИПР', 'fld-design-internal'),
  mgmt('fld-design-razborka', 'Дизайнерская «Разборка»', 'fld-design-internal'),

  // СРЕДА
  mgmt('fld-design-sreda-ai', 'Библиотека AI Motion сетапов', 'fld-design-sreda'),

  // Организационное развитие → бывший HR-контур
  {
    id: 'fld-hr',
    name: 'HR',
    parentId: 'fld-orgdev',
    acl: ['hr', 'apparatus'],
    scope: 'management',
  },
  {
    id: 'fld-hr-onboarding',
    name: 'Онбординг',
    parentId: 'fld-hr',
    acl: ['hr', 'apparatus'],
    scope: 'management',
  },
  {
    id: 'fld-hr-policies',
    name: 'Политики и регламенты',
    parentId: 'fld-hr',
    acl: ['hr', 'apparatus'],
    scope: 'management',
  },

  // Аппарат
  {
    id: 'fld-apparatus-notes',
    name: 'Служебные записки',
    parentId: 'fld-apparatus',
    acl: ['apparatus'],
    scope: 'management',
  },
  {
    id: 'fld-apparatus-protocols',
    name: 'Протоколы совещаний',
    parentId: 'fld-apparatus',
    acl: ['apparatus'],
    scope: 'management',
  },

  // —— Общие файлы и папки ——
  { id: 'fld-po', name: 'Продуктовый офис', parentId: 'fld-root', acl: [], scope: 'shared' },
  {
    id: 'fld-po-frameworks',
    name: 'Фреймворки',
    parentId: 'fld-po',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-po-roadmaps',
    name: 'Дорожные карты',
    parentId: 'fld-po',
    acl: [],
    scope: 'shared',
  },

  { id: 'fld-rnd', name: 'RnD и инициативы', parentId: 'fld-root', acl: [], scope: 'shared' },
  {
    id: 'fld-rnd-guides',
    name: 'Инструкции',
    parentId: 'fld-rnd',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-rnd-templates',
    name: 'Шаблоны',
    parentId: 'fld-rnd',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-user-prescreen',
    name: 'Материалы к пре-скринингу',
    parentId: 'fld-rnd',
    acl: [],
    scope: 'shared',
  },

  {
    id: 'fld-portfolio',
    name: 'Портфель систем',
    parentId: 'fld-root',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-portfolio-cards',
    name: 'Карточки систем',
    parentId: 'fld-portfolio',
    acl: [],
    scope: 'shared',
  },

  {
    id: 'fld-innovacapital',
    name: 'Инновационная столица 2027',
    parentId: 'fld-root',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-ic-program',
    name: 'Программа и брифы',
    parentId: 'fld-innovacapital',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-ic-stands',
    name: 'Стенды и материалы',
    parentId: 'fld-innovacapital',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-user-ic-drafts',
    name: 'Мои черновики ИС',
    parentId: 'fld-innovacapital',
    acl: [],
    scope: 'shared',
  },

  {
    id: 'fld-meetings',
    name: 'Знания из встреч',
    parentId: 'fld-root',
    acl: [],
    scope: 'shared',
  },
  {
    id: 'fld-meetings-standups',
    name: 'Стендапы',
    parentId: 'fld-meetings',
    acl: [],
    scope: 'shared',
  },
];
