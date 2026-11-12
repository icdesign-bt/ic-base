import type { FrequentItem } from '@/mocks/frequent';

/** Файлы и папки, которые создал / загрузил текущий пользователь (мок). */
export const USER_UPLOADED_ITEMS: FrequentItem[] = [
  { kind: 'folder', folderId: 'fld-user-prescreen' },
  { kind: 'document', documentId: 'doc-user-kb-pitch' },
  { kind: 'document', documentId: 'doc-user-acl-notes' },
  { kind: 'folder', folderId: 'fld-user-ic-drafts' },
  { kind: 'document', documentId: 'doc-user-ic-checklist' },
  { kind: 'document', documentId: 'doc-user-brief-edit' },
];
