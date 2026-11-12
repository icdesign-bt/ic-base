import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState, Text } from 'ic-kit';
import { FolderCard } from '@/components/docs/FolderCard';
import { folderStatsForRole, listRootFoldersForRole } from '@/lib/corpus';
import { useApp } from '@/state/AppContext';
import type { FolderScope } from '@/types/knowledge';

const TITLES: Record<FolderScope, string> = {
  management: 'Папки управлений',
  shared: 'Общие файлы и папки',
};

export function ScopeFoldersPage() {
  const { scope = '' } = useParams();
  const { role } = useApp();
  const folderScope: FolderScope | null =
    scope === 'management' || scope === 'shared' ? scope : null;

  const folders = useMemo(() => {
    if (!folderScope) return [];
    return listRootFoldersForRole(role)
      .filter((f) => f.scope === folderScope)
      .map((f) => folderStatsForRole(f.id, role))
      .filter((f): f is NonNullable<typeof f> => Boolean(f));
  }, [folderScope, role]);

  if (!folderScope) {
    return (
      <div className="kb-page">
        <EmptyState title="Раздел не найден" description="Проверьте адрес." />
      </div>
    );
  }

  return (
    <div className="kb-page">
      <div className="kb-page__heading">
        <Text as="h1" variant="heading-h4" className="kb-page__title">
          {TITLES[folderScope]}
        </Text>
        <Text as="p" variant="body-md" color="secondary" className="kb-page__lead">
          Папки верхнего уровня в этом разделе
        </Text>
      </div>

      {folders.length === 0 ? (
        <EmptyState
          title="Нет доступных папок"
          description="Для этой роли в разделе ничего не отображается."
        />
      ) : (
        <div className="kb-folder-grid">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      )}
    </div>
  );
}
