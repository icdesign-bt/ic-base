import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon, Text } from 'ic-kit';
import { PersonAvatar } from '@/components/people/PersonAvatar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { pluralRu } from '@/lib/format';
import { getPerson } from '@/mocks/meetings';
import type { Meeting } from '@/types/knowledge';

type Props = {
  meetings: Meeting[];
  selectedMeetingId: string | null;
  onSelectMeeting: (id: string) => void;
};

/** Рабочий день 08:00–19:00; высота часа фиксирована для точной привязки. */
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 19;
const HOUR_PX = 72;
const RANGE_HOURS = DAY_END_HOUR - DAY_START_HOUR;
const TRACK_PX = RANGE_HOURS * HOUR_PX;
const HOUR_LABELS = Array.from({ length: RANGE_HOURS + 1 }, (_, i) => DAY_START_HOUR + i);
/** Мин. высота блока под название + время + ряд аватарок. */
const BLOCK_MIN_PX = 92;
const AVATAR_SIZE_PX = 24;
const AVATAR_GAP_PX = 6;
const MORE_WIDTH_PX = 28;

function avatarsRowWidth(count: number, withMore: boolean): number {
  if (count <= 0) return withMore ? MORE_WIDTH_PX : 0;
  const avatars = count * AVATAR_SIZE_PX + (count - 1) * AVATAR_GAP_PX;
  return withMore ? avatars + AVATAR_GAP_PX + MORE_WIDTH_PX : avatars;
}

