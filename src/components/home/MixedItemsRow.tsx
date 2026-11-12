import { useMemo } from 'react';
import { Text } from 'ic-kit';
import { FrequentItemCard } from '@/components/docs/FrequentItemCard';
import { documentsFromMixed, type FrequentEntry } from '@/lib/corpus';

type Props = {
  items: FrequentEntry[];
  emptyLabel?: string;
  /** Перенос на новую строку вместо горизонтального скролла. */
  wrap?: boolean;
};

export function MixedItemsRow({ items, emptyLabel = 'Ничего не найдено', wrap = false }: Props) {
  const previewQueue = useMemo(() => documentsFromMixed(items), [items]);

  if (items.length === 0) {
    return (
      <Text as="p" variant="body-md" color="secondary">
        {emptyLabel}
      </Text>
    );
  }
  return (
    <div
      className={wrap ? 'kb-frequent-row kb-frequent-row--wrap' : 'kb-frequent-row'}
      role="list"
    >
      {items.map((item) => (
        <div
          key={item.kind === 'folder' ? `f-${item.folder.id}` : `d-${item.document.id}`}
          className="kb-frequent-row__item"
          role="listitem"
        >
          <FrequentItemCard item={item} previewQueue={previewQueue} />
        </div>
      ))}
    </div>
  );
}
