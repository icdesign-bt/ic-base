/** Роли демо-ACL (переключатель в шапке с фазы 2). */
export type RoleId = 'apparatus' | 'hr' | 'employee';

export type FileType =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'image'
  | 'txt'
  | 'md';

/** Кто может видеть сущность. Пустой массив = все роли. */
export type Acl = RoleId[];

export type Person = {
  id: string;
  name: string;
  roleLabel: string;
};

/** Задел под ролевую модель: папки управления vs общие. */
export type FolderScope = 'management' | 'shared';

export type Folder = {
  id: string;
  name: string;
  parentId: string | null;
  acl: Acl;
  scope: FolderScope;
};

export type PreviewPayload = {
  kind: FileType;
  /** Короткий текст / «страницы» для drawer. */
  pages: string[];
  /** Опционально для image. */
  imageLabel?: string;
};

export type Document = {
  id: string;
  title: string;
  folderId: string;
  fileType: FileType;
  updatedAt: string;
  sizeLabel: string;
  tags: string[];
  acl: Acl;
  /** Текст для поиска и сниппетов. */
  body: string;
  preview: PreviewPayload;
  /** Связь со встречей, если документ из транскрипта. */
  sourceMeetingId?: string;
  /** Автор / загрузка (для модалки превью). */
  createdById?: string;
  createdAt?: string;
  uploadedAt?: string;
};

export type Mention = {
  id: string;
  meetingId: string;
  taskContext: string;
  excerpt: string;
};

export type MeetingComment = {
  id: string;
  authorId: string;
  createdAt: string;
  text: string;
};

export type Meeting = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  /** Организатор встречи (id из PEOPLE). */
  organizerId: string;
  /** Пункты повестки. */
  agenda: string[];
  participants: string[];
  summary: string;
  decisions: string[];
  actionItems: string[];
  transcript: string;
  acl: Acl;
  mentions: Mention[];
  /** Документ-карточка знания после «сохранить в БЗ». */
  knowledgeDocId?: string;
  /** Файлы к встрече для ознакомления. */
  attachmentIds?: string[];
  /** Ссылка на видеовстречу (Телемост и т.п.). */
  joinUrl?: string;
  /** URL записи; наличие = показать плеер-заглушку. */
  recordingUrl?: string;
  /** Комментарии к встрече. */
  comments: MeetingComment[];
  /** Цвет события в стиле Apple Calendar. */
  color?: 'purple' | 'blue' | 'pink' | 'orange' | 'green';
};

export type RecentQuery = {
  id: string;
  text: string;
  at: string;
};

export type RecentDocumentRef = {
  documentId: string;
  openedAt: string;
};

export type IntentId =
  | 'innovacapital'
  | 'start_initiative'
  | 'acl_sensitive'
  | 'meeting_knowledge';

export type SearchHit = {
  documentId: string;
  score: number;
  snippet: string;
  reason: string;
};

export type SearchResult = {
  hits: SearchHit[];
  intentId: IntentId | null;
  intentLabel: string | null;
  /** Документы сценария, скрытые ACL для текущей роли. */
  hiddenByAcl: number;
};

export type ChatCitation = {
  documentId: string;
  label: string;
};

export type ChatReply = {
  intentId: IntentId;
  answer: string;
  citations: ChatCitation[];
};

export type IntentScenario = {
  id: IntentId;
  label: string;
  phrases: string[];
  /** Документы для выдачи поиска (порядок = релевантность). */
  searchDocumentIds: string[];
  chat?: ChatReply;
};
