import type { FileType } from '@/types/knowledge';

/** Fluent / Material-style file glyphs (локальные SVG в public/file-icons). */
export function fileTypeIconSrc(kind: FileType): string {
  switch (kind) {
    case 'pdf':
      return '/file-icons/pdf.svg';
    case 'docx':
      return '/file-icons/docx.svg';
    case 'xlsx':
      return '/file-icons/xlsx.svg';
    case 'pptx':
      return '/file-icons/pptx.svg';
    case 'image':
      return '/file-icons/image.svg';
    case 'txt':
      return '/file-icons/txt.svg';
    case 'md':
      return '/file-icons/md.svg';
    default:
      return '/file-icons/txt.svg';
  }
}

export const FOLDER_ICON_SRC = '/file-icons/folder.svg';

/** Логотипы корневых папок управлений (28×28 в карточках). */
const MANAGEMENT_FOLDER_ICONS: Record<string, string> = {
  'fld-bigdata': '/folder-icons/bigdata.png',
  'fld-analytics': '/folder-icons/analytics.png',
  'fld-modeling': '/folder-icons/modeling.png',
  'fld-consulting': '/folder-icons/consulting.png',
  'fld-dev': '/folder-icons/development.png',
  'fld-design': '/folder-icons/design.png',
  'fld-orgdev': '/folder-icons/orgdev.png',
  'fld-apparatus': '/folder-icons/apparatus.png',
  'fld-afanasiev': '/folder-icons/afanasiev.png',
  'fld-initiatives': '/folder-icons/initiatives.png',
};

export function folderIconSrc(folderId: string): string {
  return MANAGEMENT_FOLDER_ICONS[folderId] ?? FOLDER_ICON_SRC;
}
