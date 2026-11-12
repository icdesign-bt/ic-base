import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { EmptyState, Text } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { FolderCard } from '@/components/docs/FolderCard';
import { MixedItemsRow } from '@/components/home/MixedItemsRow';
import {
  frequentItemsForRole,
  recentDocumentsForRole,
  recentFoldersForRole,
  uploadedItemsForRole,
} from '@/lib/corpus';
import { useApp } from '@/state/AppContext';

const META: Record<string, { title: string; description: string }> = {
  frequent: {
    title: 'Часто используемые',
    description: 'Файлы и папки, к которым вы обращаетесь чаще всего',
  },
  'recent-folders': {
    title: 'Недавние папки',
    description: 'Папки, с которыми вы недавно работали',
  },
  'recent-files': {
    title: 'Недавние файлы',
    description: 'Документы, которые вы недавно открывали',
  },
  uploaded: {
    title: 'Ваши файлы и папки',
    description: 'Загруженные и созданные вами материалы',
  },
};

export function LibrarySectionPage() {
  const { section = '' } = useParams();
  const { role } = useApp();
  const meta = META[section];

  const frequent = useMemo(() => frequentItemsForRole(role), [role]);
  const recentFolders = useMemo(() => recentFoldersForRole(role), [role]);
  const recentFiles = useMemo(() => recentDocumentsForRole(role), [role]);
  const uploaded = useMemo(() => uploadedItemsForRole(role), [role]);

  if (!meta) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="kb-page">
      <Text as="h1" variant="heading-h4">
        {meta.title}
      </Text>
      <Text as="p" variant="body-md" color="secondary">
        {meta.description}
      </Text>

      {section === 'frequent' &&
        (frequent.length === 0 ? (
          <EmptyState title="Пока пусто" description="Часто используемые появятся после работы с файлами." />
        ) : (
          <MixedItemsRow items={frequent} wrap />
        ))}

      {section === 'recent-folders' &&
        (recentFolders.length === 0 ? (
          <EmptyState title="Пока пусто" description="Недавние папки появятся после открытия документов." />
        ) : (
          <div className="kb-folder-grid">
            {recentFolders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        ))}

      {section === 'recent-files' &&
        (recentFiles.length === 0 ? (
          <EmptyState title="Пока пусто" description="Недавние файлы появятся после открытия документов." />
        ) : (
          <div className="kb-file-grid">
            {recentFiles.map((doc) => (
              <DocumentFileCard
                key={doc.id}
                doc={doc}
                openedAt={doc.openedAt}
                previewQueue={recentFiles}
              />
            ))}
          </div>
        ))}

      {section === 'uploaded' &&
        (uploaded.length === 0 ? (
          <EmptyState title="Пока пусто" description="Здесь будут ваши загруженные файлы и папки." />
        ) : (
          <MixedItemsRow items={uploaded} wrap />
        ))}
    </div>
  );
}
