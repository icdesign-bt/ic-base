import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, IconButton, Text } from 'ic-kit';
import { EntityChip } from '@/components/docs/EntityChip';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { getDocument, getFolder } from '@/lib/corpus';
import { formatMeetingWhen } from '@/lib/format';
import { MOCK_NOTIFICATIONS, type KbNotification } from '@/mocks/notifications';
import { getPerson } from '@/mocks/meetings';
import {
  clearAllNotifications,
  deleteNotification,
  ensureNotificationsSeeded,
  isNotificationUnread,
  listVisibleNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_CHANGED_EVENT,
} from '@/utils/notificationsStorage';

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3a5 5 0 0 0-5 5v2.2c0 .7-.3 1.4-.8 1.9L5 13.5V14h14v-.5l-1.2-1.4a2.5 2.5 0 0 1-.8-1.9V8a5 5 0 0 0-5-5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 17a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function NotificationRow({
  item,
  unread,
  onActivate,
  onDelete,
}: {
  item: KbNotification;
  unread: boolean;
  onActivate: (item: KbNotification) => void;
  onDelete: (id: string) => void;
}) {
  const doc =
    item.kind === 'favorite_file_updated' || item.kind === 'favorite_file_comment'
      ? getDocument(item.documentId)
      : undefined;
  const folder = item.kind === 'favorite_folder_files' ? getFolder(item.folderId) : undefined;
  const author = item.kind === 'favorite_file_comment' ? getPerson(item.authorId) : undefined;

  return (
    <article className={`kb-notif-row${unread ? ' kb-notif-row--unread' : ''}`}>
      <div className="kb-notif-row__head">
        <p className="kb-notif-title">{item.title}</p>
        <button
          type="button"
          className="kb-notif-row__delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(item.id);
          }}
        >
          Удалить
        </button>
        <time className="kb-notif-time" dateTime={item.createdAt}>
          {formatWhen(item.createdAt)}
        </time>
      </div>

      <button type="button" className="kb-notif-row__link" onClick={() => onActivate(item)}>
        {folder && item.kind === 'favorite_folder_files' ? (
          <EntityChip kind="folder" folder={folder} meta={item.body} />
        ) : null}

        {doc ? <EntityChip kind="file" doc={doc} /> : null}

        {item.kind === 'favorite_file_comment' && author ? (
          <div className="kb-notif-bubble">
            <span className="kb-notif-bubble__avatar">
              <PersonAvatar person={author} size="sm" />
            </span>
            <div className="kb-notif-bubble__body">
              <span className="kb-notif-bubble__author">{author.name}</span>
              <p className="kb-notif-bubble__text">{item.comment}</p>
            </div>
          </div>
        ) : null}

        {item.kind === 'meeting_mention' ? (
          <div className="kb-notif-meeting">
            <span className="kb-notif-meeting__icon" aria-hidden>
              <Icon path="Time/CalendarBlank" size={20} weight="regular" />
            </span>
            <div className="kb-notif-meeting__text">
              <span className="kb-notif-meeting__context">{item.taskContext}</span>
              <span className="kb-notif-meeting__title">{item.meetingTitle}</span>
              <span className="kb-notif-meeting__when">
                {formatMeetingWhen(item.meetingStartsAt, item.meetingEndsAt)}
              </span>
              <p className="kb-notif-meeting__summary">{item.summary}</p>
            </div>
          </div>
        ) : null}
      </button>
    </article>
  );
}

type Props = {
  onUnreadChange?: (count: number) => void;
  /** Вертикальный пункт меню с подписью. */
  layout?: 'toolbar' | 'menu';
};

