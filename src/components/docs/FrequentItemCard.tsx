import { Link } from 'react-router-dom';
import { Text } from 'ic-kit';
import { FavoriteStar } from '@/components/docs/FavoriteStar';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import { folderIconSrc } from '@/lib/fileTypeIcon';
import { filesCountLabel, foldersCountLabel, formatDocDate } from '@/lib/format';
import { useApp } from '@/state/AppContext';
import type { FrequentEntry } from '@/lib/corpus';
import type { Document } from '@/types/knowledge';

type Props = {
  item: FrequentEntry;
  previewQueue?: Document[];
};

export function FrequentItemCard({ item, previewQueue }: Props) {
  const {
    openPreview,
    isDocFavorite,
    isFolderFavorite,
    toggleDocFavorite,
    toggleFolderFavorite,
  } = useApp();

  if (item.kind === 'folder') {
    const { folder } = item;
    const fav = isFolderFavorite(folder.id);
    return (
      <Link
        to={`/folder/${folder.id}`}
        className={`kb-frequent-card${fav ? ' is-favorite' : ''}`}
      >
        <span className="kb-frequent-card__icon kb-frequent-card__icon--folder" aria-hidden>
          <img src={folderIconSrc(folder.id)} alt="" width={24} height={24} draggable={false} />
        </span>
        <span className="kb-frequent-card__text">
          <Text as="span" variant="label-md-bold" className="kb-frequent-card__title">
            {folder.name}
          </Text>
          <Text as="span" variant="body-sm" color="secondary" className="kb-frequent-card__meta">
            {foldersCountLabel(folder.folderCount)} · {filesCountLabel(folder.fileCount)}
          </Text>
        </span>
        <FavoriteStar
          active={fav}
          label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
          onToggle={() => toggleFolderFavorite(folder.id)}
        />
      </Link>
    );
  }

  const { document: doc } = item;
  const fav = isDocFavorite(doc.id);
  return (
    <button
      type="button"
      className={`kb-frequent-card kb-frequent-card--file${fav ? ' is-favorite' : ''}`}
      onClick={() => openPreview(doc, previewQueue)}
    >
      <FileTypeGlyph fileType={doc.fileType} />
      <span className="kb-frequent-card__text">
        <Text as="span" variant="label-md-bold" className="kb-frequent-card__title">
          {doc.title}
        </Text>
        <Text as="span" variant="body-sm" color="secondary" className="kb-frequent-card__meta">
          {formatDocDate(doc.updatedAt)}
        </Text>
      </span>
      <FavoriteStar
        active={fav}
        label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        onToggle={() => toggleDocFavorite(doc.id)}
      />
    </button>
  );
}
