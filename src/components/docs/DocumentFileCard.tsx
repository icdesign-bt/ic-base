import { Text } from 'ic-kit';
import { FavoriteStar } from '@/components/docs/FavoriteStar';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import {
  fileTypeExtension,
  formatDownloadCount,
  getDocumentDownloadCount,
} from '@/lib/documentMeta';
import { formatDocDate, formatOpenedAt } from '@/lib/format';
import { useApp } from '@/state/AppContext';
import type { Document } from '@/types/knowledge';

type Props = {
  doc: Document;
  /** Если задано — показываем «когда открывали», иначе дату обновления файла. */
  openedAt?: string;
  /** Соседние файлы текущей выдачи / страницы для листания в превью. */
  previewQueue?: Document[];
};

export function DocumentFileCard({ doc, openedAt, previewQueue }: Props) {
  const { openPreview, isDocFavorite, toggleDocFavorite } = useApp();
  const fav = isDocFavorite(doc.id);
  const dateLabel = openedAt ? formatOpenedAt(openedAt) : formatDocDate(doc.updatedAt);
  const downloads = formatDownloadCount(getDocumentDownloadCount(doc));

  return (
    <button
      type="button"
      className={`kb-file-card${fav ? ' is-favorite' : ''}`}
      onClick={() => openPreview(doc, previewQueue)}
    >
      <FileTypeGlyph fileType={doc.fileType} />
      <span className="kb-file-card__text">
        <Text as="span" variant="label-md-bold" className="kb-file-card__title">
          <span className="kb-file-card__name">{doc.title}</span>
          <span className="kb-file-card__facts">
            {' '}
            · {fileTypeExtension(doc.fileType)} · {doc.sizeLabel}
          </span>
        </Text>
        <Text as="span" variant="body-sm" color="secondary" className="kb-file-card__meta">
          {dateLabel} · {downloads}
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
