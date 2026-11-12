import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, IconButton, Text, TextArea } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { DocumentTile } from '@/components/docs/DocumentTile';
import { ViewModeToggle, type ViewMode } from '@/components/docs/ViewModeToggle';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { getDocument } from '@/lib/corpus';
import { DEMO_TODAY, toDayKey } from '@/lib/demoTime';
import { formatMeetingWhen } from '@/lib/format';
import { docsForDay, priorContextForDay } from '@/lib/meetingsBriefing';
import { getPerson } from '@/mocks/meetings';
import { useApp } from '@/state/AppContext';
import type { Document, Meeting, RoleId } from '@/types/knowledge';

const PLACEHOLDER =
  'Уточните запрос, например: Найди файлы с прошлой встречи';
const DEFAULT_JOIN_URL = 'https://telemost.yandex.ru/j/82108848514915';

type Props = {
  meeting: Meeting;
  allMeetings: Meeting[];
  onClose: () => void;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  documents?: Document[];
};

type AssistantReply = { text: string; documents?: Document[] };

function durationLabel(startIso: string, endIso: string): string {
  const mins = Math.round(
    (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000,
  );
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

function resolveMeetingDocs(m: Meeting, role: RoleId): Document[] {
  const fromDay = docsForDay([m], role);
  if (fromDay.length) return fromDay;
  return (m.attachmentIds ?? [])
    .map((id) => getDocument(id))
    .filter((d): d is Document => Boolean(d));
}

function assistantReply(
  query: string,
  meeting: Meeting,
  allMeetings: Meeting[],
  role: RoleId,
): AssistantReply {
  const q = query.toLowerCase();
  const docs = resolveMeetingDocs(meeting, role);
  const prior = priorContextForDay(allMeetings, [meeting], meeting.startsAt.slice(0, 10));

  if (/файл|документ|вложен|материал/.test(q)) {
    if (/прошл|предыдущ/.test(q) && prior[0]) {
      const p = prior[0].meeting;
      const priorDocs = resolveMeetingDocs(p, role);
      return priorDocs.length
        ? {
            text: `На прошлой связанной встрече «${p.title}» были материалы:`,
            documents: priorDocs,
          }
        : {
            text: `Связанная встреча «${p.title}» есть, но вложений к ней не нашёл. Саммари: ${p.summary.slice(0, 120)}…`,
          };
    }
    if (docs.length) {
      return {
        text: `К «${meeting.title}» подобраны файлы:`,
        documents: docs,
      };
    }
    return {
      text: 'Вложений к этой встрече пока нет. Могу поискать по названию или участникам в Базе знаний.',
    };
  }

  if (/итог|саммари|решен|action|задач/.test(q)) {
    const decisions = meeting.decisions.slice(0, 3).map((d) => `• ${d}`).join('\n');
    const actions = meeting.actionItems.slice(0, 3).map((a) => `• ${a}`).join('\n');
    return {
      text: `Кратко по встрече:\n${meeting.summary}\n\nРешения:\n${decisions || '—'}\n\nAction items:\n${actions || '—'}`,
    };
  }

  if (/участник|кто|присутств/.test(q)) {
    const names = meeting.participants
      .map((id) => getPerson(id)?.name)
      .filter(Boolean)
      .join(', ');
    return { text: `Участники: ${names || 'не указаны'}.` };
  }

  return {
    text: 'Могу найти файлы к этой или прошлой связанной встрече, кратко пересказать итоги или список участников. Например: «Найди файлы с прошлой встречи».',
  };
}

export function MeetingDetailModal({ meeting, allMeetings, onClose }: Props) {
  const { role } = useApp();
  const navigate = useNavigate();
  const titleId = useId();
  const isPast = toDayKey(meeting.startsAt) < DEMO_TODAY;
  const composerRef = useRef<HTMLFormElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLUListElement>(null);
  const latestReplyRef = useRef<HTMLLIElement>(null);
  const [draft, setDraft] = useState('');
  const [filesView, setFilesView] = useState<ViewMode>('list');
  const [composerMinRows, setComposerMinRows] = useState(1);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Могу подсказать по этой встрече: файлы, итоги, контекст прошлых. Спросите, например: «Найди файлы с прошлой встречи».',
    },
  ]);

  const people = meeting.participants
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const attachments = (meeting.attachmentIds ?? [])
    .map((id) => getDocument(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  const docs = docsForDay([meeting], role);
  const fileList = attachments.length ? attachments : docs;
  const joinUrl = meeting.joinUrl ?? DEFAULT_JOIN_URL;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Могу подсказать по этой встрече: файлы, итоги, контекст прошлых. Спросите, например: «Найди файлы с прошлой встречи».',
      },
    ]);
    setDraft('');
    setFilesView('list');
  }, [meeting.id]);

  useLayoutEffect(() => {
    const el = composerRef.current?.querySelector<HTMLTextAreaElement>('textarea');
    if (!el) return;

    const measurePlaceholderRows = () => {
      let next = 1;
      if (!draft.trim() && window.matchMedia('(max-width: 599px)').matches) {
        const style = getComputedStyle(el);
        const mirror = document.createElement('span');
        mirror.textContent = PLACEHOLDER;
        mirror.style.cssText = [
          'position:absolute',
          'visibility:hidden',
          'white-space:nowrap',
          `font:${style.font}`,
          `letter-spacing:${style.letterSpacing}`,
        ].join(';');
        document.body.appendChild(mirror);
        const textW = mirror.getBoundingClientRect().width;
        mirror.remove();
        const padX =
          (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
        const avail = Math.max(0, el.clientWidth - padX - 48);
        next = textW > avail ? 2 : 1;
      }
      setComposerMinRows((prev) => (prev === next ? prev : next));
    };

    measurePlaceholderRows();
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, el.clientHeight), 160)}px`;

    const onResize = () => {
      measurePlaceholderRows();
      el.style.height = 'auto';
      el.style.height = `${Math.min(Math.max(el.scrollHeight, el.clientHeight), 160)}px`;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draft, composerMinRows]);

  useLayoutEffect(() => {
    if (messages.length <= 1) return;
    const reply = latestReplyRef.current;
    const list = messagesRef.current;
    const body = bodyRef.current;
    if (list) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }
    if (reply) {
      reply.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (body && reply) {
      const bodyRect = body.getBoundingClientRect();
      const replyRect = reply.getBoundingClientRect();
      if (replyRect.bottom > bodyRect.bottom - 24 || replyRect.top < bodyRect.top) {
        body.scrollTo({
          top: body.scrollTop + (replyRect.top - bodyRect.top) - 12,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const answer = assistantReply(text, meeting, allMeetings, role);
    const userMsg: ChatMsg = { id: `u-${Date.now()}`, role: 'user', text };
    const reply: ChatMsg = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      text: answer.text,
      documents: answer.documents,
    };
    setMessages((prev) => [...prev, userMsg, reply]);
    setDraft('');
  }

  return createPortal(
    <div className="kb-meet-modal-root" role="presentation" onClick={onClose}>
      <aside
        className="kb-meet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="kb-meet-modal__header">
          <div className="kb-meet-modal__header-text">
            <Text as="p" variant="label-sm-bold" color="secondary">
              Карточка встречи
            </Text>
            <Text as="h2" id={titleId} variant="heading-h4" className="kb-meet-modal__title">
              {meeting.title}
            </Text>
            {isPast ? (
              <Button
                type="button"
                size="sm"
                variant="contained"
                color="primary"
                className="kb-meet-modal__details-btn"
                startIcon={
                  <Icon path="Arrows & Directions/ArrowSquareOut" size={16} weight="regular" />
                }
                onClick={() => {
                  onClose();
                  navigate(`/meeting/${meeting.id}`);
                }}
              >
                Показать детали
              </Button>
            ) : null}
            <span className="kb-meet-modal__status">
              <span className="kb-meet-modal__status-dot" aria-hidden />
              Запланирована
            </span>
          </div>
          <IconButton
            type="button"
            size="md"
            variant="text"
            color="neutral"
            aria-label="Закрыть"
            icon={<Icon path="Math & Finances/X" size={18} weight="regular" />}
            onClick={onClose}
          />
        </header>

        <div className="kb-meet-modal__body" ref={bodyRef}>
          <div className="kb-meet-modal__summary-block">
            <Text as="p" variant="label-sm-bold" className="kb-meet-modal__block-title">
              Саммари
            </Text>
            <Text as="p" variant="body-md" className="kb-meet-modal__summary">
              {meeting.summary}
            </Text>
          </div>

          <section className="kb-meet-modal__section">
            <Text as="h3" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
              Участники
            </Text>
            <ul className="kb-meet-modal__people">
              {people.map((p) => (
                <li key={p.id} className="kb-meet-modal__person">
                  <PersonAvatar person={p} size="sm" />
                  <span className="kb-meet-modal__person-text">
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

          <section className="kb-meet-modal__meta">
            <div className="kb-meet-modal__meta-item">
              <Text as="p" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
                Когда
              </Text>
              <Text as="p" variant="body-md">
                {formatMeetingWhen(meeting.startsAt, meeting.endsAt)} ·{' '}
                {durationLabel(meeting.startsAt, meeting.endsAt)}
              </Text>
            </div>
            <div className="kb-meet-modal__meta-item">
              <Text as="p" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
                Формат
              </Text>
              <Text as="p" variant="body-md">
                Online
              </Text>
            </div>
            <div className="kb-meet-modal__meta-item">
              <Text as="p" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
                Ссылка на встречу
              </Text>
              <a
                className="kb-meet-modal__join-link"
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {joinUrl.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </section>

          <section className="kb-meet-modal__section">
            <div className="kb-meet-modal__section-head">
              <Text as="h3" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
                Вложения
              </Text>
              {fileList.length > 0 ? (
                <ViewModeToggle value={filesView} onChange={setFilesView} />
              ) : null}
            </div>
            {fileList.length === 0 ? (
              <Text as="p" variant="body-sm" color="secondary">
                Вложений нет
              </Text>
            ) : filesView === 'list' ? (
              <ul className="kb-meet-modal__files">
                {fileList.map((doc) => (
                  <li key={doc.id}>
                    <DocumentFileCard doc={doc} previewQueue={fileList} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="kb-meet-modal__files-grid kb-file-preview-grid">
                {fileList.map((doc) => (
                  <DocumentTile key={doc.id} doc={doc} size="sm" previewQueue={fileList} />
                ))}
              </div>
            )}
          </section>

          <section className="kb-meet-modal__chat" aria-label="Помощник по встрече">
            <Text as="h3" variant="subtitle-sm-bold" className="kb-meet-modal__block-title">
              Помощник
            </Text>
            <ul className="kb-meet-modal__messages" ref={messagesRef}>
              {messages.map((m, index) => {
                const isLatest = index === messages.length - 1 && m.role === 'assistant';
                return (
                  <li
                    key={m.id}
                    ref={isLatest ? latestReplyRef : undefined}
                    className={`kb-meet-modal__msg kb-meet-modal__msg--${m.role}`}
                  >
                    <div className="kb-meet-modal__msg-bubble">
                      {m.text.split('\n').map((line, i) => (
                        <span key={`${m.id}-${i}`} className="kb-meet-modal__msg-line">
                          {line}
                        </span>
                      ))}
                    </div>
                    {m.documents && m.documents.length > 0 ? (
                      <div className="kb-meet-modal__msg-files" aria-label="Найденные файлы">
                        {m.documents.map((doc) => (
                          <DocumentFileCard
                            key={doc.id}
                            doc={doc}
                            previewQueue={m.documents}
                          />
                        ))}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <form
          ref={composerRef}
          className="kb-meet-modal__composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <TextArea
            className="kb-meet-modal__field"
            size="md"
            fullWidth
            rows={composerMinRows}
            resizable={false}
            enterKeyHint="send"
            placeholder={PLACEHOLDER}
            aria-label="Сообщение помощнику"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            endIcon={
              <IconButton
                className="kb-meet-modal__send"
                type="submit"
                size="md"
                variant="contained"
                color="primary"
                aria-label="Отправить"
                disabled={!draft.trim()}
                icon={<Icon path="Arrows & Directions/ArrowUp" size={18} weight="bold" />}
              />
            }
          />
        </form>
      </aside>
    </div>,
    document.body,
  );
}
