import { publicAsset } from '@/lib/publicAsset';
import type { FileType } from '@/types/knowledge';

/** Fluent / Material-style file glyphs (локальные SVG в public/file-icons). */
export function fileTypeIconSrc(kind: FileType): string {
  switch (kind) {
    case 'pdf':
      return publicAsset('file-icons/pdf.svg');
    case 'docx':
      return publicAsset('file-icons/docx.svg');
    case 'xlsx':
      return publicAsset('file-icons/xlsx.svg');
    case 'pptx':
      return publicAsset('file-icons/pptx.svg');
    case 'image':
      return publicAsset('file-icons/image.svg');
    case 'txt':
      return publicAsset('file-icons/txt.svg');
    case 'md':
      return publicAsset('file-icons/md.svg');
    default:
      return publicAsset('file-icons/txt.svg');
  }
}

export const FOLDER_ICON_SRC = publicAsset('file-icons/folder.svg');

/** Логотипы корневых папок управлений (28×28 в карточках). */
const MANAGEMENT_FOLDER_ICONS: Record<string, string> = {
  'fld-bigdata': publicAsset('folder-icons/bigdata.png'),
  'fld-analytics': publicAsset('folder-icons/analytics.png'),
  'fld-modeling': publicAsset('folder-icons/modeling.png'),
  'fld-consulting': publicAsset('folder-icons/consulting.png'),
  'fld-dev': publicAsset('folder-icons/development.png'),
  'fld-design': publicAsset('folder-icons/design.png'),
  'fld-orgdev': publicAsset('folder-icons/orgdev.png'),
  'fld-apparatus': publicAsset('folder-icons/apparatus.png'),
  'fld-afanasiev': publicAsset('folder-icons/afanasiev.png'),
  'fld-initiatives': publicAsset('folder-icons/initiatives.png'),
};

export function folderIconSrc(folderId: string): string {
  return MANAGEMENT_FOLDER_ICONS[folderId] ?? FOLDER_ICON_SRC;
}
