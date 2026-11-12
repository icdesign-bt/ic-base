import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Chip,
  EmptyState,
  Icon,
  IconButton,
  Input,
  Text,
  TextArea,
  Tooltip,
} from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { DocumentTile } from '@/components/docs/DocumentTile';
import { ViewModeToggle, type ViewMode } from '@/components/docs/ViewModeToggle';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { canView } from '@/lib/acl';
import { CURRENT_USER } from '@/lib/currentUser';
import { getDocument, listMeetingsForRole } from '@/lib/corpus';
import { formatMeetingWhen, formatOpenedAt } from '@/lib/format';
import { getPerson } from '@/mocks/meetings';
import { useApp } from '@/state/AppContext';
import type { Document, Meeting, MeetingComment } from '@/types/knowledge';

type TabId = 'summary' | 'transcript' | 'comments';

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const ASSISTANT_WELCOME =
  'Могу уточнить итоги, участников или файлы этой встречи. Например: «Какие решения приняли?»';

const ASSISTANT_HINTS = [
  'Какие решения приняли?',
  'Кто участвовал?',
  'Какие файлы приложены?',
];

function durationLabel(startIso: string, endIso: string): string {
  const mins = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000,
  );
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

function assistantReply(query: string, meeting: Meeting): string {
  const q = query.toLowerCase();
  if (/файл|документ|вложен|материал/.test(q)) {
    const n = meeting.attachmentIds?.length ?? 0;
    return n
      ? `К встрече приложено ${n} файл(ов) — список в левой колонке.`
      : 'Вложений к этой встрече пока нет.';
  }
  if (/итог|саммари|решен|action|задач|повест/.test(q)) {
    const decisions = meeting.decisions.slice(0, 3).map((d) => `• ${d}`).join('\n');
    const actions = meeting.actionItems.slice(0, 3).map((a) => `• ${a}`).join('\n');
    return `Кратко по встрече:\n${meeting.summary}\n\nРешения:\n${decisions || '—'}\n\nAction items:\n${actions || '—'}`;
  }
  if (/участник|кто|организ|присутств/.test(q)) {
    const organizer = getPerson(meeting.organizerId)?.name ?? '—';
    const names = meeting.participants
      .map((id) => getPerson(id)?.name)
      .filter(Boolean)
      .join(', ');
    return `Организатор: ${organizer}. Участники: ${names || 'не указаны'}.`;
  }
  return `По «${meeting.title}»: ${meeting.summary.slice(0, 180)}${meeting.summary.length > 180 ? '…' : ''}\n\nСпросите про итоги, участников или файлы.`;
}

