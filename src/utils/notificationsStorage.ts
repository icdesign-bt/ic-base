import { MOCK_NOTIFICATIONS } from '@/mocks/notifications';

const READ_KEY = 'ic-base-notif-read';
const DELETED_KEY = 'ic-base-notif-deleted';
const SEEDED_KEY = 'ic-base-notif-seeded';

function readIdSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function writeIdSet(key: string, ids: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

/**
 * Первый запуск: прочитаны все, кроме defaultUnread.
 * При появлении новых моков с defaultUnread=false — сразу помечаем прочитанными,
 * чтобы не раздувать бейдж у уже посетивших прототип.
 */
export function ensureNotificationsSeeded(): void {
  try {
    const seeded = localStorage.getItem(SEEDED_KEY) === '1';
    const read = seeded ? readIdSet(READ_KEY) : new Set<string>();
    let changed = !seeded;

    for (const n of MOCK_NOTIFICATIONS) {
      if (!n.defaultUnread && !read.has(n.id) && !isNotificationDeleted(n.id)) {
        read.add(n.id);
        changed = true;
      }
    }

    if (changed) writeIdSet(READ_KEY, read);
    if (!seeded) localStorage.setItem(SEEDED_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function getDeletedNotificationIds(): Set<string> {
  return readIdSet(DELETED_KEY);
}

export function isNotificationDeleted(id: string): boolean {
  return getDeletedNotificationIds().has(id);
}

export function listVisibleNotifications<T extends { id: string }>(items: T[]): T[] {
  const deleted = getDeletedNotificationIds();
  return items.filter((n) => !deleted.has(n.id));
}

export function getReadNotificationIds(): Set<string> {
  ensureNotificationsSeeded();
  return readIdSet(READ_KEY);
}

export function markNotificationRead(id: string): void {
  const set = getReadNotificationIds();
  set.add(id);
  writeIdSet(READ_KEY, set);
}

export function markAllNotificationsRead(): void {
  const visible = listVisibleNotifications(MOCK_NOTIFICATIONS);
  writeIdSet(READ_KEY, new Set(visible.map((n) => n.id)));
}

export function isNotificationUnread(id: string): boolean {
  if (isNotificationDeleted(id)) return false;
  return !getReadNotificationIds().has(id);
}

export function countUnreadNotifications(): number {
  return listVisibleNotifications(MOCK_NOTIFICATIONS).filter((n) => isNotificationUnread(n.id)).length;
}

export function deleteNotification(id: string): void {
  const deleted = getDeletedNotificationIds();
  deleted.add(id);
  writeIdSet(DELETED_KEY, deleted);

  const read = getReadNotificationIds();
  read.add(id);
  writeIdSet(READ_KEY, read);
}

export function clearAllNotifications(): void {
  writeIdSet(
    DELETED_KEY,
    new Set(MOCK_NOTIFICATIONS.map((n) => n.id)),
  );
  writeIdSet(READ_KEY, new Set(MOCK_NOTIFICATIONS.map((n) => n.id)));
}

export const NOTIFICATIONS_CHANGED_EVENT = 'ic-base-notifications-changed';

function notifyNotificationsChanged() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

/** Вернуть мок-уведомления к старту демо (unread / удалённые как при первом заходе). */
export function resetNotificationsToDemo(): void {
  try {
    localStorage.removeItem(READ_KEY);
    localStorage.removeItem(DELETED_KEY);
    localStorage.removeItem(SEEDED_KEY);
  } catch {
    /* ignore */
  }
  ensureNotificationsSeeded();
  notifyNotificationsChanged();
}
