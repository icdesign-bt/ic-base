/** ISO day key `YYYY-MM-DD` в локальной календарной дате. */
export function toDayKey(isoOrDay: string | Date = new Date()): string {
  if (typeof isoOrDay === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(isoOrDay)) {
    return isoOrDay;
  }
  const d = isoOrDay instanceof Date ? isoOrDay : new Date(isoOrDay);
  if (Number.isNaN(d.getTime())) {
    return typeof isoOrDay === 'string' ? isoOrDay.slice(0, 10) : '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** «Сегодня» в локальном календаре машины — дефолт выбранного дня на /meetings. */
export const DEMO_TODAY = toDayKey();

export function isSameDay(a: string, b: string): boolean {
  return toDayKey(a) === toDayKey(b);
}

export function parseDayKey(dayKey: string): Date {
  return new Date(`${toDayKey(dayKey)}T12:00:00`);
}

/** Сб / Вс — выходные, встреч не бывает. */
export function isWeekend(dayKey: string): boolean {
  const day = parseDayKey(dayKey).getDay();
  return day === 0 || day === 6;
}

/** Сдвиг дня на `delta` календарных дней. */
export function shiftDayKey(dayKey: string, delta: number): string {
  const d = parseDayKey(dayKey);
  d.setDate(d.getDate() + delta);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Диапазон дней включительно вокруг якоря. */
export function dayRangeAround(anchorDay: string, before = 10, after = 10): string[] {
  const keys: string[] = [];
  for (let i = -before; i <= after; i += 1) {
    keys.push(shiftDayKey(anchorDay, i));
  }
  return keys;
}

export function formatDayStripLabel(dayKey: string): {
  weekday: string;
  dayNum: string;
  /** Короткое имя месяца — только для 1-го числа. */
  monthLabel: string | null;
} {
  const d = parseDayKey(dayKey);
  const dayNum = d.getDate();
  return {
    weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
    dayNum: String(dayNum),
    monthLabel:
      dayNum === 1
        ? d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '')
        : null,
  };
}

/** Полная дата выбранного дня: «понедельник, 9 ноября». */
export function formatSelectedDayDate(dayKey: string): string {
  return parseDayKey(dayKey).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
