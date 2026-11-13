import { useCallback, useMemo, useRef, useState } from 'react';
import { Icon, IconButton, Text } from 'ic-kit';
import { filePreviewSrc, pptxSlidePreviewSrc } from '@/lib/filePreview';
import type { Document } from '@/types/knowledge';

type Props = { doc: Document };

const SWIPE_MIN_PX = 56;

type MockSheet = {
  name: string;
  columns: string[];
  rows: string[][];
};

function mockSheets(doc: Document): MockSheet[] {
  const titleHint = doc.title.toLowerCase();
  const seed = [...doc.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  if (titleHint.includes('иде')) {
    return [
      {
        name: 'Идеи 2027',
        columns: ['ID', 'Идея', 'Зона', 'Формат', 'Овнер', 'Приоритет', 'Статус', 'Срок'],
        rows: [
          ['IC-01', 'Зона AI-хаба', 'Витрина', 'Питчи 5 мин', 'Егорова', 'Высокий', 'В работе', 'фев 2027'],
          ['IC-02', 'Демо Базы знаний 2.0', 'Киоск', 'Экран + ноут', 'Курылев', 'Высокий', 'В работе', 'янв 2027'],
          ['IC-03', 'Партнёрский трек', 'Партнёры', 'Стенд + воркшоп', 'Фатеева', 'Средний', 'Согласование', 'дек 2026'],
          ['IC-04', 'Карта стендов интерактив', 'Навигация', 'Тач-экран', 'Курылев', 'Средний', 'Концепт', 'янв 2027'],
          ['IC-05', 'Гостевой чек-ин QR', 'Регистрация', 'Мобильный', 'Пенский', 'Низкий', 'Идея', '—'],
          ['IC-06', 'Лайв-трансляция питчей', 'Сцена', 'Стрим', 'Егорова', 'Средний', 'Оценка', 'фев 2027'],
          ['IC-07', 'Уголок RnD-инициатив', 'RnD', 'Постеры + демо', 'Курылев', 'Высокий', 'В работе', 'янв 2027'],
          ['IC-08', 'VR-тур по ИЦ', 'Иммерсив', 'Headset', 'Фатеева', 'Низкий', 'Отложено', '—'],
          ['IC-09', 'Стенд «Умный поиск»', 'Поиск', 'Киоск', 'Егорова', 'Высокий', 'Пилот', 'дек 2026'],
          ['IC-10', 'Мастер-класс по ЕДИ', 'Обучение', 'Воркшоп 40 мин', 'Пенский', 'Средний', 'В работе', 'фев 2027'],
          ['IC-11', 'Фотозона «Ядро»', 'Активация', 'Инсталл', 'Фатеева', 'Низкий', 'Идея', '—'],
          ['IC-12', 'Дашборд готовности стендов', 'Оргкомитет', 'Таблица live', 'Курылев', 'Высокий', 'В работе', 'ноя 2026'],
          ['IC-13', 'Биржа контактов гостей', 'Нетворкинг', 'Приложение', 'Егорова', 'Средний', 'Концепт', 'янв 2027'],
          ['IC-14', 'Архив ИС 2025–26 на киоске', 'Архив', 'Галерея', 'Курылев', 'Низкий', 'Готово', 'окт 2026'],
        ],
      },
      {
        name: 'Приоритеты',
        columns: ['Ранг', 'Идея', 'Обоснование', 'Решение', 'Дата'],
        rows: [
          ['1', 'Демо Базы знаний 2.0', 'Ключевой питч образа', 'Берём', '03.11.2026'],
          ['2', 'Зона AI-хаба', 'Витрина сценариев', 'Берём', '03.11.2026'],
          ['3', 'Стенд «Умный поиск»', 'Связка с БЗ', 'Берём', '03.11.2026'],
          ['4', 'Уголок RnD-инициатив', 'Воронка идей', 'Берём', '04.11.2026'],
          ['5', 'Дашборд готовности', 'Операционка оргкомитета', 'Берём', '05.11.2026'],
          ['6', 'Партнёрский трек', 'Нужно согласование', 'Отложить', '05.11.2026'],
          ['7', 'VR-тур по ИЦ', 'Дорого / мало времени', 'Отклонить', '05.11.2026'],
          ['8', 'Фотозона «Ядро»', 'Nice-to-have', 'Отложить', '05.11.2026'],
        ],
      },
      {
        name: 'Архив',
        columns: ['Год', 'Предложение', 'Автор', 'Итог'],
        rows: [
          ['2025', 'Интерактивная карта', 'Фатеева', 'Реализовано'],
          ['2025', 'Стенд HR-витрины', 'HR', 'Частично'],
          ['2026', 'AI-питчи на сцене', 'Егорова', 'Реализовано'],
          ['2026', 'Киоск умного поиска', 'Егорова', 'Пилот'],
          ['2026', 'VR-зона', 'Дизайн', 'Не взяли'],
          ['2026', 'Чек-ин по QR', 'Оргкомитет', 'Реализовано'],
        ],
      },
    ];
  }

  if (titleHint.includes('стенд') || titleHint.includes('roadmap') || titleHint.includes('дорожн')) {
    return [
      {
        name: 'Стенды 2027',
        columns: ['#', 'Стенд', 'Продукт', 'Овнер', 'Оборудование', 'Статус', 'Готовность', 'Комментарий'],
        rows: [
          ['A1', 'База знаний 2.0', 'S-011', 'Курылев', 'Экран 55" + ноут', 'В работе', '70%', 'Сценарий демо готов'],
          ['A2', 'Умный поиск', 'S-044', 'Егорова', 'Киоск', 'Пилот', '55%', 'Нужен корпус запросов'],
          ['B1', 'AI-хаб', 'S-052', 'Егорова', 'Демо-стенд', 'Концепт', '35%', 'Сценарии follow-up'],
          ['B2', 'RnD-витрина', 'Инициативы', 'Курылев', 'Постеры + планшет', 'В работе', '60%', 'Шаблон питча'],
          ['C1', 'Транскрибатор', 'S-045', 'Пенский', 'Ноут', 'Сопровождение', '80%', 'To-be: развивать'],
          ['C2', 'Аналитика', 'Витрины', 'Аналитика', 'Экран', 'Готово', '90%', 'Только просмотр'],
          ['D1', 'Дизайн / СРЕДА', 'СРЕДА', 'Дизайн', 'Мокапы', 'В работе', '50%', 'Материалы СРЕДЫ'],
          ['D2', 'Онбординг HR', 'HR', 'HR', 'Планшет', 'Ограничено', '40%', 'ACL по ролям'],
          ['E1', 'Партнёры', '—', 'Фатеева', 'Стойка', 'Согласование', '25%', 'Ждём брендбук'],
          ['E2', 'Навигация', 'Карта', 'Фатеева', 'Тач 43"', 'Концепт', '30%', 'Черновик схемы'],
          ['F1', 'Регистрация', 'Чек-ин', 'Оргкомитет', 'Планшеты ×2', 'В работе', '65%', 'QR + бейджи'],
          ['F2', 'Сцена питчей', 'Сцена', 'Егорова', 'Проектор', 'Готово', '85%', 'Тайминг 5 мин'],
        ],
      },
      {
        name: 'Идеи',
        columns: ['Идея', 'Источник', 'Статус'],
        rows: [
          ['Доп. розетка у A1', 'Курылев', 'Принято'],
          ['Дубль киоска у входа', 'Фатеева', 'Оценка'],
          ['Тихий угол для звонков', 'Гость 2026', 'Отложено'],
          ['Запасной ноут на B1', 'Егорова', 'Принято'],
          ['Указатели к F2', 'Оргкомитет', 'В работе'],
        ],
      },
      {
        name: 'Архив',
        columns: ['Год', 'Стенд', 'Статус'],
        rows: [
          ['2025', 'База знаний', 'Закрыт'],
          ['2025', 'Аналитика', 'Закрыт'],
          ['2026', 'Умный поиск', 'Архив'],
          ['2026', 'AI-хаб', 'Архив'],
          ['2026', 'Сцена питчей', 'Архив'],
        ],
      },
    ];
  }

  const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const hints = doc.preview.pages.length > 0 ? doc.preview.pages : ['Значение'];
  const rows = Array.from({ length: 12 }, (_, r) =>
    columns.map((col, c) => {
      if (c === 0) return String(r + 1);
      if (c === 1) return hints[r % hints.length] ?? `${col}${r + 1}`;
      const variants = ['В работе', 'Готово', 'Пилот', 'Концепт', '—', 'Высокий', 'Средний'];
      return variants[(seed + r * 3 + c) % variants.length]!;
    }),
  );

  return [
    {
      name: 'Лист 1',
      columns: ['#', 'Название', 'Овнер', 'Статус', 'Приоритет', 'Срок', 'Комментарий'],
      rows,
    },
    {
      name: 'Сводка',
      columns: ['Метрика', 'Значение', 'Дата'],
      rows: [
        ['Строк на листе', String(rows.length), doc.updatedAt],
        ['Колонок', '7', doc.updatedAt],
        ['Обновлено', doc.updatedAt, '—'],
      ],
    },
  ];
}

/** PPTX: листалка слайдов. */
export function PptxViewer({ doc }: Props) {
  const slides = doc.preview.pages;
  const [index, setIndex] = useState(0);
  const total = Math.max(slides.length, 1);
  const current = slides[index] ?? 'Слайд';
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.changedTouches[0];
    if (!t) return;
    swipeStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const start = swipeStart.current;
      swipeStart.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dx) < SWIPE_MIN_PX || Math.abs(dx) <= Math.abs(dy)) return;
      setIndex((i) => {
        if (dx < 0) return Math.min(total - 1, i + 1);
        return Math.max(0, i - 1);
      });
    },
    [total],
  );

  return (
    <div className="kb-preview-viewer kb-preview-viewer--pptx" data-preview-swipe-self>
      <div
        className="kb-preview-viewer__canvas"
        aria-live="polite"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          className="kb-preview-viewer__thumb"
          src={pptxSlidePreviewSrc(index)}
          alt=""
          draggable={false}
        />
        <div className="kb-preview-viewer__slide-copy">
          <Text as="p" variant="label-sm-bold" color="secondary" className="kb-preview-viewer__kicker">
            Слайд {index + 1} из {total}
          </Text>
          <Text as="h3" variant="subtitle-md-bold" className="kb-preview-viewer__slide-title">
            {current}
          </Text>
          <Text as="p" variant="body-sm" color="secondary">
            Только просмотр · редактирование недоступно
          </Text>
        </div>
      </div>
      <div className="kb-preview-viewer__nav">
        <IconButton
          className="kb-preview-viewer__nav-arrow"
          aria-label="Предыдущий слайд"
          size="sm"
          variant="tonal"
          color="neutral"
          disabled={index === 0}
          type="button"
          icon={<Icon path="Arrows & Directions/CaretLeft" size={18} weight="bold" />}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <div className="kb-preview-viewer__dots" role="tablist" aria-label="Слайды">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Слайд ${i + 1}`}
              className={`kb-preview-viewer__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <IconButton
          className="kb-preview-viewer__nav-arrow"
          aria-label="Следующий слайд"
          size="sm"
          variant="tonal"
          color="neutral"
          disabled={index >= total - 1}
          type="button"
          icon={<Icon path="Arrows & Directions/CaretRight" size={18} weight="bold" />}
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
        />
      </div>
    </div>
  );
}

