import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, EmptyState, Icon, IconButton, Input, Text, Tooltip } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { DocumentTile } from '@/components/docs/DocumentTile';
import { FolderCard } from '@/components/docs/FolderCard';
import { ViewModeToggle, type ViewMode } from '@/components/docs/ViewModeToggle';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { getDocument, getFolder, searchDocuments, searchFolders } from '@/lib/corpus';
import { countLabel, filesCountLabel, foldersCountLabel } from '@/lib/format';
import { matchAssistantEntry } from '@/scenarios/assistantFlows';
import { useApp } from '@/state/AppContext';
import { ROLES } from '@/mocks/roles';
import type { Document } from '@/types/knowledge';

type SearchHitDoc = {
  doc: Document;
  scorePct: number;
};

export function SearchPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const folderId = (params.get('folder') ?? '').trim();
  const folder = folderId ? getFolder(folderId) : undefined;
  const scopedToFolder = Boolean(folder);
  const { role, setSearchQuery, pushSearchHistory, setFolderSearchDraft } = useApp();
  const [draft, setDraft] = useState(q);
  const [view, setView] = useState<ViewMode>('list');

  useEffect(() => {
    setDraft(q);
    if (q) setSearchQuery(q);
  }, [q, setSearchQuery]);

  useEffect(() => {
    if (!scopedToFolder || !folderId) return;
    setFolderSearchDraft(folderId, draft);
  }, [scopedToFolder, folderId, draft, setFolderSearchDraft]);

  useEffect(() => {
    // Поиск внутри папки — всегда keyword search, без ассистента.
    if (scopedToFolder) return;
    if (q && matchAssistantEntry(q)) {
      navigate(`/assistant?q=${encodeURIComponent(q)}`, { replace: true });
    }
  }, [q, navigate, scopedToFolder]);

  const closeFolderSearch = useCallback(() => {
    if (!folder) return;
    setFolderSearchDraft(folder.id, draft);
    navigate(`/folder/${folder.id}`);
  }, [folder, draft, setFolderSearchDraft, navigate]);

  useEffect(() => {
    if (!scopedToFolder) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      closeFolderSearch();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [scopedToFolder, closeFolderSearch]);

  const result = useMemo(
    () => searchDocuments(q, role, scopedToFolder ? { folderId } : undefined),
    [q, role, scopedToFolder, folderId],
  );
  const folderHits = useMemo(
    () => searchFolders(q, role, scopedToFolder ? { folderId } : undefined),
    [q, role, scopedToFolder, folderId],
  );
  const hits = useMemo(() => {
    const out: SearchHitDoc[] = [];
    for (const hit of result.hits) {
      const doc = getDocument(hit.documentId);
      if (!doc) continue;
      out.push({ doc, scorePct: Math.round(hit.score * 100) });
    }
    return out;
  }, [result.hits]);
  const previewQueue = useMemo(() => hits.map((h) => h.doc), [hits]);
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? role;
  const hasQuery = Boolean(q.trim());
  const totalCount = folderHits.length + hits.length;

  const submit = useCallback(
    (value: string) => {
      const next = value.trim();
      if (!next) return;
      setDraft(next);
      setSearchQuery(next);
      pushSearchHistory(next);
      if (scopedToFolder && folderId) {
        navigate(
          `/search?q=${encodeURIComponent(next)}&folder=${encodeURIComponent(folderId)}`,
        );
        return;
      }
      if (matchAssistantEntry(next)) {
        navigate(`/assistant?q=${encodeURIComponent(next)}`);
        return;
      }
      navigate(`/search?q=${encodeURIComponent(next)}`);
    },
    [
      setSearchQuery,
      pushSearchHistory,
      scopedToFolder,
      folderId,
      navigate,
    ],
  );

  const { listening, toggle: toggleVoice } = useSpeechToText({
    onInterim: (text) => setDraft(text),
    onFinal: (text) => submit(text),
    onError: (message) => window.alert(message),
  });

  function resultsTitle(): string | null {
    if (!hasQuery) return null;
    if (totalCount === 0) {
      return scopedToFolder && folder
        ? `В «${folder.name}» ничего не найдено`
        : 'Ничего не найдено';
    }
    const parts: string[] = [];
    if (folderHits.length > 0) parts.push(foldersCountLabel(folderHits.length));
    if (hits.length > 0) parts.push(filesCountLabel(hits.length));
    const body = parts.join(' · ');
    if (scopedToFolder && folder) return `В «${folder.name}» найдено: ${body}`;
    return `Найдено: ${body}`;
  }

  const title = resultsTitle();

  return (
    <div className="kb-page kb-page--search">
      <div
        className={
          scopedToFolder
            ? 'kb-search-page__bar-row kb-search-page__bar-row--folder'
            : 'kb-search-page__bar-row'
        }
      >
        {scopedToFolder ? <span className="kb-search-page__bar-side" aria-hidden /> : null}
        <form
          className="kb-search-page__bar"
          onSubmit={(e) => {
            e.preventDefault();
            submit(draft);
          }}
        >
          <Input
            className="kb-search-page__input"
            fullWidth
            size="lg"
            autoFocus={scopedToFolder}
            placeholder={
              listening
                ? 'Слушаю…'
                : scopedToFolder && folder
                  ? `Поиск в «${folder.name}»`
                  : 'Поиск по Базе знаний'
            }
            value={draft}
            aria-label="Поиск"
            startIcon={<Icon path="System Devices/MagnifyingGlass" size={20} weight="regular" />}
            endIcon={
              <span className="kb-landing-search__end">
                <IconButton
                  className={['kb-mic', listening ? 'kb-mic--listening' : '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={listening ? 'Остановить голосовой ввод' : 'Голосовой запрос'}
                  aria-pressed={listening}
                  size="md"
                  color={listening ? 'primary' : 'neutral'}
                  variant="text"
                  icon={<Icon path="Media/Microphone" size={20} weight="regular" />}
                  type="button"
                  onClick={toggleVoice}
                />
                <Button
                  size="md"
                  color="primary"
                  variant="contained"
                  disabled={!draft.trim()}
                  type="submit"
                >
                  Найти
                </Button>
              </span>
            }
            onChange={(e) => setDraft(e.target.value)}
          />
        </form>
        {scopedToFolder && folder ? (
          <div className="kb-search-page__bar-side kb-search-page__bar-side--end">
            <IconButton
              className="kb-search-page__close"
              aria-label="Закрыть поиск"
              size="md"
              variant="text"
              color="neutral"
              icon={<Icon path="Math & Finances/X" size={18} weight="regular" />}
              onClick={closeFolderSearch}
            />
          </div>
        ) : null}
      </div>

      {result.hiddenByAcl > 0 ? (
        <div className="kb-acl-banner" role="status">
          <Text as="p" variant="body-sm">
            {result.hits.length === 0 && folderHits.length === 0
              ? `Для роли «${roleLabel}» документы сценария скрыты ACL (${result.hiddenByAcl}). Переключите роль на «Аппарат руководителя», чтобы увидеть.`
              : `Ещё ${countLabel(result.hiddenByAcl, 'документ', 'документа', 'документов')} сценария скрыто ACL для роли «${roleLabel}».`}
          </Text>
        </div>
      ) : null}

      {title ? (
        <div className="kb-search-page__head">
          <Text as="h1" variant="subtitle-md-bold">
            {title}
          </Text>
        </div>
      ) : null}

      {!hasQuery ? (
        <EmptyState
          title="Начните поиск"
          description={
            scopedToFolder && folder
              ? `Введите запрос, чтобы найти папки и файлы в «${folder.name}».`
              : 'Введите запрос и нажмите «Найти».'
          }
        />
      ) : totalCount === 0 ? (
        <EmptyState
          title={result.hiddenByAcl > 0 ? 'Нет доступа к выдаче' : 'Ничего не найдено'}
          description={
            result.hiddenByAcl > 0
              ? 'Сработал ACL Базы знаний 2.0 — смена роли меняет видимость.'
              : 'Попробуйте другую формулировку.'
          }
        />
      ) : (
        <div className="kb-search-page__results">
          {folderHits.length > 0 ? (
            <section className="kb-section">
              <Text as="h2" variant="subtitle-md-bold">
                Папки
              </Text>
              <div className="kb-folder-grid">
                {folderHits.map((hit) => (
                  <FolderCard key={hit.id} folder={hit} />
                ))}
              </div>
            </section>
          ) : null}

          {hits.length > 0 ? (
            <section className="kb-section">
              <div className="kb-section__head kb-search-page__files-head">
                <Text as="h2" variant="subtitle-md-bold">
                  Файлы
                </Text>
                <ViewModeToggle value={view} onChange={setView} />
              </div>
              {view === 'list' ? (
                <div className="kb-search-page__list" role="list">
                  {hits.map(({ doc, scorePct }) => (
                    <div key={doc.id} className="kb-search-page__hit" role="listitem">
                      <Tooltip content={`${scorePct}% совпадения`} position="top">
                        <DocumentFileCard doc={doc} previewQueue={previewQueue} />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="kb-search-page__grid kb-file-preview-grid">
                  {hits.map(({ doc, scorePct }) => (
                    <div key={doc.id} className="kb-search-page__hit">
                      <Tooltip content={`${scorePct}% совпадения`} position="top">
                        <DocumentTile doc={doc} previewQueue={previewQueue} />
                      </Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
