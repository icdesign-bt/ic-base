import { fileTypeIconSrc } from '@/lib/fileTypeIcon';
import type { FileType } from '@/types/knowledge';

type Props = {
  fileType: FileType;
  className?: string;
};

/** Блок 24×24: иконка расширения в стиле Fluent / Material. */
export function FileTypeGlyph({ fileType, className }: Props) {
  return (
    <span className={['kb-file-glyph', className].filter(Boolean).join(' ')} aria-hidden>
      <img src={fileTypeIconSrc(fileType)} alt="" width={24} height={24} draggable={false} />
    </span>
  );
}
