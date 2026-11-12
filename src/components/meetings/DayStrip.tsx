import { useEffect, useRef } from 'react';
import { Icon, IconButton, Text } from 'ic-kit';
import {
  DEMO_TODAY,
  dayRangeAround,
  formatDayStripLabel,
  isWeekend,
  shiftDayKey,
} from '@/lib/demoTime';

type Props = {
  selectedDay: string;
  daysWithEvents: Set<string>;
  onSelectDay: (dayKey: string) => void;
  today?: string;
};

export function DayStrip({
  selectedDay,
  daysWithEvents,
  onSelectDay,
  today = DEMO_TODAY,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  /** Шире вперёд, чтобы были видны следующие дни и переход месяца. */
  const days = dayRangeAround(today, 14, 42);

  useEffect(() => {
    const el = selectedRef.current;
    const scroller = scrollerRef.current;
    if (!el || !scroller) return;
    const frame = requestAnimationFrame(() => {
      const elRect = el.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const pad = 8;
      const fullyVisible =
        elRect.left >= scrollerRect.left + pad &&
        elRect.right <= scrollerRect.right - pad;
      if (fullyVisible) return;
      const left =
        scroller.scrollLeft +
        (elRect.left - scrollerRect.left) -
        scroller.clientWidth / 2 +
        elRect.width / 2;
      scroller.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedDay]);

  return (
    <div className="kb-day-strip" role="navigation" aria-label="Дни">
      <IconButton
        type="button"
        size="md"
        variant="text"
        color="neutral"
        aria-label="Предыдущий день"
        icon={<Icon path="Arrows & Directions/CaretLeft" size={18} weight="bold" />}
        onClick={() => onSelectDay(shiftDayKey(selectedDay, -1))}
      />

      <div className="kb-day-strip__scroll" ref={scrollerRef}>
        <ul className="kb-day-strip__list">
          {days.map((dayKey) => {
            const { weekday, dayNum, monthLabel } = formatDayStripLabel(dayKey);
            const selected = dayKey === selectedDay;
            const isToday = dayKey === today;
            const weekend = isWeekend(dayKey);
            const hasEvents = !weekend && daysWithEvents.has(dayKey);
            return (
              <li key={dayKey}>
                <button
                  type="button"
                  ref={selected ? selectedRef : undefined}
                  className={[
                    'kb-day-strip__day',
                    selected ? 'is-selected' : '',
                    isToday ? 'is-today' : '',
                    weekend ? 'is-weekend' : '',
                    monthLabel ? 'has-month' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={selected}
                  aria-current={selected ? 'date' : undefined}
                  aria-label={
                    weekend
                      ? `${weekday} ${dayNum}${monthLabel ? ` ${monthLabel}` : ''}, выходной`
                      : `${weekday} ${dayNum}${monthLabel ? ` ${monthLabel}` : ''}${hasEvents ? ', есть встречи' : ''}`
                  }
                  onClick={() => onSelectDay(dayKey)}
                >
                  <span className="kb-day-strip__month" aria-hidden={!monthLabel}>
                    {monthLabel ?? ''}
                  </span>
                  <Text as="span" variant="label-sm-bold" className="kb-day-strip__weekday">
                    {weekday}
                  </Text>
                  <span className="kb-day-strip__num">{dayNum}</span>
                  <span
                    className={`kb-day-strip__dot${hasEvents ? ' is-on' : ''}`}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <IconButton
        type="button"
        size="md"
        variant="text"
        color="neutral"
        aria-label="Следующий день"
        icon={<Icon path="Arrows & Directions/CaretRight" size={18} weight="bold" />}
        onClick={() => onSelectDay(shiftDayKey(selectedDay, 1))}
      />
    </div>
  );
}
