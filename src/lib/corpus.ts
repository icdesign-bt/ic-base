import { canView } from '@/lib/acl';
import { DOCUMENTS } from '@/mocks/documents';
import { FOLDERS } from '@/mocks/folders';
import { FREQUENT_ITEMS, type FrequentItem } from '@/mocks/frequent';
import { getLastMeeting, MEETINGS } from '@/mocks/meetings';
import { RECENT_DOCUMENTS, RECENT_QUERIES } from '@/mocks/recent';
import { USER_UPLOADED_ITEMS } from '@/mocks/uploaded';
import { matchIntent } from '@/scenarios/intents';
import type {
  Document,
  Folder,
  FolderScope,
  Meeting,
  RecentQuery,
  RoleId,
  SearchHit,
  SearchResult,
} from '@/types/knowledge';

const FOLDER_SCOPE_TITLES: Record<FolderScope, string> = {
  management: 'Папки управлений',
  shared: 'Общие файлы и папки',
};

export type FolderBreadcrumbItem = {
  id: string;
  label: string;
  /** Нет `to` у текущего пункта. */
  to?: string;
};

/** Цепочка: раздел scope → предки → текущая папка (без `fld-root`). */
export function folderBreadcrumbTrail(folderId: string): FolderBreadcrumbItem[] {
  const folder = getFolder(folderId);
  if (!folder) return [];

  const chain: Folder[] = [];
  let cur: Folder | undefined = folder;
  while (cur) {
    chain.unshift(cur);
    cur = cur.parentId ? getFolder(cur.parentId) : undefined;
  }

  const withoutRoot = chain.filter((f) => f.id !== 'fld-root');
  const items: FolderBreadcrumbItem[] = [
    {
      id: `scope-${folder.scope}`,
      label: FOLDER_SCOPE_TITLES[folder.scope],
      to: `/folders/${folder.scope}`,
    },
  ];

  withoutRoot.forEach((f, index) => {
    const isCurrent = index === withoutRoot.length - 1;
    items.push({
      id: f.id,
      label: f.name,
      to: isCurrent ? undefined : `/folder/${f.id}`,
    });
  });

  return items;
}

export type FolderStats = Folder & {
  fileCount: number;
  folderCount: number;
  sizeLabel: string;
};

export type FrequentEntry =
  | { kind: 'folder'; folder: FolderStats }
  | { kind: 'document'; document: Document };

/** Документы из смешанного списка (для очереди превью). */
export function documentsFromMixed(items: FrequentEntry[]): Document[] {
  return items
    .filter((item): item is { kind: 'document'; document: Document } => item.kind === 'document')
    .map((item) => item.document);
}

export function getFolder(id: string): Folder | undefined {
  return FOLDERS.find((f) => f.id === id);
}

/** Папка текущего пользователя (мок «ваши файлы и папки»). */
export function isOwnedFolder(folderId: string): boolean {
  return USER_UPLOADED_ITEMS.some(
    (item) => item.kind === 'folder' && item.folderId === folderId,
  );
}

/** Можно ли загружать / создавать внутри папки для роли. */
export function canManageFolder(folder: Folder, role: RoleId): boolean {
  return canView(folder.acl, role);
}

/**
 * Подпись действия создания: в корне — раздел, внутри раздела — папка.
 */
export function folderCreateActionLabel(folder: Folder): string {
  if (!folder.parentId || folder.id === 'fld-root') return 'Создать раздел';
  return 'Создать папку';
}

export function getDocument(id: string): Document | undefined {
  return DOCUMENTS.find((d) => d.id === id);
}

export function listDocumentsForRole(role: RoleId): Document[] {
  return DOCUMENTS.filter(
    (d) => canView(d.acl, role) && canView(getFolder(d.folderId)?.acl ?? [], role),
  );
}

export function listFoldersForRole(role: RoleId): Folder[] {
  return FOLDERS.filter((f) => canView(f.acl, role));
}

/** Папки верхнего уровня в сайдбаре. */
export function listRootFoldersForRole(role: RoleId): Folder[] {
  return listFoldersForRole(role).filter((f) => f.parentId === 'fld-root');
}

/** Подпапки внутри папки (с учётом ACL). */
export function listChildFoldersForRole(parentId: string, role: RoleId): Folder[] {
  return listFoldersForRole(role).filter((f) => f.parentId === parentId);
}

