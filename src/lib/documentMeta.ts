import { getPerson, type Person } from '@/mocks/meetings';
import type { Document, FileType } from '@/types/knowledge';

const FALLBACK_AUTHORS = [
  'pers-kostya',
  'pers-maria',
  'pers-gleb',
  'pers-yulia',
  'pers-anna',
  'pers-elena',
] as const;

const FILE_EXT: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'DOCX',
  xlsx: 'XLSX',
  pptx: 'PPTX',
  image: 'PNG',
  txt: 'TXT',
  md: 'MD',
};

function hashId(id: string): number {
  return [...id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function fileTypeExtension(fileType: FileType): string {
  return FILE_EXT[fileType] ?? fileType.toUpperCase();
}

/** Мок-счётчик скачиваний для превью. */
export function getDocumentDownloadCount(doc: Document): number {
  return (hashId(doc.id) % 87) + 3;
}

export function formatDownloadCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} скачивание`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} скачивания`;
  return `${count} скачиваний`;
}

/** Строка под заголовком превью: расширение · вес · скачивания. */
export function getDocumentPreviewFacts(doc: Document): string {
  return [
    fileTypeExtension(doc.fileType),
    doc.sizeLabel,
    formatDownloadCount(getDocumentDownloadCount(doc)),
  ].join(' · ');
}

/** Сдвиг даты `YYYY-MM-DD` на N дней назад. */
function shiftDate(isoDate: string, daysBack: number): string {
  const d = new Date(`${isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`}`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

export type DocumentAttribution = {
  createdBy: Person | undefined;
  createdAt: string;
  uploadedAt: string;
  updatedAt: string;
  wasUpdated: boolean;
};

/** Автор и даты для футера превью (с дефолтами на моках). */
export function getDocumentAttribution(doc: Document): DocumentAttribution {
  const h = hashId(doc.id);
  const createdById = doc.createdById ?? FALLBACK_AUTHORS[h % FALLBACK_AUTHORS.length]!;
  const createdAt = doc.createdAt ?? shiftDate(doc.updatedAt, (h % 14) + 2);
  const uploadedAt = doc.uploadedAt ?? createdAt;
  const updatedAt = doc.updatedAt;
  const wasUpdated = updatedAt.slice(0, 10) !== createdAt.slice(0, 10);

  return {
    createdBy: getPerson(createdById),
    createdAt,
    uploadedAt,
    updatedAt,
    wasUpdated,
  };
}
