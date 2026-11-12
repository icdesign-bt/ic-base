import { EmptyState, Text } from 'ic-kit';
import { DocumentFileCard } from '@/components/docs/DocumentFileCard';
import { FolderCard } from '@/components/docs/FolderCard';
import { folderStatsForRole, getDocument } from '@/lib/corpus';
import { useApp } from '@/state/AppContext';

export function FavoritesPage() {
  const { role, favoriteDocIds, favoriteFolderIds } = useApp();

  const folders = favoriteFolderIds
    .map((id) => folderStatsForRole(id, role))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));

  const docs = favoriteDocIds
    .map((id) => getDocument(id))
    .filter((d): d is NonNullable<typeof d> => Boolean(d));

  const empty = folders.length === 0 && docs.length === 0;

  return (
    <div className="kb-page">
      <Text as="h1" variant="heading-h4">
        Избранное
      </Text>

      {empty ? (
        <EmptyState
          title="Пока пусто"
          description="Наведите на папку или файл и нажмите звёздочку, чтобы добавить в избранное."
        />
      ) : (
        <>
          {folders.length > 0 && (
            <section className="kb-section">
              <Text as="h2" variant="subtitle-md-bold">
                Папки
              </Text>
              <div className="kb-folder-grid">
                {folders.map((folder) => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            </section>
          )}

          {docs.length > 0 && (
            <section className="kb-section">
              <Text as="h2" variant="subtitle-md-bold">
                Файлы
              </Text>
              <div className="kb-file-grid">
                {docs.map((doc) => (
                  <DocumentFileCard key={doc.id} doc={doc} previewQueue={docs} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
