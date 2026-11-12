import { useState, type ReactNode } from 'react';
import { Icon, IconButton, Input, Text } from 'ic-kit';

type Props = {
  title: string;
  placeholder?: string;
  children: (query: string) => ReactNode;
};

export function SectionQuickSearch({
  title,
  placeholder = 'Поиск по названию',
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <section className="kb-section">
      <div className="kb-section__head">
        <Text as="h2" variant="subtitle-md-bold" className="kb-section__title">
          {title}
        </Text>
        {open ? (
          <div className="kb-section__search">
            <Input
              size="md"
              fullWidth
              autoFocus
              placeholder={placeholder}
              value={query}
              startIcon={
                <Icon path="System Devices/MagnifyingGlass" size={18} weight="regular" aria-hidden />
              }
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') close();
              }}
              aria-label={`${title}: поиск`}
            />
            <IconButton
              aria-label="Закрыть поиск"
              size="md"
              variant="text"
              color="neutral"
              icon={<CloseIcon />}
              onClick={close}
            />
          </div>
        ) : (
          <IconButton
            className="kb-section__search-toggle"
            aria-label={`Поиск в разделе «${title}»`}
            size="md"
            variant="text"
            color="neutral"
            icon={
              <Icon path="System Devices/MagnifyingGlass" size={20} weight="regular" aria-hidden />
            }
            onClick={() => setOpen(true)}
          />
        )}
      </div>
      {children(query.trim())}
    </section>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function matchesNameQuery(name: string, query: string): boolean {
  if (!query) return true;
  return name.toLowerCase().includes(query.toLowerCase());
}