export function folderStatsForRole(folderId: string, role: RoleId): FolderStats | null {
  return folderStats(folderId, role);
}

export function listMeetingsForRole(role: RoleId): Meeting[] {
  return MEETINGS.filter((m) => canView(m.acl, role));
}

export type RecentDocumentEntry = Document & { openedAt: string };

export type RecentFolderEntry = FolderStats & {
  openedAt: string;
};

export function recentDocumentsForRole(role: RoleId): RecentDocumentEntry[] {
  return RECENT_DOCUMENTS.map((r) => {
    const doc = getDocument(r.documentId);
    if (!doc) return null;
    if (!canView(doc.acl, role) || !canView(getFolder(doc.folderId)?.acl ?? [], role)) return null;
    return { ...doc, openedAt: r.openedAt };
  })
    .filter((d): d is RecentDocumentEntry => Boolean(d))
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

/** Папки, с которыми недавно работали (по recent documents), слева — самые свежие. */
export function recentFoldersForRole(role: RoleId): RecentFolderEntry[] {
  const recent = recentDocumentsForRole(role);
  const firstOpen = new Map<string, string>();
  for (const doc of recent) {
    if (!firstOpen.has(doc.folderId)) firstOpen.set(doc.folderId, doc.openedAt);
  }

  return [...firstOpen.entries()]
    .map(([folderId, openedAt]) => {
      const folder = folderStats(folderId, role);
      if (!folder) return null;
      return { ...folder, openedAt };
    })
    .filter((f): f is RecentFolderEntry => Boolean(f))
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
}

export function recentQueries(): RecentQuery[] {
  return RECENT_QUERIES;
}

export function descendantFolderIds(rootId: string): string[] {
  const ids = [rootId];
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const f of FOLDERS) {
      if (f.parentId === id) {
        ids.push(f.id);
        queue.push(f.id);
      }
    }
  }
  return ids;
}

function folderStats(folderId: string, role: RoleId): FolderStats | null {
  const folder = getFolder(folderId);
  if (!folder || !canView(folder.acl, role)) return null;

  const folderCount = listFoldersForRole(role).filter((f) => f.parentId === folderId).length;
  const treeIds = new Set(descendantFolderIds(folderId));
  const docs = listDocumentsForRole(role).filter((d) => treeIds.has(d.folderId));
  const totalKb = docs.reduce((sum, d) => {
    const n = Number.parseFloat(d.sizeLabel.replace(',', '.').replace(/[^\d.]/g, ''));
    if (Number.isNaN(n)) return sum;
    if (/мб/i.test(d.sizeLabel)) return sum + n * 1024;
    return sum + n;
  }, 0);
  const sizeLabel =
    totalKb >= 1024
      ? `${(totalKb / 1024).toFixed(1).replace('.0', '')} МБ`
      : `${Math.round(totalKb)} КБ`;
  return { ...folder, fileCount: docs.length, folderCount, sizeLabel };
}

function resolveMixedItems(items: FrequentItem[], role: RoleId): FrequentEntry[] {
  const out: FrequentEntry[] = [];
  for (const item of items) {
    if (item.kind === 'folder') {
      const folder = folderStats(item.folderId, role);
      if (folder) out.push({ kind: 'folder', folder });
      continue;
    }
    const document = getDocument(item.documentId);
    if (
      document &&
      canView(document.acl, role) &&
      canView(getFolder(document.folderId)?.acl ?? [], role)
    ) {
      out.push({ kind: 'document', document });
    }
  }
  return out;
}

/** Часто используемые: папки и файлы в одном ряду (мок-порядок). */
export function frequentItemsForRole(role: RoleId): FrequentEntry[] {
  return resolveMixedItems(FREQUENT_ITEMS, role);
}

/** «Ваши файлы и папки»: созданные / загруженные пользователем папки и файлы. */
export function uploadedItemsForRole(role: RoleId): FrequentEntry[] {
  return resolveMixedItems(USER_UPLOADED_ITEMS, role);
}

export function lastMeetingSummary(role: RoleId): Meeting | null {
  const last = getLastMeeting();
  return canView(last.acl, role) ? last : null;
}