export function NotificationsBell({ onUnreadChange, layout = 'toolbar' }: Props) {
  const navigate = useNavigate();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    ensureNotificationsSeeded();
  }, []);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const onExternal = () => refresh();
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, onExternal);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, onExternal);
  }, [refresh]);

  const items = useMemo(() => {
    void tick;
    return listVisibleNotifications(MOCK_NOTIFICATIONS)
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [tick]);

  const unreadCount = useMemo(() => {
    void tick;
    return items.filter((n) => isNotificationUnread(n.id)).length;
  }, [tick, items]);

  useEffect(() => {
    onUnreadChange?.(unreadCount);
  }, [unreadCount, onUnreadChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const activate = (item: KbNotification) => {
    if (isNotificationUnread(item.id)) {
      markNotificationRead(item.id);
      refresh();
    }
    setOpen(false);
    navigate(item.href);
  };

  const markAll = () => {
    markAllNotificationsRead();
    refresh();
  };

  const removeOne = (id: string) => {
    deleteNotification(id);
    refresh();
  };

  const clearAll = () => {
    clearAllNotifications();
    refresh();
  };

  const menu = layout === 'menu';
  const bellLabel = unreadCount > 0 ? `Уведомления: ${unreadCount} новых` : 'Уведомления';

  return (
    <>
      <span className={`kb-count-badge-host${menu ? ' kb-count-badge-host--menu' : ''}`}>
        <button
          type="button"
          className={menu ? `kb-header-menu__item${open ? ' is-active' : ''}` : 'kb-header-icon-btn'}
          aria-label={bellLabel}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {menu ? (
            <>
              <span className="kb-header-menu__icon" aria-hidden>
                <BellIcon />
              </span>
              <span className="kb-header-menu__label">
                Уведомления
                {unreadCount > 0 ? (
                  <span className="kb-count-badge kb-count-badge--inline" aria-hidden>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </span>
            </>
          ) : (
            <BellIcon />
          )}
        </button>
        {!menu && unreadCount > 0 ? (
          <span className="kb-count-badge kb-count-badge--corner" aria-hidden>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </span>

      {open &&
        createPortal(
          <div className="kb-notif-overlay" role="presentation" onClick={() => setOpen(false)}>
            <aside
              id={panelId}
              className="kb-notif-panel"
              role="dialog"
              aria-label="Уведомления"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="kb-notif-panel__header">
                <Text as="h2" variant="subtitle-md-bold" className="kb-notif-panel__title">
                  Уведомления
                  {unreadCount > 0 ? (
                    <span className="kb-notif-panel__meta"> · {unreadCount} новых</span>
                  ) : null}
                </Text>
                <IconButton
                  aria-label="Закрыть"
                  size="md"
                  variant="text"
                  color="neutral"
                  icon={<CloseIcon />}
                  onClick={() => setOpen(false)}
                />
              </header>

              <div className="kb-notif-panel__body">
                {items.length === 0 ? (
                  <p className="kb-notif-empty">Нет уведомлений</p>
                ) : (
                  <ul className="kb-notif-list">
                    {items.map((item) => (
                      <li key={item.id}>
                        <NotificationRow
                          item={item}
                          unread={isNotificationUnread(item.id)}
                          onActivate={activate}
                          onDelete={removeOne}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 || unreadCount > 0 ? (
                <footer className="kb-notif-panel__footer kb-notif-panel__toolbar">
                  {unreadCount > 0 ? (
                    <Button
                      size="sm"
                      variant="tonal"
                      color="primary"
                      startIcon={
                        <Icon path="System Devices/Checks" size={16} weight="regular" aria-hidden />
                      }
                      onClick={markAll}
                    >
                      Пометить все как прочитанное
                    </Button>
                  ) : null}
                  {items.length > 0 ? (
                    <Button
                      size="sm"
                      variant="tonal"
                      color="primary"
                      startIcon={
                        <Icon
                          path="Office & Editing/TrashSimple"
                          size={16}
                          weight="regular"
                          aria-hidden
                        />
                      }
                      onClick={clearAll}
                    >
                      Очистить всё
                    </Button>
                  ) : null}
                </footer>
              ) : null}
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
