import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'ic-kit';
import { FrequentItemCard } from '@/components/docs/FrequentItemCard';
import { ShowAllLink } from '@/components/home/ShowAllLink';
import { documentsFromMixed, type FrequentEntry } from '@/lib/corpus';

type Props = {
  items: FrequentEntry[];
  emptyLabel?: string;
};

/** До 4 карточек: сетка на desktop, нативный свайп + dots на phone. */
export function FrequentPreview({ items, emptyLabel = 'Пока нет часто используемых' }: Props) {
  const visible = items.slice(0, 4);
  const previewQueue = useMemo(() => documentsFromMixed(visible), [visible]);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || visible.length === 0) return;

    const update = () => {
      const width = track.clientWidth;
      if (width <= 0) return;
      setActive(Math.min(visible.length - 1, Math.max(0, Math.round(track.scrollLeft / width))));
    };

    update();
    track.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(track);
    return () => {
      track.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [visible.length]);

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="kb-frequent-preview">
      {visible.length === 0 ? (
        <Text as="p" variant="body-md" color="secondary">
          {emptyLabel}
        </Text>
      ) : (
        <>
          <div ref={trackRef} className="kb-frequent-preview__track" role="list">
            {visible.map((item) => (
              <div
                key={item.kind === 'folder' ? `f-${item.folder.id}` : `d-${item.document.id}`}
                className="kb-frequent-preview__item"
                role="listitem"
              >
                <FrequentItemCard item={item} previewQueue={previewQueue} />
              </div>
            ))}
          </div>
          <div className="kb-frequent-preview__dots" role="tablist" aria-label="Слайды часто используемых">
            {visible.map((item, index) => (
              <button
                key={item.kind === 'folder' ? `dot-f-${item.folder.id}` : `dot-d-${item.document.id}`}
                type="button"
                role="tab"
                aria-label={`Карточка ${index + 1} из ${visible.length}`}
                aria-selected={index === active}
                className={`kb-frequent-preview__dot${index === active ? ' is-active' : ''}`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </>
      )}
      <ShowAllLink to="/library/frequent" />
    </div>
  );
}
