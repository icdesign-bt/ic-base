import { Text } from 'ic-kit';
import { FavoriteStar } from '@/components/docs/FavoriteStar';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import { filePreviewSrc } from '@/lib/filePreview';
import { formatDocDate } from '@/lib/format';
import { useApp } from '@/state/AppContext';
import type { Document } from '@/types/knowledge';

export type DocumentTileSize = 'lg' | 'md' | 'sm';

type Props = {
  doc: Document;
  /** lg — папка на десктопе; md — выдача ассистента; sm — плотные сетки */
  size?: DocumentTileSize;
  /** Соседние файлы текущей выдачи / страницы для листания в превью. */
  previewQueue?: Document[];
};

export function DocumentTile({ doc, size = 'lg', previewQueue }: Props) {
  const { openPreview, isDocFavorite, toggleDocFavorite } = useApp();
  const fav = isDocFavorite(doc.id);
  const compact = size !== 'lg';

  return (
    <button
      type="button"
      className={`kb-file-preview-card kb-file-preview-card--${size}${fav ? ' is-favorite' : ''}`}
      onClick={() => openPreview(doc, previewQueue)}
    >
      <span className="kb-file-preview-card__media" aria-hidden>
        <img
          className="kb-file-preview-card__img"
          src={filePreviewSrc(doc.fileType)}
          alt=""
          loading="lazy"
        />
      </span>
      <span className="kb-file-preview-card__body">
        <FileTypeGlyph
          fileType={doc.fileType}
          className={compact ? 'kb-file-glyph--sm' : undefined}
        />
        <span className="kb-file-card__text">
          <Text
            as="span"
            variant={compact ? 'body-sm' : 'label-md-bold'}
            className="kb-file-card__title"
            title={doc.title}
          >
            {doc.title}
          </Text>
          <Text as="span" variant="body-sm" color="secondary" className="kb-file-card__meta">
            {formatDocDate(doc.updatedAt)}
          </Text>
        </span>
      </span>
      <FavoriteStar
        active={fav}
        label={fav ? 'Убрать из избранного' : 'Добавить в избранное'}
        onToggle={() => toggleDocFavorite(doc.id)}
      />
    </button>
  );
}
