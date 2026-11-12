import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Input } from 'ic-kit';
import { recentQueries } from '@/lib/corpus';
import { matchAssistantEntry } from '@/scenarios/assistantFlows';
import { useApp } from '@/state/AppContext';

export function SmartSearch() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchHistory, pushSearchHistory } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const fromMocks = recentQueries().map((q) => q.text);
    const merged = [...searchHistory, ...fromMocks.filter((t) => !searchHistory.includes(t))];
    return merged.slice(0, 8);
  }, [searchHistory]);

  function submit(value: string) {
    const q = value.trim();
    if (!q) return;
    setSearchQuery(q);
    pushSearchHistory(q);
    setOpen(false);
    if (matchAssistantEntry(q)) {
      navigate(`/assistant?q=${encodeURIComponent(q)}`);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="kb-search" ref={wrapRef}>
      <Input
        fullWidth
        size="md"
        placeholder="Поиск по Базе знаний"
        value={searchQuery}
        startIcon={<Icon path="System Devices/MagnifyingGlass" size={20} weight="regular" />}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit(searchQuery);
        }}
      />
      {open && suggestions.length > 0 && (
        <div className="kb-search__dropdown" role="listbox">
          <p className="kb-search__dropdown-label">Последние запросы</p>
          <ul>
            {suggestions.map((text) => (
              <li key={text}>
                <button
                  type="button"
                  className="kb-search__suggestion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(text)}
                >
                  <Icon path="Time/ClockCounterClockwise" size={16} weight="regular" aria-hidden />
                  {text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
