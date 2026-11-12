import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip, EmptyState, Icon, IconButton, Input, Text, Tooltip } from 'ic-kit';
import { ArtifactSkeleton } from '@/components/docs/ArtifactSkeleton';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { DocumentTile } from '@/components/docs/DocumentTile';
import { ViewModeToggle, type ViewMode } from '@/components/docs/ViewModeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { canView } from '@/lib/acl';
import { getDocument, getFolder } from '@/lib/corpus';
import { filesCountLabel } from '@/lib/format';
import {
  ASSISTANT_FLOWS,
  ASSISTANT_FOLLOWUP_MS,
  ASSISTANT_THINK_MS,
  getAssistantTurn,
  matchAssistantEntry,
  matchAssistantFollowUp,
  type AssistantScenarioId,
} from '@/scenarios/assistantFlows';
import { buildAssistantThread } from '@/scenarios/recentAssistantChats';
import { useApp } from '@/state/AppContext';
import type { Document } from '@/types/knowledge';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Снимок выдачи на этом шаге (для возврата). */
  turnId: string;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const CHAT_RATIO_DEFAULT = 1 / 3;
const CHAT_RATIO_MIN = 0.22;
/** Макс. ширина чата — 50% экрана (не контейнера). */
const CHAT_MAX_VIEWPORT = 0.5;
const CHAT_RATIO_STORAGE_KEY = 'ic-base-assistant-chat-ratio';

function readStoredChatRatio(): number {
  try {
    const raw = sessionStorage.getItem(CHAT_RATIO_STORAGE_KEY);
    if (!raw) return CHAT_RATIO_DEFAULT;
    const value = Number(raw);
    if (!Number.isFinite(value)) return CHAT_RATIO_DEFAULT;
    return Math.min(0.9, Math.max(CHAT_RATIO_MIN, value));
  } catch {
    return CHAT_RATIO_DEFAULT;
  }
}

function writeStoredChatRatio(ratio: number) {
  try {
    sessionStorage.setItem(CHAT_RATIO_STORAGE_KEY, String(ratio));
  } catch {
    /* ignore */
  }
}

function clampChatRatio(ratio: number, layoutWidth: number): number {
  if (layoutWidth <= 0) return CHAT_RATIO_DEFAULT;
  const minPx = CHAT_RATIO_MIN * layoutWidth;
  const maxPx = Math.min(CHAT_MAX_VIEWPORT * window.innerWidth, layoutWidth * 0.85);
  const nextPx = Math.min(maxPx, Math.max(minPx, ratio * layoutWidth));
  return nextPx / layoutWidth;
}

function GripVerticalIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" fill="none" aria-hidden="true">
      <circle cx="4" cy="4" r="1.5" fill="currentColor" />
      <circle cx="10" cy="4" r="1.5" fill="currentColor" />
      <circle cx="4" cy="10" r="1.5" fill="currentColor" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <circle cx="4" cy="16" r="1.5" fill="currentColor" />
      <circle cx="10" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

function visibleDocs(ids: string[], role: ReturnType<typeof useApp>['role']) {
  return ids
    .map((id) => getDocument(id))
    .filter((d): d is NonNullable<typeof d> => {
      if (!d) return false;
      const folder = getFolder(d.folderId);
      return canView(d.acl, role) && canView(folder?.acl ?? [], role);
    });
}

