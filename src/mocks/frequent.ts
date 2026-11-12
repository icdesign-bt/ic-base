/** Смешанный ряд «Часто используемые»: папки и файлы. */
export type FrequentItem =
  | { kind: 'folder'; folderId: string }
  | { kind: 'document'; documentId: string };

export const FREQUENT_ITEMS: FrequentItem[] = [
  { kind: 'folder', folderId: 'fld-innovacapital' },
  { kind: 'document', documentId: 'doc-ic-brief' },
  { kind: 'folder', folderId: 'fld-po' },
  { kind: 'document', documentId: 'doc-po-roadmap' },
  { kind: 'document', documentId: 'doc-rnd-instruction' },
  { kind: 'folder', folderId: 'fld-rnd' },
  { kind: 'document', documentId: 'doc-ic-program' },
  { kind: 'document', documentId: 'doc-rnd-edi-template' },
];
