import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, IconButton, Input, TextArea } from 'ic-kit';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { matchAssistantEntry } from '@/scenarios/assistantFlows';
import { useApp } from '@/state/AppContext';

const POPULAR = [
  'Покажи файлы инновационной столицы',
  'Как завести инициативу',
  'Служебная записка аппарат',
  'Итоги последнего стендапа',
  'Актуальная документация по Инновационной столице',
];

type Props = {
  className?: string;
};

/** Поиск + «Загрузить файл» / «Создать раздел» (только лендинг). */
export function KbSearchBar({ className }: Props) {
  const navigate = useNavigate();
  const { setSearchQuery, pushSearchHistory, recentAssistantChats } = useApp();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const mobile = useMediaQuery('(max-width: 599px)');

  const placeholder = useMemo(() => {
    const sample = POPULAR[Math.floor(Math.random() * POPULAR.length)] ?? POPULAR[0];
    return `Например: ${sample}`;
  }, []);

  useLayoutEffect(() => {
    if (!mobile) return;
    const el = wrapRef.current?.querySelector<HTMLTextAreaElement>('textarea');
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [query, mobile, placeholder]);

  const find = useCallback(
    (raw?: string) => {
      const q = (raw ?? query).trim();
      if (!q) return;
      setQuery(q);
      setSearchQuery(q);
      pushSearchHistory(q);
      setOpen(false);
      if (matchAssistantEntry(q)) {
        navigate(`/assistant?q=${encodeURIComponent(q)}`);
        return;
      }
      navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [query, setSearchQuery, pushSearchHistory, navigate],
  );

  const { listening, toggle: toggleVoice } = useSpeechToText({
    onInterim: (text) => setQuery(text),
    onFinal: (text) => find(text),
    onError: (message) => window.alert(message),
  });

  function openChat(entryQuery: string, turnId: string) {
    setOpen(false);
    setSearchQuery(entryQuery);
    navigate(`/assistant?q=${encodeURIComponent(entryQuery)}&turn=${encodeURIComponent(turnId)}`);
  }

  const showDropdown = open && recentAssistantChats.length > 0;

  const endIcon = (
    <span className="kb-landing-search__end">
      <IconButton
        className={[
          'kb-landing-search__mic',
          'kb-mic',
          listening ? 'kb-mic--listening' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={listening ? 'Остановить голосовой ввод' : 'Голосовой запрос'}
        aria-pressed={listening}
        size="lg"
        color={listening ? 'primary' : 'neutral'}
        variant="text"
        icon={<Icon path="Media/Microphone" size={24} weight="regular" />}
        onClick={toggleVoice}
      />
      <Button
        className="kb-landing-search__find"
        size="lg"
        color="primary"
        variant="contained"
        disabled={!query.trim()}
        onClick={() => find()}
      >
        Найти
      </Button>
    </span>
  );

  const fieldClass = [
    'kb-landing-search__input',
    mobile ? 'kb-landing-search__input--multiline' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['kb-landing-search', className].filter(Boolean).join(' ')}>
      <div className="kb-landing-search__field" ref={wrapRef}>
        {mobile ? (
          <TextArea
            className={fieldClass}
            size="lg"
            fullWidth
            rows={2}
            resizable={false}
            enterKeyHint="search"
            autoComplete="off"
            placeholder={listening ? 'Слушаю…' : placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                find();
              }
            }}
            aria-label="Поиск по базе знаний"
            endIcon={endIcon}
          />
        ) : (
          <Input
            className={fieldClass}
            size="lg"
            fullWidth
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={listening ? 'Слушаю…' : placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 150);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                find();
              }
            }}
            aria-label="Поиск по базе знаний"
            endIcon={endIcon}
          />
        )}

        {showDropdown ? (
          <div className="kb-search__dropdown kb-landing-search__dropdown" role="listbox">
            <p className="kb-search__dropdown-label">Недавние чаты с помощником</p>
            <ul>
              {recentAssistantChats.map((chat) => {
                const turnId = chat.turnPath[chat.turnPath.length - 1]!;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      className="kb-search__suggestion"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => openChat(chat.entryQuery, turnId)}
                    >
                      <Icon path="Time/ClockCounterClockwise" size={16} weight="regular" aria-hidden />
                      {chat.entryQuery}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="kb-landing-search__actions">
        <Button
          size="md"
          color="neutral"
          variant="text"
          startIcon={<Icon path="System Devices/UploadSimple" size={18} weight="regular" />}
          onClick={() => window.alert('Мок: загрузка файла — в следующем контуре')}
        >
          Загрузить файл
        </Button>
        <Button
          size="md"
          color="neutral"
          variant="text"
          startIcon={<Icon path="Office & Editing/FolderSimple" size={18} weight="regular" />}
          onClick={() => window.alert('Мок: создать раздел — в следующем контуре')}
        >
          Создать раздел
        </Button>
      </div>
    </div>
  );
}
