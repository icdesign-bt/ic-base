import { Text } from 'ic-kit';
import { FileTypeGlyph } from '@/components/docs/FileTypeGlyph';
import { formatDocDate } from '@/lib/format';
import type { DayDocEntry } from '@/lib/meetingsBriefing';
import { useApp } from '@/state/AppContext';

type Props = {
  docs: DayDocEntry[];
  focusMeetingId: string | null;
};

export function DayDocs({ docs, focusMeetingId }: Props) {
  const { openPreview } = useApp();
  const highlighted = focusMeetingId
    ? docs.filter((d) => d.meetingIds.includes(focusMeetingId))
    : docs;
  const rest =
    focusMeetingId && highlighted.length < docs.length
      ? docs.filter((d) => !d.meetingIds.includes(focusMeetingId))
      : [];
  const ordered = [...highlighted, ...rest];

  return (
    <section className="kb-day-brief kb-day-brief--docs glass-panel" aria-label="Документы к встречам">
      <div className="kb-day-brief__head">
        <Text as="h2" variant="subtitle-md-bold">
          Документы к встречам
        </Text>
        <Text as="p" variant="body-sm" color="secondary">
          ИИ подбирает актуальные материалы к выбранному дню
        </Text>
      </div>

      {ordered.length === 0 ? (
        <Text as="p" variant="body-sm" color="secondary" className="kb-day-brief__empty">
          Документов пока нет — в этот день нет встреч с вложениями.
        </Text>
      ) : (
        <ul className="kb-day-brief__list">
          {ordered.map((doc) => {
            const dimmed =
              Boolean(focusMeetingId) && !doc.meetingIds.includes(focusMeetingId!);
            return (
              <li key={doc.id}>
                <button
                  type="button"
                  className={`kb-day-brief__doc${dimmed ? ' is-dimmed' : ''}`}
                  onClick={() => openPreview(doc, ordered)}
                >
                  <FileTypeGlyph fileType={doc.fileType} />
                  <span className="kb-day-brief__doc-text">
                    <Text as="span" variant="label-md-bold">
                      {doc.title}
                    </Text>
                    <Text as="span" variant="body-sm" color="secondary">
                      {doc.reason} · {formatDocDate(doc.updatedAt)}
                    </Text>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
