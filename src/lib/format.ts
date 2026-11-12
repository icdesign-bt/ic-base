export function formatMeetingWhen(isoStart: string, isoEnd: string): string {
  const start = new Date(isoStart);
  const end = new Date(isoEnd);
  const day = start.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
  const t1 = start.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const t2 = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return `${day}, ${t1}–${t2}`;
}

export function fileTypeLabel(type: string): string {
  return type.toUpperCase();
}

export function formatDocDate(isoOrDate: string): string {
  const d = new Date(isoOrDate.includes('T') ? isoOrDate : `${isoOrDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoOrDate;
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last === 1) return one;
  if (last >= 2 && last <= 4) return few;
  return many;
}

export function countLabel(n: number, one: string, few: string, many: string): string {
  return `${n} ${pluralRu(n, one, few, many)}`;
}

/** «1 документ доступен вам» / «3 документа доступны вам» / «5 документов доступны вам». */
export function documentsAvailableLabel(n: number): string {
  const noun = pluralRu(n, 'документ', 'документа', 'документов');
  const verb = pluralRu(n, 'доступен', 'доступны', 'доступны');
  return `${n} ${noun} ${verb} вам`;
}

export function filesCountLabel(n: number): string {
  return countLabel(n, 'файл', 'файла', 'файлов');
}

export function foldersCountLabel(n: number): string {
  return countLabel(n, 'папка', 'папки', 'папок');
}

export function subfoldersCountLabel(n: number): string {
  return countLabel(n, 'подпапка', 'подпапки', 'подпапок');
}

/** Относительное время открытия: «2 минуты назад», «3 дня назад», «28 октября». */
export function formatOpenedAt(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const diffMs = now - d.getTime();
  if (diffMs < 0) {
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'только что';
  if (minutes < 60) {
    return `${minutes} ${pluralRu(minutes, 'минуту', 'минуты', 'минут')} назад`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${pluralRu(hours, 'час', 'часа', 'часов')} назад`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${pluralRu(days, 'день', 'дня', 'дней')} назад`;
  }

  const sameYear = d.getFullYear() === new Date(now).getFullYear();
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}
