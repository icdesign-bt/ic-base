import { Icon } from 'ic-kit';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import { formatDocDate } from '@/lib/format';
import type { Document, Folder } from '@/types/knowledge';

type FileProps = {
  kind: 'file';
  doc: Document;
  className?: string;
};

type FolderProps = {
  kind: 'folder';
  folder: Folder;
  meta: string;
  className?: string;
};

type Props = FileProps | FolderProps;

export function EntityChip(props: Props) {
  const className = ['kb-entity-chip', props.className].filter(Boolean).join(' ');

  if (props.kind === 'folder') {
    return (
      <div className={className}>
        <span className="kb-entity-chip__folder-icon" aria-hidden>
          <Icon path="Office & Editing/FolderSimple" size={20} weight="regular" />
        </span>
        <div className="kb-entity-chip__text">
          <span className="kb-entity-chip__title">{props.folder.name}</span>
          <span className="kb-entity-chip__meta">{props.meta}</span>
        </div>
      </div>
    );
  }

  const { doc } = props;
  return (
    <div className={className}>
      <FileTypeGlyph fileType={doc.fileType} />
      <div className="kb-entity-chip__text">
        <span className="kb-entity-chip__title">{doc.title}</span>
        <span className="kb-entity-chip__meta">
          {doc.sizeLabel} · {formatDocDate(doc.updatedAt)}
        </span>
      </div>
    </div>
  );
}
