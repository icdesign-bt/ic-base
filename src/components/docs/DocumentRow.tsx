import { Chip, Text } from 'ic-kit';
import { fileTypeLabel } from '@/lib/format';
import { getFolder } from '@/lib/corpus';
import { useApp } from '@/state/AppContext';
import type { Document } from '@/types/knowledge';

type Props = {
  doc: Document;
  subtitle?: string;
  previewQueue?: Document[];
};

export function DocumentRow({ doc, subtitle, previewQueue }: Props) {
  const { openPreview } = useApp();
  const folder = getFolder(doc.folderId);

  return (
    <button
      type="button"
      className="kb-doc-row"
      onClick={() => openPreview(doc, previewQueue)}
    >
      <div className="kb-doc-row__main">
        <Text as="span" variant="body-md">
          {doc.title}
        </Text>
        <Text as="span" variant="body-sm" color="secondary">
          {subtitle ?? `${folder?.name ?? '—'} · ${doc.updatedAt} · ${doc.sizeLabel}`}
        </Text>
      </div>
      <Chip size="sm" label={fileTypeLabel(doc.fileType)} />
    </button>
  );
}
