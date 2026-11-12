import { Link } from 'react-router-dom';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { getPerson } from '@/mocks/meetings';
import type { Meeting } from '@/types/knowledge';

type Props = {
  meeting: Meeting;
  /** Если не задан — `/meeting/:id`. */
  to?: string;
  openLabel?: string;
};

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const t1 = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const t2 = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${t1}–${t2}`;
}

function MeetingAvatars({ meeting }: { meeting: Meeting }) {
  const people = meeting.participants
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <span className="kb-day-schedule__avatars" aria-hidden>
      {people.map((p) => (
        <PersonAvatar key={p.id} person={p} size="sm" />
      ))}
    </span>
  );
}

/** Карточка встречи в том же виде, что в расписании раздела «Встречи». */
export function MeetingEventCard({ meeting, to, openLabel = 'Открыть' }: Props) {
  const href = to ?? `/meeting/${meeting.id}`;

  return (
    <Link to={href} className="kb-day-schedule__card kb-day-schedule__card--tone-0 kb-meeting-event-card">
      <span className="kb-day-schedule__card-time">
        {formatTimeRange(meeting.startsAt, meeting.endsAt)}
      </span>
      <span className="kb-day-schedule__card-body">
        <span className="kb-day-schedule__card-title">{meeting.title}</span>
        <MeetingAvatars meeting={meeting} />
      </span>
      <span className="kb-day-schedule__open">{openLabel}</span>
    </Link>
  );
}
