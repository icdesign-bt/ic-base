import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState, Text } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { DocumentTile } from '@/components/docs/DocumentTile';
import { FolderBreadcrumbs } from '@/components/docs/FolderBreadcrumbs';
import { FolderCard } from '@/components/docs/FolderCard';
import { FolderToolbar } from '@/components/docs/FolderToolbar';
import { ViewModeToggle, type ViewMode } from '@/components/docs/ViewModeToggle';
import {
  folderStatsForRole,
  getFolder,
  listChildFoldersForRole,
  listDocumentsForRole,
} from '@/lib/corpus';
import { documentsAvailableLabel, subfoldersCountLabel } from '@/lib/format';
import { useApp } from '@/state/AppContext';

export function FolderPage() {
  const { folderId = '' } = useParams();
  const { role } = useApp();
  const [filesView, setFilesView] = useState<ViewMode>('grid');
  const folder = getFolder(folderId);
  const childFolders = listChildFoldersForRole(folderId, role)
    .map((f) => folderStatsForRole(f.id, role))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  const docs = listDocumentsForRole(role).filter((d) => d.folderId === folderId);
  const empty = childFolders.length === 0 && docs.length === 0;

  if (!folder) {
    return (
      <div className="kb-page">
        <EmptyState title="Папка не найдена" description="Проверьте адрес или доступы." />
      </div>
    );
  }

  return (
    <div className="kb-page">
      <div className="kb-page__heading kb-page__heading--folder">
        <FolderBreadcrumbs folderId={folder.id} />
        <Text as="h1" variant="heading-h4" className="kb-page__title">
          {folder.name}
        </Text>
        <Text as="p" variant="body-md" color="secondary" className="kb-page__lead">
          {childFolders.length > 0
            ? `${subfoldersCountLabel(childFolders.length)} · ${documentsAvailableLabel(docs.length)}`
            : documentsAvailableLabel(docs.length)}
        </Text>
        <FolderToolbar folder={folder} />
      </div>

      {empty ? (
        <EmptyState
          title="Пусто или нет доступа"
          description="Для этой роли материалы в папке не отображаются."
        />
      ) : (
        <>
          {childFolders.length > 0 ? (
            <section className="kb-section">
              <Text as="h2" variant="subtitle-md-bold">
                Папки
              </Text>
              <div className="kb-folder-grid">
                {childFolders.map((child) => (
                  <FolderCard key={child.id} folder={child} />
                ))}
              </div>
            </section>
          ) : null}

          {docs.length > 0 ? (
            <section className="kb-section">
              <div className="kb-section__head">
                <Text as="h2" variant="subtitle-md-bold" className="kb-section__title">
                  Файлы
                </Text>
                <ViewModeToggle value={filesView} onChange={setFilesView} />
              </div>
              {filesView === 'list' ? (
                <div className="kb-file-grid kb-file-grid--list">
                  {docs.map((doc) => (
                    <DocumentFileCard key={doc.id} doc={doc} previewQueue={docs} />
                  ))}
                </div>
              ) : (
                <div className="kb-file-preview-grid">
                  {docs.map((doc) => (
                    <DocumentTile key={doc.id} doc={doc} previewQueue={docs} />
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
