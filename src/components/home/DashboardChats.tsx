import { Link } from 'react-router-dom';
import { Icon, Text } from 'ic-kit';
import { groupChatsByRecency } from '@/scenarios/recentAssistantChats';
import { useApp } from '@/state/AppContext';

/** Боковая колонка «Мои чаты» на дашборде — всегда видна. */
export function DashboardChats() {
  const { recentAssistantChats } = useApp();
  const groups = groupChatsByRecency(recentAssistantChats);

  return (
    <aside className="kb-dashboard__chats" aria-label="Мои чаты">
      <section className="kb-section glass-panel kb-widget kb-dash-chats">
        <Text as="h2" variant="subtitle-md-bold">
          Мои чаты
        </Text>

        {groups.length === 0 ? (
          <p className="text-body-md text-color-secondary kb-dash-chats__empty">
            У вас пока не было чатов, воспользуйтесь умным{' '}
            <a href="/">поиском на главной</a>.
          </p>
        ) : (
          <div className="kb-dash-chats__groups">
            {groups.map((group) => (
              <div key={group.id} className="kb-dash-chats__group">
                <p className="kb-dash-chats__group-label">{group.label}</p>
                <ul className="kb-dash-chats__list">
                  {group.items.map((chat) => {
                    const turnId = chat.turnPath[chat.turnPath.length - 1]!;
                    return (
                      <li key={chat.id}>
                        <Link
                          className="kb-dash-chats__item"
                          to={`/assistant?q=${encodeURIComponent(chat.entryQuery)}&turn=${encodeURIComponent(turnId)}`}
                        >
                          <span className="kb-dash-chats__icon" aria-hidden>
                            <Icon path="Communication/ChatCircle" size={18} weight="regular" />
                          </span>
                          <span className="kb-dash-chats__query">{chat.entryQuery}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
