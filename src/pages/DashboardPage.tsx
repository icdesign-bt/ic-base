import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Input, Text } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { FolderCard } from '@/components/docs/FolderCard';
import { DashboardChats } from '@/components/home/DashboardChats';
import { DashboardProfile } from '@/components/home/DashboardProfile';
import { MixedItemsRow } from '@/components/home/MixedItemsRow';
import { SectionTitleLink } from '@/components/home/SectionTitleLink';
import { matchesNameQuery } from '@/components/home/SectionQuickSearch';
import { MeetingEventCard } from '@/components/meetings/MeetingEventCard';
import {
  frequentItemsForRole,
  lastMeetingSummary,
  mentionsForRole,
  recentDocumentsForRole,
  recentFoldersForRole,
  uploadedItemsForRole,
} from '@/lib/corpus';
import { CURRENT_USER } from '@/lib/currentUser';
import { useApp } from '@/state/AppContext';

export function DashboardPage() {
  const { role } = useApp();
  const [query, setQuery] = useState('');
  const q = query.trim();

  const frequent = useMemo(() => frequentItemsForRole(role), [role]);
  const recentFolders = useMemo(() => recentFoldersForRole(role), [role]);
  const recent = useMemo(() => recentDocumentsForRole(role), [role]);
  const uploaded = useMemo(() => uploadedItemsForRole(role), [role]);
  const meeting = lastMeetingSummary(role);
  const mentions = mentionsForRole(role).slice(0, 4);

  const filteredFolders = useMemo(
    () => recentFolders.filter((folder) => matchesNameQuery(folder.name, q)).slice(0, 4),
    [recentFolders, q],
  );

  const filteredUploaded = useMemo(
    () =>
      uploaded
        .filter((item) =>
          matchesNameQuery(item.kind === 'folder' ? item.folder.name : item.document.title, q),
        )
        .slice(0, 4),
    [uploaded, q],
  );

  const filteredRecent = useMemo(
    () => recent.filter((doc) => matchesNameQuery(doc.title, q)).slice(0, 8),
    [recent, q],
  );

  const filteredFrequent = useMemo(
    () =>
      frequent
        .filter((item) =>
          matchesNameQuery(item.kind === 'folder' ? item.folder.name : item.document.title, q),
        )
        .slice(0, 4),
    [frequent, q],
  );

  const firstName = CURRENT_USER.fullName.split(' ')[0] ?? 'Константин';

  return (
    <div className="kb-page kb-page--dashboard">
      <div className="kb-dashboard kb-dashboard--with-chats">
        <DashboardChats />

        <div className="kb-dashboard__main">
          <div className="kb-dashboard__intro">
            <Text as="h1" variant="heading-h4" className="kb-dashboard__title">
              Привет, {firstName}!
            </Text>
            <Text as="p" variant="body-lg" color="secondary" className="kb-dashboard__lead">
              Это ваш дашборд в Ядре. Ищите по названию и просматривайте актуальные файлы с помощью
              превью.
            </Text>
          </div>

          <div className="kb-dashboard-search">
            <Input
              size="md"
              fullWidth
              placeholder="Поиск по названию файла"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              startIcon={
                <Icon path="System Devices/MagnifyingGlass" size={18} weight="regular" aria-hidden />
              }
              aria-label="Поиск по названию файла"
            />
          </div>

          <section className="kb-section">
            <SectionTitleLink title="Недавние файлы" to="/library/recent-files" />
            <div className="kb-section-preview">
              {filteredRecent.length === 0 ? (
                <Text as="p" variant="body-md" color="secondary">
                  Ничего не найдено
                </Text>
              ) : (
                <div className="kb-file-grid kb-file-grid--rows-2">
                  {filteredRecent.map((doc) => (
                    <DocumentFileCard
                      key={doc.id}
                      doc={doc}
                      openedAt={doc.openedAt}
                      previewQueue={filteredRecent}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="kb-section">
            <SectionTitleLink title="Недавние папки" to="/library/recent-folders" />
            <div className="kb-section-preview">
              {filteredFolders.length === 0 ? (
                <Text as="p" variant="body-md" color="secondary">
                  Ничего не найдено
                </Text>
              ) : (
                <div className="kb-folder-grid kb-folder-grid--row">
                  {filteredFolders.map((folder) => (
                    <FolderCard key={folder.id} folder={folder} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="kb-section">
            <SectionTitleLink title="Ваши файлы и папки" to="/library/uploaded" />
            <div className="kb-section-preview">
              <MixedItemsRow items={filteredUploaded} wrap emptyLabel="Ничего не найдено" />
            </div>
          </section>

          <section className="kb-section">
            <SectionTitleLink title="Часто используемые" to="/library/frequent" />
            <div className="kb-section-preview">
              <MixedItemsRow items={filteredFrequent} wrap emptyLabel="Ничего не найдено" />
            </div>
          </section>
        </div>

        <aside className="kb-dashboard__aside" aria-label="Профиль и активность">
          <DashboardProfile />

          <section className="kb-section glass-panel kb-widget">
            <Text as="h2" variant="subtitle-md-bold">
              Последняя встреча
            </Text>
            {meeting ? (
              <MeetingEventCard meeting={meeting} openLabel="Открыть" />
            ) : (
              <Text variant="body-md" color="secondary">
                Нет доступных встреч для этой роли.
              </Text>
            )}
          </section>

          <section className="kb-section glass-panel kb-widget">
            <Text as="h2" variant="subtitle-md-bold">
              Вас упоминали
            </Text>
            <ul className="kb-mention-list">
              {mentions.map((m) => (
                <li key={m.id}>
                  <Link to={`/meeting/${m.meetingId}`} className="kb-mention">
                    <Text as="span" variant="label-md-bold">
                      {m.taskContext}
                    </Text>
                    <Text as="span" variant="body-sm" color="secondary">
                      {m.excerpt}
                    </Text>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
