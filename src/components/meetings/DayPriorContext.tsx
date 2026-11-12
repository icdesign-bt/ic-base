import { Link, useNavigate } from 'react-router-dom';
import { Button, Text } from 'ic-kit';
import { formatMeetingWhen } from '@/lib/format';
import type { PriorContextEntry } from '@/lib/meetingsBriefing';

type Props = {
  items: PriorContextEntry[];
};

export function DayPriorContext({ items }: Props) {
  const navigate = useNavigate();

  return (
    <section
      className="kb-day-brief kb-day-brief--prior glass-panel"
      aria-label="Контекст прошлых встреч"
    >
      <div className="kb-day-brief__head">
        <Text as="h2" variant="subtitle-md-bold">
          Контекст прошлых
        </Text>
        <Text as="p" variant="body-sm" color="secondary">
          Транскрипты и итоги по названию, участникам и темам
        </Text>
      </div>

      {items.length === 0 ? (
        <Text as="p" variant="body-sm" color="secondary" className="kb-day-brief__empty">
          Связанный контекст не найден для этого дня.
        </Text>
      ) : (
        <ul className="kb-day-brief__list">
          {items.map(({ meeting, excerpt }) => (
            <li key={meeting.id}>
              <article className="kb-day-brief__prior">
                <div className="kb-day-brief__prior-title-row">
                  <Text as="h3" variant="label-md-bold" className="kb-day-brief__prior-title">
                    {meeting.title}
                  </Text>
                  <Button
                    type="button"
                    size="sm"
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/meeting/${meeting.id}`)}
                  >
                    Показать детали
                  </Button>
                </div>
                <Text as="p" variant="body-sm" color="secondary" className="kb-day-brief__prior-when">
                  {formatMeetingWhen(meeting.startsAt, meeting.endsAt)}
                </Text>
                <Text as="p" variant="label-sm-bold" className="kb-day-brief__prior-summary-label">
                  Саммари
                </Text>
                <Text as="p" variant="body-sm" color="secondary" className="kb-day-brief__prior-excerpt">
                  {excerpt}
                </Text>
                <Link className="kb-day-brief__prior-cta" to={`/meeting/${meeting.id}`}>
                  Открыть транскрипт
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