/** XLSX: вкладки листов + таблица только для чтения. */
export function XlsxViewer({ doc }: Props) {
  const sheets = useMemo(() => mockSheets(doc), [doc]);
  const [tab, setTab] = useState(0);
  const active = sheets[tab] ?? sheets[0]!;

  return (
    <div className="kb-preview-viewer kb-preview-viewer--xlsx">
      <div className="kb-preview-viewer__tabs" role="tablist" aria-label="Листы таблицы">
        {sheets.map((sheet, i) => (
          <button
            key={sheet.name}
            type="button"
            role="tab"
            aria-selected={i === tab}
            className={`kb-preview-viewer__tab${i === tab ? ' is-active' : ''}`}
            onClick={() => setTab(i)}
          >
            {sheet.name}
          </button>
        ))}
      </div>
      <div className="kb-preview-viewer__sheet" role="tabpanel">
        <div className="kb-preview-viewer__sheet-scroll">
          <table className="kb-preview-viewer__table">
            <thead>
              <tr>
                {active.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={`${i}-${j}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Text as="p" variant="body-sm" color="secondary" className="kb-preview-viewer__readonly">
          Только просмотр · ячейки недоступны для редактирования
        </Text>
      </div>
    </div>
  );
}

/** DOCX / PDF / MD / TXT: страницы со скроллом вниз. */
export function PagesViewer({ doc }: Props) {
  const kind = doc.preview.kind;
  const label = kind === 'pdf' ? 'Стр.' : 'Стр.';

  return (
    <div className="kb-preview-viewer kb-preview-viewer--pages">
      {doc.preview.pages.map((page, i) => (
        <article key={i} className={`kb-preview-viewer__page kb-preview-viewer__page--${kind}`}>
          <header className="kb-preview-viewer__page-head">
            <Text as="span" variant="label-sm-bold" color="secondary">
              {label} {i + 1}
            </Text>
          </header>
          {i === 0 ? (
            <img
              className="kb-preview-viewer__page-thumb"
              src={filePreviewSrc(kind === 'md' || kind === 'txt' ? 'md' : kind === 'pdf' ? 'pdf' : 'docx')}
              alt=""
              draggable={false}
            />
          ) : null}
          <Text as="p" variant="body-md" className="kb-preview-viewer__page-text">
            {page}
          </Text>
        </article>
      ))}
      <Text as="p" variant="body-sm" color="secondary" className="kb-preview-viewer__readonly">
        Только просмотр · редактирование недоступно
      </Text>
    </div>
  );
}

/** Изображение. */
export function ImageViewer({ doc }: Props) {
  return (
    <div className="kb-preview-viewer kb-preview-viewer--image">
      <img
        className="kb-preview-viewer__image"
        src={filePreviewSrc('image')}
        alt={doc.preview.imageLabel ?? doc.title}
        draggable={false}
      />
      {doc.preview.imageLabel ? (
        <Text as="p" variant="body-sm" color="secondary">
          {doc.preview.imageLabel}
        </Text>
      ) : null}
    </div>
  );
}

export function DocumentViewer({ doc }: Props) {
  switch (doc.fileType) {
    case 'pptx':
      return <PptxViewer doc={doc} />;
    case 'xlsx':
      return <XlsxViewer doc={doc} />;
    case 'image':
      return <ImageViewer doc={doc} />;
    default:
      return <PagesViewer doc={doc} />;
  }
}
