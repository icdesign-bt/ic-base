export type KbNotificationKind =
  | 'favorite_file_updated'
  | 'favorite_folder_files'
  | 'favorite_file_comment'
  | 'meeting_mention';

export type KbNotificationBase = {
  id: string;
  title: string;
  href: string;
  createdAt: string;
  /** По умолчанию при первом запуске. */
  defaultUnread: boolean;
};

export type KbNotificationFileUpdated = KbNotificationBase & {
  kind: 'favorite_file_updated';
  documentId: string;
};

export type KbNotificationFolderFiles = KbNotificationBase & {
  kind: 'favorite_folder_files';
  folderId: string;
  body: string;
};

export type KbNotificationFileComment = KbNotificationBase & {
  kind: 'favorite_file_comment';
  documentId: string;
  authorId: string;
  comment: string;
};

export type KbNotificationMeetingMention = KbNotificationBase & {
  kind: 'meeting_mention';
  meetingId: string;
  meetingTitle: string;
  meetingStartsAt: string;
  meetingEndsAt: string;
  taskContext: string;
  summary: string;
};

export type KbNotification =
  | KbNotificationFileUpdated
  | KbNotificationFolderFiles
  | KbNotificationFileComment
  | KbNotificationMeetingMention;

/** Моки уведомлений по избранным файлам/папкам. */
export const MOCK_NOTIFICATIONS: KbNotification[] = [
  {
    id: 'notif-fav-file-roadmap',
    kind: 'favorite_file_updated',
    title: 'Обновлён файл из избранного',
    documentId: 'doc-po-roadmap',
    href: '/favorites',
    createdAt: '2026-11-06T13:40:00+03:00',
    defaultUnread: true,
  },
  {
    id: 'notif-fav-folder-ic',
    kind: 'favorite_folder_files',
    title: 'Новые материалы в избранной папке',
    folderId: 'fld-innovacapital',
    body: 'Добавились новые файлы.',
    href: '/folder/fld-innovacapital',
    createdAt: '2026-11-06T11:15:00+03:00',
    defaultUnread: false,
  },
  {
    id: 'notif-fav-file-brief',
    kind: 'favorite_file_comment',
    title: 'Комментарий к избранному файлу',
    documentId: 'doc-ic-brief',
    authorId: 'pers-maria',
    comment:
      'Актуализировать площадку до пятницы и прислать обновлённый бриф в оргкомитет. Нужно согласовать с продуктовым офисом и зафиксировать ответственного.',
    href: '/favorites',
    createdAt: '2026-11-05T18:20:00+03:00',
    defaultUnread: false,
  },
  {
    id: 'notif-meeting-mention',
    kind: 'meeting_mention',
    title: 'Вас упоминали во встрече',
    meetingId: 'mtg-standup-1104',
    meetingTitle: 'Стендап управления дизайна',
    meetingStartsAt: '2026-11-04T10:00:00+03:00',
    meetingEndsAt: '2026-11-04T10:25:00+03:00',
    taskContext: 'Сборка образа БЗ 2.0 к пре-скринингу',
    summary:
      'Договорились собирать кликабельный образ Базы знаний 2.0 на моках к пре-скринингу: поиск, чат, встречи и ACL.',
    href: '/meeting/mtg-standup-1104',
    createdAt: '2026-11-04T10:30:00+03:00',
    defaultUnread: false,
  },
];