export function MeetingPage() {
  const navigate = useNavigate();
  const { meetingId = '' } = useParams();
  const { role } = useApp();
  const meeting = listMeetingsForRole(role).find((m) => m.id === meetingId);

  const [tab, setTab] = useState<TabId>('summary');
  const [filesView, setFilesView] = useState<ViewMode>('list');
  const [comments, setComments] = useState<MeetingComment[]>([]);
  const [commentDraft, setCommentDraft] = useState('');
  const [shareHint, setShareHint] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState('');
  const [assistantMsgs, setAssistantMsgs] = useState<ChatMsg[]>([
    { id: 'welcome', role: 'assistant', text: ASSISTANT_WELCOME },
  ]);

  useEffect(() => {
    if (!meeting) return;
    setTab('summary');
    setFilesView('list');
    setComments(meeting.comments);
    setCommentDraft('');
    setAssistantDraft('');
    setAssistantMsgs([{ id: 'welcome', role: 'assistant', text: ASSISTANT_WELCOME }]);
  }, [meeting?.id]);

  const people = useMemo(
    () =>
      (meeting?.participants ?? [])
        .map((id) => getPerson(id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p)),
    [meeting?.participants],
  );

  const attachments = useMemo(() => {
    if (!meeting) return [] as Document[];
    return (meeting.attachmentIds ?? [])
      .map((id) => getDocument(id))
      .filter((d): d is Document => Boolean(d));
  }, [meeting]);

  if (!meeting || !canView(meeting.acl, role)) {
    return (
      <div className="kb-page">
        <EmptyState title="Встреча недоступна" description="Нет доступа или неверный адрес." />
        <Link to="/meetings" className="kb-text-link">
          Ко всем встречам
        </Link>
      </div>
    );
  }

  const organizer = getPerson(meeting.organizerId);
  const knowledgeDoc = meeting.knowledgeDocId
    ? getDocument(meeting.knowledgeDocId)
    : undefined;

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareHint(true);
      window.setTimeout(() => setShareHint(false), 2000);
    } catch {
      window.alert('Не удалось скопировать ссылку');
    }
  }

  function downloadPdf() {
    window.alert('Мок: скачивание PDF итогов встречи…');
  }

  function createContinuation() {
    window.alert(
      `Мок: создаём новую встречу «Продолжение: ${meeting!.title}» с теми же участниками.`,
    );
    navigate('/meetings');
  }

  function sendAssistant(raw?: string) {
    const text = (raw ?? assistantDraft).trim();
    if (!text) return;
    const reply = assistantReply(text, meeting!);
    setAssistantMsgs((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text },
      { id: `a-${Date.now()}`, role: 'assistant', text: reply },
    ]);
    setAssistantDraft('');
  }

  function addComment() {
    const text = commentDraft.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      {
        id: `cmt-local-${Date.now()}`,
        authorId: CURRENT_USER.id,
        createdAt: new Date().toISOString(),
        text,
      },
    ]);
    setCommentDraft('');
  }

  return (
    <div className="kb-page kb-meeting-page">
      <Link to="/meetings" className="kb-text-link">
        ← Встречи
      </Link>

      <header className="kb-meeting-page__header">
        <div className="kb-meeting-page__header-text">
          <Text as="h1" variant="heading-h4" className="kb-meeting-page__title">
            {meeting.title}
          </Text>
          <Text as="p" variant="body-sm" color="secondary">
            {formatMeetingWhen(meeting.startsAt, meeting.endsAt)} ·{' '}
            {durationLabel(meeting.startsAt, meeting.endsAt)}
          </Text>
        </div>
        <div className="kb-meeting-page__actions">
          <Button
            type="button"
            size="md"
            variant="outlined"
            color="neutral"
            startIcon={<Icon path="Communication/ShareNetwork" size={16} weight="regular" />}
            onClick={() => void shareLink()}
          >
            {shareHint ? 'Скопировано' : 'Поделиться'}
          </Button>
          <Button
            type="button"
            size="md"
            variant="tonal"
            color="primary"
            startIcon={<Icon path="System Devices/DownloadSimple" size={16} weight="regular" />}
            onClick={downloadPdf}
          >
            Скачать PDF встречи
          </Button>
          <Button
            type="button"
            size="md"
            variant="contained"
            color="primary"
            startIcon={<Icon path="Time/CalendarBlank" size={16} weight="regular" />}
            onClick={createContinuation}
          >
            Создать новую встречу
          </Button>
        </div>
      </header>

      <div className="kb-meeting-page__grid">
        <aside className="kb-meeting-page__aside" aria-label="Метаданные встречи">
          <section className="kb-meeting-page__card glass-panel">
            <Text as="h2" variant="subtitle-sm-bold" className="kb-meeting-page__card-title">
              Организатор
            </Text>
            {organizer ? (
              <div className="kb-meeting-page__person-row">
                <PersonAvatar person={organizer} size="sm" />
                <span className="kb-meeting-page__person-text">
                  <Text as="span" variant="label-md-bold">
                    {organizer.name}
                  </Text>
                  <Text as="span" variant="body-sm" color="secondary">
                    {organizer.roleLabel}
                  </Text>
                </span>
              </div>
            ) : (
              <Text as="p" variant="body-sm" color="secondary">
                Не указан
              </Text>
            )}
          </section>

          <section className="kb-meeting-page__card glass-panel">
            <Text as="h2" variant="subtitle-sm-bold" className="kb-meeting-page__card-title">
              Участники
            </Text>
            <ul className="kb-meeting-page__people">
              {people.map((p) => (
                <li key={p.id} className="kb-meeting-page__person-row">
                  <PersonAvatar person={p} size="sm" />
                  <span className="kb-meeting-page__person-text">
                    <Text as="span" variant="label-md-bold">
                      {p.name}
                    </Text>
                    <Text as="span" variant="body-sm" color="secondary">
                      {p.roleLabel}
                    </Text>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="kb-meeting-page__card glass-panel">
            <Text as="h2" variant="subtitle-sm-bold" className="kb-meeting-page__card-title">
              Повестка
            </Text>
            {meeting.agenda.length ? (
              <ol className="kb-meeting-page__agenda">
                {meeting.agenda.map((item) => (
                  <li key={item}>
                    <Text as="span" variant="body-md">
                      {item}
                    </Text>
                  </li>
                ))}
              </ol>
            ) : (
              <Text as="p" variant="body-sm" color="secondary">
                Повестка не задана
              </Text>
            )}
          </section>

          {meeting.recordingUrl ? (
            <section className="kb-meeting-page__card glass-panel">
              <Text as="h2" variant="subtitle-sm-bold" className="kb-meeting-page__card-title">
                Видеозапись
              </Text>
              <div className="kb-meeting-page__video" role="img" aria-label="Запись встречи">
                <button
                  type="button"
                  className="kb-meeting-page__video-play"
                  aria-label="Воспроизвести запись"
                  onClick={() => window.alert('Мок: воспроизведение записи встречи')}
                >
                  <Icon path="Media/Play" size={28} weight="fill" />
                </button>
                <div className="kb-meeting-page__video-meta">
                  <Text as="span" variant="label-md-bold">
                    Запись встречи
                  </Text>
                  <Text as="span" variant="body-sm" color="secondary">
                    {durationLabel(meeting.startsAt, meeting.endsAt)}
                  </Text>
                </div>
              </div>
            </section>
          ) : null}
        </aside>

        <div className="kb-meeting-page__main">
          <section className="kb-meeting-page__content glass-panel">
            <div className="kb-meeting-page__tabs" role="tablist" aria-label="Разделы встречи">
              {(
                [
                  ['summary', 'Саммари'],
                  ['transcript', 'Транскрипт'],
                  ['comments', `Комментарии${comments.length ? ` (${comments.length})` : ''}`],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={
                    tab === id
                      ? 'kb-meeting-page__tab kb-meeting-page__tab--active'
                      : 'kb-meeting-page__tab'
                  }
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="kb-meeting-page__panel" role="tabpanel">
              {tab === 'summary' ? (
                <div className="kb-meeting-page__summary">
                  <Text as="p" variant="body-md">
                    {meeting.summary}
                  </Text>

                  <div className="kb-meeting-page__summary-block">
                    <Text as="h3" variant="subtitle-sm-bold">
                      Решения
                    </Text>
                    <ul>
                      {meeting.decisions.map((d) => (
                        <li key={d}>
                          <Text as="span" variant="body-md">
                            {d}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="kb-meeting-page__summary-block">
                    <Text as="h3" variant="subtitle-sm-bold">
                      Action items
                    </Text>
                    <ul>
                      {meeting.actionItems.map((a) => (
                        <li key={a}>
                          <Text as="span" variant="body-md">
                            {a}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {knowledgeDoc ? (
                    <div className="kb-meeting-page__kb-card">
                      <Text as="h3" variant="subtitle-sm-bold">
                        Карточка в Базе знаний
                      </Text>
                      <DocumentFileCard doc={knowledgeDoc} />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {tab === 'transcript' ? (
                <pre className="kb-meeting-page__transcript">{meeting.transcript}</pre>
              ) : null}

              {tab === 'comments' ? (
                <div className="kb-meeting-page__comments">
                  {comments.length === 0 ? (
                    <Text as="p" variant="body-sm" color="secondary">
                      Комментариев пока нет — напишите первый.
                    </Text>
                  ) : (
                    <ul className="kb-meeting-page__comment-list">
                      {comments.map((c) => {
                        const author = getPerson(c.authorId);
                        return (
                          <li key={c.id} className="kb-meeting-page__comment">
                            {author ? <PersonAvatar person={author} size="sm" /> : null}
                            <div className="kb-meeting-page__comment-body">
                              <div className="kb-meeting-page__comment-meta">
                                <Text as="span" variant="label-md-bold">
                                  {author?.name ?? 'Участник'}
                                </Text>
                                <Text as="span" variant="body-sm" color="secondary">
                                  {formatOpenedAt(c.createdAt)}
                                </Text>
                              </div>
                              <Text as="p" variant="body-md">
                                {c.text}
                              </Text>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <form
                    className="kb-meeting-page__comment-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      addComment();
                    }}
                  >
                    <TextArea
                      size="md"
                      fullWidth
                      rows={2}
                      resizable={false}
                      placeholder="Оставить комментарий…"
                      aria-label="Комментарий к встрече"
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                    />
                    <Button
                      type="submit"
                      size="md"
                      variant="contained"
                      color="primary"
                      disabled={!commentDraft.trim()}
                    >
                      Отправить
                    </Button>
                  </form>
                </div>
              ) : null}
            </div>
          </section>

          <section className="kb-meeting-page__card glass-panel kb-meeting-page__files-card">
            <div className="kb-meeting-page__files-head">
              <Text as="h2" variant="subtitle-sm-bold" className="kb-meeting-page__card-title">
                Файлы
              </Text>
              {attachments.length > 0 ? (
                <ViewModeToggle value={filesView} onChange={setFilesView} />
              ) : null}
            </div>
            {attachments.length === 0 ? (
              <Text as="p" variant="body-sm" color="secondary">
                Вложений нет
              </Text>
            ) : filesView === 'list' ? (
              <ul className="kb-meeting-page__files">
                {attachments.map((doc) => (
                  <li key={doc.id}>
                    <DocumentFileCard doc={doc} previewQueue={attachments} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="kb-meeting-page__files-grid kb-file-preview-grid">
                {attachments.map((doc) => (
                  <DocumentTile key={doc.id} doc={doc} size="sm" previewQueue={attachments} />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="kb-meeting-page__assistant" aria-label="Умный помощник">
          <section className="kb-assistant__chat glass-panel">
            <div className="kb-assistant__chat-head">
              <Text as="h2" variant="subtitle-md-bold">
                Умный помощник Ядра
              </Text>
              <Text as="p" variant="body-sm" color="secondary">
                Уточняйте запрос в чате по этой встрече
              </Text>
            </div>

            <div className="kb-assistant__thread">
              {assistantMsgs.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="kb-chat__msg kb-chat__msg--user">
                    <div className="kb-chat__bubble kb-chat__bubble--user">
                      <Text as="p" variant="body-md" className="kb-chat__bubble-text">
                        {m.text}
                      </Text>
                    </div>
                  </div>
                ) : (
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
                          icon={
                            <Icon path="Communication/ThumbsDown" size={16} weight="regular" />
                          }
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
                  </div>
                ),
              )}
            </div>

            {assistantMsgs.length <= 1 ? (
              <div className="kb-assistant__hints" aria-label="Подсказки">
                {ASSISTANT_HINTS.map((hint) => (
                  <Chip
                    key={hint}
                    size="md"
                    label={hint}
                    variant="tonal"
                    color="primary"
                    onClick={() => sendAssistant(hint)}
                  />
                ))}
              </div>
            ) : null}

            <form
              className="kb-assistant__composer"
              onSubmit={(e) => {
                e.preventDefault();
                sendAssistant();
              }}
            >
              <Input
                size="md"
                fullWidth
                placeholder="Уточните запрос…"
                aria-label="Сообщение помощнику"
                value={assistantDraft}
                onChange={(e) => setAssistantDraft(e.target.value)}
                endIcon={
                  <span className="kb-assistant__composer-end">
                    <IconButton
                      className="kb-assistant__mic"
                      aria-label="Голосовой ввод"
                      size="md"
                      color="neutral"
                      variant="text"
                      icon={<Icon path="Media/Microphone" size={20} weight="regular" />}
                      type="button"
                      onClick={() => window.alert('Мок: голосовой ввод')}
                    />
                    <IconButton
                      className="kb-assistant__send"
                      aria-label="Отправить"
                      size="md"
                      color="primary"
                      variant="contained"
                      disabled={!assistantDraft.trim()}
                      icon={<Icon path="Arrows & Directions/ArrowUp" size={18} weight="bold" />}
                      type="submit"
                    />
                  </span>
                }
              />
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
