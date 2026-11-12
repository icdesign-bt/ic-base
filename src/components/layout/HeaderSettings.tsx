import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, Button, Select, Text } from 'ic-kit';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { CURRENT_USER } from '@/lib/currentUser';
import { ROLES } from '@/mocks/roles';
import { useApp } from '@/state/AppContext';
import type { RoleId } from '@/types/knowledge';
import { resetNotificationsToDemo } from '@/utils/notificationsStorage';

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 13.5a7.7 7.7 0 0 0 .05-1.5 7.7 7.7 0 0 0-.05-1.5l2.05-1.55-2-3.45-2.4.8a7.3 7.3 0 0 0-2.6-1.5L14 2h-4l-.45 2.8a7.3 7.3 0 0 0-2.6 1.5l-2.4-.8-2 3.45L4.6 10.5a7.7 7.7 0 0 0-.05 1.5c0 .5.02 1 .05 1.5L2.55 15l2 3.45 2.4-.8a7.3 7.3 0 0 0 2.6 1.5L10 22h4l.45-2.8a7.3 7.3 0 0 0 2.6-1.5l2.4.8 2-3.45-2.05-1.55Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  /** Куда ведёт аватар КК. */
  avatarTo?: string;
  /** Вертикальный пункт меню с подписью. */
  layout?: 'toolbar' | 'menu';
};

export function HeaderSettings({ avatarTo = '/dashboard', layout = 'toolbar' }: Props) {
  const navigate = useNavigate();
  const { role, setRole, resetRecentAssistantChats } = useApp();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const roleMeta = ROLES.find((r) => r.id === role);
  const menu = layout === 'menu';

  function resetDemoChats() {
    resetRecentAssistantChats();
    setOpen(false);
    navigate('/');
  }

  function resetDemoNotifications() {
    resetNotificationsToDemo();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  return (
    <div className={`kb-header__settings${menu ? ' kb-header__settings--menu' : ''}`} ref={rootRef}>
      <button
        type="button"
        className={
          menu
            ? `kb-header-menu__item${open ? ' is-active' : ''}`
            : `kb-header-icon-btn${open ? ' is-active' : ''}`
        }
        aria-label="Настройки"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {menu ? (
          <>
            <span className="kb-header-menu__icon" aria-hidden>
              <GearIcon />
            </span>
            <span className="kb-header-menu__label">Настройки</span>
          </>
        ) : (
          <GearIcon />
        )}
      </button>
      <Link
        to={avatarTo}
        className={menu ? 'kb-header-menu__item kb-header-menu__item--profile' : 'kb-header__avatar-link'}
        aria-label={`${CURRENT_USER.fullName} — рабочий стол`}
      >
        {menu ? (
          <>
            <span className="kb-header-menu__icon kb-header-menu__icon--avatar" aria-hidden>
              <Avatar
                size="md"
                src={CURRENT_USER.avatarSrc}
                alt={CURRENT_USER.fullName}
                className="kb-header__avatar"
              />
            </span>
            <span className="kb-header-menu__label">Профиль</span>
          </>
        ) : (
          <Avatar
            size="md"
            src={CURRENT_USER.avatarSrc}
            alt={CURRENT_USER.fullName}
            className="kb-header__avatar"
          />
        )}
      </Link>
      {open && (
        <div className="kb-settings-panel" id={panelId} role="dialog" aria-label="Настройки">
          <div className="kb-settings-panel__user">
            <Avatar
              size="md"
              src={CURRENT_USER.avatarSrc}
              alt={CURRENT_USER.fullName}
              className="kb-header__avatar"
            />
            <div>
              <Text as="p" variant="label-md-bold">
                {CURRENT_USER.fullName}
              </Text>
              <Text as="p" variant="body-sm" color="secondary">
                {roleMeta?.label ?? CURRENT_USER.roleLabel}
              </Text>
            </div>
          </div>
          <Text as="p" variant="label-md-bold" className="kb-settings-panel__label">
            Тема
          </Text>
          <ThemeSwitcher />
          <Select
            label="Роль"
            size="md"
            fullWidth
            value={role}
            options={ROLES.map((r) => ({ value: r.id, label: r.label }))}
            onChange={(value) => setRole(value as RoleId)}
          />
          <Button
            size="md"
            color="neutral"
            variant="text"
            className="kb-settings-panel__action"
            onClick={resetDemoChats}
          >
            Сбросить прогресс чатов
          </Button>
          <Button
            size="md"
            color="neutral"
            variant="text"
            className="kb-settings-panel__action"
            onClick={resetDemoNotifications}
          >
            Сбросить уведомления
          </Button>
          <span className="proto-badge">прототип / моки</span>
        </div>
      )}
    </div>
  );
}