function minutesFromDayStart(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() - DAY_START_HOUR * 60;
}

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const t1 = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const t2 = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${t1}–${t2}`;
}

function formatTimeStack(startIso: string, endIso: string): { start: string; end: string } {
  const start = new Date(startIso);
  const end = new Date(endIso);
  return {
    start: start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    end: end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
  };
}

function durationMinutes(startIso: string, endIso: string): number {
  return Math.max(15, (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000);
}

function durationLabel(startIso: string, endIso: string): string {
  const mins = Math.round(durationMinutes(startIso, endIso));
  return `${mins} мин`;
}

function MeetingAvatars({ meeting }: { meeting: Meeting }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const people = meeting.participants
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const [visibleCount, setVisibleCount] = useState(people.length);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el || people.length === 0) return;

    const measure = () => {
      const avail = el.clientWidth;
      if (avail <= 0) return;
      if (avatarsRowWidth(people.length, false) <= avail) {
        setVisibleCount(people.length);
        return;
      }
      let n = people.length - 1;
      while (n > 1 && avatarsRowWidth(n, true) > avail) n -= 1;
      setVisibleCount(Math.max(1, n));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [people.length]);

  const shown = people.slice(0, visibleCount);
  const rest = people.length - shown.length;

  return (
    <span className="kb-day-schedule__avatars" ref={wrapRef} aria-hidden>
      {shown.map((p) => (
        <PersonAvatar key={p.id} person={p} size="sm" />
      ))}
      {rest > 0 ? <span className="kb-day-schedule__more">+{rest}</span> : null}
    </span>
  );
}

export function DaySchedule({ meetings, selectedMeetingId, onSelectMeeting }: Props) {
  const isPhone = useMediaQuery('(max-width: 599px)');
  const scrollRef = useRef<HTMLDivElement>(null);
  const countLabel =
    meetings.length === 0
      ? 'Нет встреч в этот день'
      : `${meetings.length} ${pluralRu(meetings.length, 'встреча', 'встречи', 'встреч')}`;

  useEffect(() => {
    if (isPhone || meetings.length === 0 || !scrollRef.current) return;
    const first = meetings[0]!;
    const top = Math.max(0, (minutesFromDayStart(first.startsAt) / 60) * HOUR_PX - 24);
    scrollRef.current.scrollTo({ top, behavior: 'smooth' });
  }, [isPhone, meetings]);

  return (
    <section className="kb-day-schedule glass-panel" aria-label="Расписание дня">
      <div className="kb-day-schedule__head">
        <Text as="h2" variant="subtitle-md-bold">
          Расписание
        </Text>
        <Text as="p" variant="body-sm" color="secondary">
          {countLabel}
        </Text>
      </div>

      {isPhone ? (
        <ul className="kb-day-schedule__agenda" aria-label="Встречи дня">
          {meetings.length === 0 ? (
            <li className="kb-day-schedule__empty">
              <Text as="p" variant="body-sm" color="secondary">
                Выберите другой день или вернитесь к сегодня.
              </Text>
            </li>
          ) : (
            meetings.map((m, index) => {
              const active = m.id === selectedMeetingId;
              const times = formatTimeStack(m.startsAt, m.endsAt);
              const tone = index % 2;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className={`kb-day-schedule__card kb-day-schedule__card--tone-${tone}${active ? ' is-active' : ''}`}
                    onClick={() => onSelectMeeting(m.id)}
                  >
                    <span className="kb-day-schedule__card-time-stack">
                      <span>{times.start}</span>
                      <span className="kb-day-schedule__card-to">до</span>
                      <span>{times.end}</span>
                    </span>
                    <span className="kb-day-schedule__card-body">
                      <span className="kb-day-schedule__card-meta">
                        <span>
                          <Icon path="Time/ClockCounterClockwise" size={14} weight="regular" aria-hidden />
                          {durationLabel(m.startsAt, m.endsAt)}
                        </span>
                        <span>
                          <Icon path="Communication/ChatCircle" size={14} weight="regular" aria-hidden />
                          Online
                        </span>
                      </span>
                      <span className="kb-day-schedule__card-title">{m.title}</span>
                      <MeetingAvatars meeting={m} />
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : (
        <>
          {meetings.length === 0 ? (
            <Text as="p" variant="body-sm" color="secondary" className="kb-day-schedule__empty">
              Выберите другой день или вернитесь к сегодня.
            </Text>
          ) : null}
          <div
            ref={scrollRef}
            className="kb-day-schedule__grid"
            style={{ '--kb-hour-px': `${HOUR_PX}px`, '--kb-track-px': `${TRACK_PX}px` } as CSSProperties}
          >
            <div className="kb-day-schedule__hours" aria-hidden>
              {HOUR_LABELS.map((h) => (
                <div
                  key={h}
                  className="kb-day-schedule__hour"
                  style={{ top: `${(h - DAY_START_HOUR) * HOUR_PX}px` }}
                >
                  <span>{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>
            <div className="kb-day-schedule__track" style={{ height: TRACK_PX }}>
              {Array.from({ length: RANGE_HOURS }, (_, i) => (
                <div
                  key={i}
                  className="kb-day-schedule__slot"
                  style={{ top: i * HOUR_PX, height: HOUR_PX }}
                />
              ))}
              {meetings.map((m, index) => {
                const startMin = Math.max(0, Math.min(RANGE_HOURS * 60, minutesFromDayStart(m.startsAt)));
                const dur = Math.min(RANGE_HOURS * 60 - startMin, durationMinutes(m.startsAt, m.endsAt));
                const timedHeight = (dur / 60) * HOUR_PX;
                const active = m.id === selectedMeetingId;
                const tone = index % 2;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`kb-day-schedule__block kb-day-schedule__block--tone-${tone}${active ? ' is-active' : ''}`}
                    style={{
                      top: (startMin / 60) * HOUR_PX,
                      height: Math.max(timedHeight, BLOCK_MIN_PX),
                    }}
                    onClick={() => onSelectMeeting(m.id)}
                    aria-label={`${m.title}, ${formatTimeRange(m.startsAt, m.endsAt)}`}
                  >
                    <span className="kb-day-schedule__block-title">{m.title}</span>
                    <span className="kb-day-schedule__block-time">
                      {formatTimeRange(m.startsAt, m.endsAt)} · {durationLabel(m.startsAt, m.endsAt)}
                    </span>
                    <MeetingAvatars meeting={m} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