export function AssistantPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const entryQuery = (params.get('q') ?? '').trim();
  const resumeTurn = (params.get('turn') ?? '').trim();
  const {
    role,
    setSearchQuery,
    pushSearchHistory,
    recentAssistantChats,
    upsertRecentAssistantChat,
  } = useApp();

  const scenarioId = useMemo(() => matchAssistantEntry(entryQuery), [entryQuery]);
  const flow = scenarioId ? ASSISTANT_FLOWS[scenarioId] : null;

  const [activeScenario, setActiveScenario] = useState<AssistantScenarioId | null>(scenarioId);
  const [turnId, setTurnId] = useState(flow?.initialTurnId ?? '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);
  /** Первая выдача — скелетон; уточнения — короче + лёгкое затемнение. */
  const [initialThinking, setInitialThinking] = useState(false);
  const [entered, setEntered] = useState(false);
  const stacked = useMediaQuery('(max-width: 900px)');
  const [artifactsView, setArtifactsView] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
      ? 'list'
      : 'grid',
  );
  const threadRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const thinkTimer = useRef<number | null>(null);
  const turnPathRef = useRef<string[]>([]);
  const sendRef = useRef<(raw: string) => void>(() => {});
  const [chatRatio, setChatRatio] = useState(readStoredChatRatio);
  const [resizing, setResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startRatio: number } | null>(null);
  const prevStackedRef = useRef(stacked);

  const { listening, toggle: toggleVoice, stop: stopVoice } = useSpeechToText({
    onInterim: (text) => setDraft(text),
    onFinal: (text) => sendRef.current(text),
    onError: (message) => window.alert(message),
  });

  const applyChatRatio = useCallback((ratio: number) => {
    const layoutWidth = layoutRef.current?.getBoundingClientRect().width ?? 0;
    const next = clampChatRatio(ratio, layoutWidth || window.innerWidth);
    setChatRatio(next);
    writeStoredChatRatio(next);
  }, []);

  const turn =
    activeScenario && turnId ? getAssistantTurn(activeScenario, turnId) : null;

  const artifacts = useMemo(() => {
    if (!turn) return [];
    return visibleDocs(turn.documentIds, role);
  }, [turn, role]);

  const lastAssistantIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'assistant') return i;
    }
    return -1;
  }, [messages]);

  useEffect(() => {
    setEntered(false);
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [entryQuery]);

  useEffect(() => {
    if (prevStackedRef.current === stacked) return;
    prevStackedRef.current = stacked;
    setArtifactsView(stacked ? 'list' : 'grid');
  }, [stacked]);

  useEffect(() => {
    if (!scenarioId || !flow) return;

    setActiveScenario(scenarioId);
    setSearchQuery(entryQuery);
    pushSearchHistory(entryQuery);
    setDraft('');

    // `turn` в URL — сигнал resume; актуальное состояние берём из сессии (в т.ч. после rewind).
    const saved =
      resumeTurn.length > 0
        ? recentAssistantChats.find((c) => c.scenarioId === scenarioId && c.turnPath.length >= 1)
        : undefined;

    if (thinkTimer.current) window.clearTimeout(thinkTimer.current);

    if (saved) {
      const thread = buildAssistantThread(saved.scenarioId, saved.entryQuery, saved.turnPath);
      turnPathRef.current = [...saved.turnPath];
      setTurnId(saved.turnPath[saved.turnPath.length - 1]!);
      setMessages(
        thread.map((m) => ({
          id: uid(m.role === 'user' ? 'u' : 'a'),
          role: m.role,
          text: m.text,
          turnId: m.turnId,
        })),
      );
      setThinking(false);
      setInitialThinking(false);
      return () => {
        if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
      };
    }

    const initialPath = [flow.initialTurnId];
    turnPathRef.current = initialPath;
    upsertRecentAssistantChat({
      scenarioId,
      entryQuery,
      turnPath: initialPath,
    });
    setTurnId(flow.initialTurnId);
    setMessages([
      { id: uid('u'), role: 'user', text: entryQuery, turnId: flow.initialTurnId },
    ]);
    setThinking(true);
    setInitialThinking(true);

    thinkTimer.current = window.setTimeout(() => {
      const initial = getAssistantTurn(scenarioId, flow.initialTurnId);
      const visible = visibleDocs(initial.documentIds, role);
      const text =
        visible.length === 0 && initial.emptyAnswer
          ? initial.emptyAnswer
          : initial.answer;
      setMessages((prev) => [
        ...prev,
        { id: uid('a'), role: 'assistant', text, turnId: flow.initialTurnId },
      ]);
      setThinking(false);
      setInitialThinking(false);
    }, ASSISTANT_THINK_MS);

    return () => {
      if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    };
    // role / recentAssistantChats: снимок на момент входа
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryQuery, resumeTurn, scenarioId, setSearchQuery, pushSearchHistory, upsertRecentAssistantChat]);

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    if (stacked) {
      const anchor =
        el.querySelector<HTMLElement>('.kb-chat__msg:last-of-type') ??
        el.lastElementChild;
      if (anchor instanceof HTMLElement) {
        const top = anchor.offsetTop - 8;
        el.scrollTop = Math.max(0, top);
        return;
      }
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, thinking, stacked]);

  function send(raw: string) {
    const q = raw.trim();
    if (!q || thinking || !activeScenario || !flow) return;

    const nextId = matchAssistantFollowUp(q, activeScenario, turnId);
    const resultTurnId = nextId ?? turnId;
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { id: uid('u'), role: 'user', text: q, turnId: resultTurnId },
    ]);
    setThinking(true);
    setInitialThinking(false);

    if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    thinkTimer.current = window.setTimeout(() => {
      if (nextId) {
        const nextTurn = getAssistantTurn(activeScenario, nextId);
        setTurnId(nextId);
        const path = [...turnPathRef.current, nextId];
        turnPathRef.current = path;
        upsertRecentAssistantChat({
          scenarioId: activeScenario,
          entryQuery,
          turnPath: path,
        });
        const visible = visibleDocs(nextTurn.documentIds, role);
        const text =
          visible.length === 0 && nextTurn.emptyAnswer
            ? nextTurn.emptyAnswer
            : nextTurn.answer;
        setMessages((prev) => [
          ...prev,
          { id: uid('a'), role: 'assistant', text, turnId: nextId },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: uid('a'),
            role: 'assistant',
            text: flow.fallbackHint,
            turnId: resultTurnId,
          },
        ]);
      }
      setThinking(false);
    }, ASSISTANT_FOLLOWUP_MS);
  }

  sendRef.current = send;

  useEffect(() => {
    if (thinking) stopVoice();
  }, [thinking, stopVoice]);

  function rewindTo(messageId: string) {
    if (thinking || !activeScenario) return;
    const index = messages.findIndex((m) => m.id === messageId);
    if (index < 0 || messages[index]?.role !== 'user') return;

    const hasReply = messages[index + 1]?.role === 'assistant';
    const end = hasReply ? index + 1 : index;
    if (end === messages.length - 1) return;

    if (thinkTimer.current) window.clearTimeout(thinkTimer.current);
    const keep = messages.slice(0, end + 1);
    const restoreTurn = keep[end]!.turnId;
    const path: string[] = [];
    for (const m of keep) {
      if (m.role === 'assistant' && path[path.length - 1] !== m.turnId) {
        path.push(m.turnId);
      }
    }
    if (path.length === 0) path.push(restoreTurn);
    turnPathRef.current = path;
    upsertRecentAssistantChat({
      scenarioId: activeScenario,
      entryQuery,
      turnPath: path,
    });
    setMessages(keep);
    setTurnId(restoreTurn);
    setThinking(false);
    setInitialThinking(false);
    setDraft('');
  }

  if (!scenarioId || !flow || !turn) {
    return (
      <div className="kb-page">
        <EmptyState
          title="Сценарий не запущен"
          description="С главной задайте демо-запрос: Инновационная столица, инициатива RnD, служебная записка или итоги последнего стендапа."
        />
        <Button color="primary" variant="contained" onClick={() => navigate('/')}>
          На главную
        </Button>
      </div>
    );
  }

  const hints = !thinking ? turn.followUpHints : undefined;

  function renderArtifactsBody(docs: Document[], updating: boolean) {
    if (docs.length === 0) {
      return (
        <Text as="p" variant="body-sm" color="secondary">
          Нет доступных файлов для этой роли
        </Text>
      );
    }
    return (
      <div
        className={`kb-assistant__artifacts-list kb-assistant__artifacts-list--${artifactsView}${updating ? ' is-updating' : ''}`}
      >
        {artifactsView === 'list'
          ? docs.map((doc) => (
              <DocumentFileCard key={doc.id} doc={doc} previewQueue={docs} />
            ))
          : docs.map((doc) => (
              <DocumentTile key={doc.id} doc={doc} size="md" previewQueue={docs} />
            ))}
      </div>
    );
  }

  function renderArtifactsBlock(opts: {
    docs: Document[];
    updating?: boolean;
    loading?: boolean;
    inline?: boolean;
  }) {
    const { docs, updating = false, loading = false, inline = false } = opts;
    return (
      <div
        className={`kb-assistant__artifacts${inline ? ' kb-assistant__artifacts--inline' : ''}`}
        aria-label="Артефакты запроса"
      >
        <div className="kb-assistant__artifacts-head">
          <Text as="h2" variant="subtitle-md-bold">
            {loading ? 'Ищем…' : `Найдено ${filesCountLabel(docs.length)}`}
          </Text>
          <ViewModeToggle value={artifactsView} onChange={setArtifactsView} />
        </div>
        {loading ? <ArtifactSkeleton /> : renderArtifactsBody(docs, updating)}
      </div>
    );
  }

  const onResizePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!layoutRef.current) return;
    e.preventDefault();
    resizeRef.current = { startX: e.clientX, startRatio: chatRatio };
    setResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [chatRatio]);

  const onResizePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const start = resizeRef.current;
    const layout = layoutRef.current;
    if (!start || !layout) return;
    const width = layout.getBoundingClientRect().width;
    if (width <= 0) return;
    const next = start.startRatio + (e.clientX - start.startX) / width;
    applyChatRatio(next);
  }, [applyChatRatio]);

  const onResizePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    resizeRef.current = null;
    setResizing(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  return (
    <div
      ref={layoutRef}
      className={[
        'kb-assistant',
        entered ? 'is-entered' : '',
        resizing ? 'is-resizing' : '',
        stacked ? 'kb-assistant--stacked' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          '--kb-assistant-chat': `${(chatRatio * 100).toFixed(2)}%`,
        } as React.CSSProperties
      }
    >
      <section className="kb-assistant__chat glass-panel" aria-label="Чат">
        <div className="kb-assistant__chat-head">
          <Text as="h1" variant="subtitle-md-bold">
            Умный помощник Ядра
          </Text>
          <Text as="p" variant="body-sm" color="secondary">
            {stacked
              ? 'Уточняйте запрос в чате — выдача обновится ниже'
              : 'Уточняйте запрос в чате — выдача справа обновится'}
          </Text>
        </div>

        <div className="kb-assistant__thread" ref={threadRef}>
          {messages.map((m, index) => {
            if (m.role === 'user') {
              const hasReply = messages[index + 1]?.role === 'assistant';
              const checkpointEnd = hasReply ? index + 1 : index;
              const canRewind = !thinking && checkpointEnd < messages.length - 1;

              return (
                <div key={m.id} className="kb-chat__msg kb-chat__msg--user">
                  {canRewind ? (
                    <Tooltip content="Вернуться к этому шагу" position="left">
                      <IconButton
                        className="kb-chat__rewind"
                        aria-label="Вернуться к этому шагу"
                        size="xsm"
                        variant="text"
                        color="neutral"
                        icon={
                          <Icon
                            path="Arrows & Directions/ArrowArcLeft"
                            size={16}
                            weight="regular"
                          />
                        }
                        type="button"
                        onClick={() => rewindTo(m.id)}
                      />
                    </Tooltip>
                  ) : null}
                  <div className="kb-chat__bubble kb-chat__bubble--user">
                    <Text as="p" variant="body-md" className="kb-chat__bubble-text">
                      {m.text}
                    </Text>
                  </div>
                </div>
              );
            }

            const showInlineArtifacts =
              stacked && index === lastAssistantIndex && !initialThinking;

            return (
              <div key={m.id} className="kb-chat__msg">
                <div className="kb-chat__bubble">
                  <Text as="p" variant="body-md" className="kb-chat__bubble-text">
                    {m.text}
                  </Text>
                </div>
                <div className="kb-chat__feedback" role="group" aria-label="Оценка ответа">
                  <Tooltip content="Нравится" position="bottom">
                    <IconButton
                      aria-label="Нравится"
                      size="xsm"
                      variant="text"
                      color="neutral"
                      icon={<Icon path="Communication/ThumbsUp" size={16} weight="regular" />}
                      type="button"
                    />
                  </Tooltip>
                  <Tooltip content="Не нравится" position="bottom">
                    <IconButton
                      aria-label="Не нравится"
                      size="xsm"
                      variant="text"
                      color="neutral"
                      icon={<Icon path="Communication/ThumbsDown" size={16} weight="regular" />}
                      type="button"
                    />
                  </Tooltip>
                  <Tooltip content="Оставить обратную связь" position="bottom">
                    <IconButton
                      aria-label="Оставить обратную связь"
                      size="xsm"
                      variant="text"
                      color="neutral"
                      icon={<Icon path="Maps & Travel/Flag" size={16} weight="regular" />}
                      type="button"
                    />
                  </Tooltip>
                </div>
                {showInlineArtifacts
                  ? renderArtifactsBlock({
                      docs: artifacts,
                      updating: thinking,
                      inline: true,
                    })
                  : null}
              </div>
            );
          })}
          {thinking ? (
            <div className="kb-chat__bubble kb-chat__bubble--typing" aria-live="polite">
              <Text as="p" variant="body-sm" color="secondary" className="kb-chat__bubble-text">
                Думаю…
              </Text>
            </div>
          ) : null}
          {stacked && initialThinking
            ? renderArtifactsBlock({ docs: [], loading: true, inline: true })
            : null}
        </div>

        {hints && hints.length > 0 ? (
          <div className="kb-assistant__hints" aria-label="Подсказки">
            {hints.map((hint) => (
              <Chip
                key={hint}
                size={stacked ? 'sm' : 'md'}
                label={hint}
                variant="tonal"
                color="primary"
                onClick={() => send(hint)}
              />
            ))}
          </div>
        ) : null}

        <form
          className="kb-assistant__composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <Input
            size="md"
            fullWidth
            type={stacked ? 'search' : 'text'}
            enterKeyHint={stacked ? 'send' : undefined}
            placeholder={listening ? 'Слушаю…' : 'Уточните запрос…'}
            value={draft}
            disabled={thinking}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Сообщение помощнику"
            endIcon={
              <span className="kb-assistant__composer-end">
                <IconButton
                  className={[
                    'kb-assistant__mic',
                    'kb-mic',
                    listening ? 'kb-mic--listening' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={listening ? 'Остановить голосовой ввод' : 'Голосовой ввод'}
                  aria-pressed={listening}
                  size="md"
                  color={listening ? 'primary' : 'neutral'}
                  variant="text"
                  disabled={thinking}
                  icon={<Icon path="Media/Microphone" size={20} weight="regular" />}
                  type="button"
                  onClick={toggleVoice}
                />
                <IconButton
                  className="kb-assistant__send"
                  aria-label="Отправить"
                  size="md"
                  color="primary"
                  variant="contained"
                  disabled={thinking || !draft.trim()}
                  icon={<Icon path="Arrows & Directions/ArrowUp" size={18} weight="bold" />}
                  type="submit"
                />
              </span>
            }
          />
        </form>
      </section>

      {!stacked ? (
        <>
          <button
            type="button"
            className="kb-assistant__splitter"
            aria-label="Изменить ширину чата"
            title="Потяните, чтобы изменить ширину"
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
            onDoubleClick={() => applyChatRatio(CHAT_RATIO_DEFAULT)}
          >
            <span className="kb-assistant__splitter-grip">
              <GripVerticalIcon />
            </span>
          </button>

          <aside className="kb-assistant__artifacts kb-assistant__artifacts--panel">
            {renderArtifactsBlock({
              docs: artifacts,
              updating: thinking && !initialThinking,
              loading: initialThinking,
            })}
          </aside>
        </>
      ) : null}
    </div>
  );
}