export function mentionsForRole(role: RoleId) {
  return listMeetingsForRole(role).flatMap((m) =>
    m.mentions.map((mention) => ({ ...mention, meetingTitle: m.title })),
  );
}

export type SearchDocumentsOptions = {
  /** Ограничить выдачу деревом папки (сама + подпапки). Без сценариев ассистента. */
  folderId?: string;
};

export type SearchFoldersOptions = {
  /** Искать только среди потомков папки (без самой корневой). */
  folderId?: string;
};

/** Keyword-поиск папок по имени (с ACL и опциональным скоупом дерева). */
export function searchFolders(
  query: string,
  role: RoleId,
  options?: SearchFoldersOptions,
): FolderStats[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scopeId = options?.folderId?.trim() || undefined;
  let folders = listFoldersForRole(role).filter((f) => f.id !== 'fld-root');

  if (scopeId) {
    const treeIds = new Set(descendantFolderIds(scopeId));
    treeIds.delete(scopeId);
    folders = folders.filter((f) => treeIds.has(f.id));
  }

  const first = q.split(/\s+/)[0] ?? q;
  return folders
    .filter((f) => f.name.toLowerCase().includes(first))
    .map((f) => folderStats(f.id, role))
    .filter((f): f is FolderStats => Boolean(f))
    .sort((a, b) => {
      const aFull = a.name.toLowerCase().includes(q) ? 1 : 0;
      const bFull = b.name.toLowerCase().includes(q) ? 1 : 0;
      return bFull - aFull || a.name.localeCompare(b.name, 'ru');
    });
}

/** Поиск: intent → фиксированная выдача + ACL-meta; иначе keyword по body/title. */
export function searchDocuments(
  query: string,
  role: RoleId,
  options?: SearchDocumentsOptions,
): SearchResult {
  const folderId = options?.folderId?.trim() || undefined;
  let visible = listDocumentsForRole(role);
  if (folderId) {
    const treeIds = new Set(descendantFolderIds(folderId));
    visible = visible.filter((d) => treeIds.has(d.folderId));
  }

  // Внутри папки — только keyword, без увода в умные сценарии.
  const intent = folderId ? null : matchIntent(query);

  if (intent) {
    const hits = intent.searchDocumentIds
      .map((id, index) => {
        const doc = visible.find((d) => d.id === id);
        if (!doc) return null;
        const snippet = doc.body.slice(0, 160) + (doc.body.length > 160 ? '…' : '');
        return {
          documentId: doc.id,
          score: 1 - index * 0.08,
          snippet,
          reason: `Сценарий: ${intent.label}`,
        } satisfies SearchHit;
      })
      .filter((h): h is SearchHit => h !== null);

    const hiddenByAcl = intent.searchDocumentIds.filter(
      (id) => !visible.some((d) => d.id === id) && Boolean(getDocument(id)),
    ).length;

    return {
      hits,
      intentId: intent.id,
      intentLabel: intent.label,
      hiddenByAcl,
    };
  }

  const q = query.toLowerCase().trim();
  const hits = visible
    .map((doc) => {
      const hay = `${doc.title} ${doc.body} ${doc.tags.join(' ')}`.toLowerCase();
      if (!q) return null;
      const first = q.split(/\s+/)[0] ?? q;
      if (!hay.includes(first)) return null;
      return {
        documentId: doc.id,
        score: hay.includes(q) ? 0.7 : 0.4,
        snippet: doc.body.slice(0, 160) + (doc.body.length > 160 ? '…' : ''),
        reason: folderId ? 'Совпадение в папке' : 'Совпадение по тексту',
      } satisfies SearchHit;
    })
    .filter((h): h is SearchHit => h !== null)
    .sort((a, b) => b.score - a.score);

  return {
    hits,
    intentId: null,
    intentLabel: null,
    hiddenByAcl: 0,
  };
}

export function corpusStats(role: RoleId) {
  return {
    folders: listFoldersForRole(role).length,
    documents: listDocumentsForRole(role).length,
    meetings: listMeetingsForRole(role).length,
    recentDocs: recentDocumentsForRole(role).length,
    recentQueries: recentQueries().length,
    mentions: mentionsForRole(role).length,
    hiddenDocs: DOCUMENTS.length - listDocumentsForRole(role).length,
  };
}
