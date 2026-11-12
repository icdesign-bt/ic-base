import { publicAsset } from '@/lib/publicAsset';
import type { FileType } from '@/types/knowledge';

const PPTX_SLIDE_PREVIEWS = [
  'previews/preview-pptx.jpg',
  'previews/preview-pptx-slide-2.jpg',
  'previews/preview-pptx-slide-3.jpg',
  'previews/preview-pptx-slide-4.jpg',
] as const;

/** Статичные превью по типу файла (мок-миниатюры). */
export function filePreviewSrc(kind: FileType): string {
  switch (kind) {
    case 'pdf':
      return publicAsset('previews/preview-pdf.jpg');
    case 'pptx':
      return publicAsset(PPTX_SLIDE_PREVIEWS[0]);
    case 'xlsx':
      return publicAsset('previews/preview-xlsx.jpg');
    case 'md':
    case 'txt':
      return publicAsset('previews/preview-md.jpg');
    case 'image':
      return publicAsset('previews/preview-image.jpg');
    case 'docx':
    default:
      return publicAsset('previews/preview-docx.jpg');
  }
}

/** Превью конкретного слайда презентации (0 — титул). */
export function pptxSlidePreviewSrc(slideIndex: number): string {
  const i = ((slideIndex % PPTX_SLIDE_PREVIEWS.length) + PPTX_SLIDE_PREVIEWS.length) % PPTX_SLIDE_PREVIEWS.length;
  return publicAsset(PPTX_SLIDE_PREVIEWS[i]!);
}
