import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { DEFAULT_ROLE } from '@/mocks/roles';
import {
  chatIdForScenario,
  type RecentAssistantChat,
} from '@/scenarios/recentAssistantChats';
import type { Document, RoleId } from '@/types/knowledge';

const FAV_DOCS_KEY = 'ic-base-fav-docs';
const FAV_FOLDERS_KEY = 'ic-base-fav-folders';

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

type AppContextValue = {
  role: RoleId;
  setRole: (role: RoleId) => void;
  previewDoc: Document | null;
  /** Очередь файлов текущей выдачи / страницы для листания в превью. */
  previewQueue: Document[];
  openPreview: (doc: Document, queue?: Document[]) => void;
  stepPreview: (delta: -1 | 1) => void;
  closePreview: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchHistory: string[];
  pushSearchHistory: (q: string) => void;
  /** Черновик поиска по папке — сохраняется между открытиями. */
  getFolderSearchDraft: (folderId: string) => string;
  setFolderSearchDraft: (folderId: string, q: string) => void;
  recentAssistantChats: RecentAssistantChat[];
  upsertRecentAssistantChat: (
    chat: Omit<RecentAssistantChat, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string },
  ) => void;
  resetRecentAssistantChats: () => void;
  favoriteDocIds: string[];
  favoriteFolderIds: string[];
  isDocFavorite: (id: string) => boolean;
  isFolderFavorite: (id: string) => boolean;
  toggleDocFavorite: (id: string) => void;
  toggleFolderFavorite: (id: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function normalizePreviewQueue(doc: Document, queue?: Document[]): Document[] {
  if (!queue || queue.length === 0) return [doc];
  const seen = new Set<string>();
  const next: Document[] = [];
  for (const item of queue) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    next.push(item);
  }
  if (!seen.has(doc.id)) next.unshift(doc);
  return next;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<RoleId>(DEFAULT_ROLE);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewQueue, setPreviewQueue] = useState<Document[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [folderSearchDrafts, setFolderSearchDrafts] = useState<Record<string, string>>({});
  const [recentAssistantChats, setRecentAssistantChats] = useState<RecentAssistantChat[]>([]);
  const [favoriteDocIds, setFavoriteDocIds] = useState<string[]>(() => readIds(FAV_DOCS_KEY));
  const [favoriteFolderIds, setFavoriteFolderIds] = useState<string[]>(() =>
    readIds(FAV_FOLDERS_KEY),
  );

  const previewQueueRef = useRef(previewQueue);
  previewQueueRef.current = previewQueue;

  const openPreview = useCallback((doc: Document, queue?: Document[]) => {
    setPreviewQueue(normalizePreviewQueue(doc, queue));
    setPreviewDoc(doc);
  }, []);

  const stepPreview = useCallback((delta: -1 | 1) => {
    const queue = previewQueueRef.current;
    setPreviewDoc((current) => {
      if (!current) return current;
      const index = queue.findIndex((item) => item.id === current.id);
      if (index < 0) return current;
      return queue[index + delta] ?? current;
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewDoc(null);
    setPreviewQueue([]);
  }, []);

  const pushSearchHistory = useCallback((q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, 8));
  }, []);

  const getFolderSearchDraft = useCallback(
    (folderId: string) => folderSearchDrafts[folderId] ?? '',
    [folderSearchDrafts],
  );

  const setFolderSearchDraft = useCallback((folderId: string, q: string) => {
    setFolderSearchDrafts((prev) => {
      if ((prev[folderId] ?? '') === q) return prev;
      return { ...prev, [folderId]: q };
    });
  }, []);

  const upsertRecentAssistantChat = useCallback(
    (chat: Omit<RecentAssistantChat, 'id' | 'updatedAt'> & { id?: string; updatedAt?: string }) => {
      if (chat.turnPath.length < 1) return;
      const id = chat.id ?? chatIdForScenario(chat.scenarioId);
      const next: RecentAssistantChat = {
        id,
        scenarioId: chat.scenarioId,
        entryQuery: chat.entryQuery.trim(),
        turnPath: [...chat.turnPath],
        updatedAt: chat.updatedAt ?? new Date().toISOString(),
      };
      setRecentAssistantChats((prev) => [
        next,
        ...prev.filter((c) => c.scenarioId !== next.scenarioId && c.id !== next.id),
      ]);
    },
    [],
  );

  const resetRecentAssistantChats = useCallback(() => {
    setRecentAssistantChats([]);
    setSearchHistory([]);
  }, []);

  const isDocFavorite = useCallback(
    (id: string) => favoriteDocIds.includes(id),
    [favoriteDocIds],
  );
  const isFolderFavorite = useCallback(
    (id: string) => favoriteFolderIds.includes(id),
    [favoriteFolderIds],
  );

  const toggleDocFavorite = useCallback((id: string) => {
    setFavoriteDocIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      writeIds(FAV_DOCS_KEY, next);
      return next;
    });
  }, []);

  const toggleFolderFavorite = useCallback((id: string) => {
    setFavoriteFolderIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      writeIds(FAV_FOLDERS_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      role,
      setRole,
      previewDoc,
      previewQueue,
      openPreview,
      stepPreview,
      closePreview,
      sidebarOpen,
      setSidebarOpen,
      searchQuery,
      setSearchQuery,
      searchHistory,
      pushSearchHistory,
      getFolderSearchDraft,
      setFolderSearchDraft,
      recentAssistantChats,
      upsertRecentAssistantChat,
      resetRecentAssistantChats,
      favoriteDocIds,
      favoriteFolderIds,
      isDocFavorite,
      isFolderFavorite,
      toggleDocFavorite,
      toggleFolderFavorite,
    }),
    [
      role,
      previewDoc,
      previewQueue,
      openPreview,
      stepPreview,
      closePreview,
      sidebarOpen,
      searchQuery,
      searchHistory,
      pushSearchHistory,
      getFolderSearchDraft,
      setFolderSearchDraft,
      recentAssistantChats,
      upsertRecentAssistantChat,
      resetRecentAssistantChats,
      favoriteDocIds,
      favoriteFolderIds,
      isDocFavorite,
      isFolderFavorite,
      toggleDocFavorite,
      toggleFolderFavorite,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
