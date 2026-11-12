import { Link } from 'react-router-dom';
import { Text } from 'ic-kit';
import { FavoriteStar } from '@/components/docs/FavoriteStar';
import { folderIconSrc } from '@/lib/fileTypeIcon';
import { filesCountLabel, foldersCountLabel, formatOpenedAt } from '@/lib/format';
import { useApp } from '@/state/AppContext';
import type { FolderStats } from '@/lib/corpus';

type Props = {
  folder: FolderStats & { openedAt?: string };
};

export function FolderCard({ folder }: Props) {
  const { isFolderFavorite, toggleFolderFavorite } = useApp();
  const fav = isFolderFavorite(folder.id);
  const counts = `${foldersCountLabel(folder.folderCount)} · ${filesCountLabel(folder.fileCount)}`;
  const meta = folder.openedAt
    ? `${formatOpenedAt(folder.openedAt)} · ${counts}`
    : `${counts} · ${folder.sizeLabel}`;

  return (
    <Link to={`/folder/${folder.id}`} className={`kb-folder-card${fav ? ' is-favorite' : ''}`}>
      <div className="kb-folder-card__top">
        <span className="kb-folder-card__icon" aria-hidden>
          <img src={folderIconSrc(folder.id)} alt="" width={28} height={28} draggable={false} />
        </span>
        <FavoriteStar
          active={fav}
          label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
          onToggle={() => toggleFolderFavorite(folder.id)}
        />
      </div>
      <Text as="span" variant="label-md-bold" className="kb-folder-card__title">
        {folder.name}
      </Text>
      <Text as="span" variant="body-sm" color="secondary">
        {meta}
      </Text>
    </Link>
  );
}
