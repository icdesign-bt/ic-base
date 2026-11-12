import type { FileType } from '@/types/knowledge';

export function fileTypeClass(kind: FileType): string {
  switch (kind) {
    case 'pdf':
      return 'kb-file-icon--pdf';
    case 'docx':
    case 'md':
    case 'txt':
      return 'kb-file-icon--doc';
    case 'pptx':
      return 'kb-file-icon--pptx';
    case 'xlsx':
      return 'kb-file-icon--xlsx';
    case 'image':
      return 'kb-file-icon--image';
    default:
      return '';
  }
}
