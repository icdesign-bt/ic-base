import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from 'ic-kit';
import { HeaderSettings } from '@/components/layout/HeaderSettings';
import { NAV_ITEMS } from '@/components/layout/navItems';
import { NotificationsBell } from '@/components/layout/NotificationsBell';
import {
  countUnreadNotifications,
  NOTIFICATIONS_CHANGED_EVENT,
} from '@/utils/notificationsStorage';

type Props = {
  /** В минимальном режиме пункты основного меню тоже внутри бургера. */
  includeNav?: boolean;
};

export function HeaderOverflow({ includeNav = false }: Props) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(countUnreadNotifications);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const onUnreadChange = useCallback((count: number) => setUnread(count), []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sync = () => setUnread(countUnreadNotifications());
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
    return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('.kb-notif-panel')) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const label =
    unread > 0 ? `Меню, ${unread} новых уведомлений` : includeNav ? 'Меню' : 'Уведомления и настройки';

  return (
    <div className={`kb-header__more${open ? ' is-open' : ''}`} ref={rootRef}>
      <div className="kb-header__actions kb-header__actions-pill glass-panel">
        <span className="kb-count-badge-host">
          <button
            type="button"
            className={`kb-header-icon-btn kb-header__burger-btn${open ? ' is-active' : ''}`}
            aria-label={label}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`kb-burger-icon${open ? ' is-open' : ''}`} aria-hidden>
              <span />
              <span />
              <span />
            </span>
          </button>
          {!open && unread > 0 ? (
            <span className="kb-count-badge kb-count-badge--corner" aria-hidden>
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </span>
      </div>
      {open ? (
        <div
          className="kb-header__more-panel"
          id={panelId}
          role="menu"
          aria-label={includeNav ? 'Меню' : 'Уведомления и настройки'}
          onClick={(e) => {
            if (
              e.target instanceof Element &&
              e.target.closest('a.kb-header-menu__link, a.kb-header-menu__item')
            ) {
              setOpen(false);
            }
          }}
        >
          {includeNav ? (
            <nav className="kb-header-menu__nav" aria-label="Основные разделы">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  className={({ isActive }) =>
                    isActive || item.match(pathname)
                      ? 'kb-header-menu__link is-active'
                      : 'kb-header-menu__link'
                  }
                >
                  <span className="kb-header-menu__icon" aria-hidden>
                    <Icon path={item.icon} size={18} weight="regular" />
                  </span>
                  <span className="kb-header-menu__label">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          ) : null}
          <div className="kb-header-menu__actions">
            <NotificationsBell layout="menu" onUnreadChange={onUnreadChange} />
            <HeaderSettings layout="menu" avatarTo="/dashboard" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
