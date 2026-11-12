import { IconButton, Tooltip } from 'ic-kit';

export type ViewMode = 'grid' | 'list';

type Props = {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
};

function ListViewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M80 64a8 8 0 0 1 8-8h128a8 8 0 0 1 0 16H88a8 8 0 0 1-8-8Zm136 56H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16Zm0 64H88a8 8 0 0 0 0 16h128a8 8 0 0 0 0-16ZM44 52a12 12 0 1 0 12 12 12 12 0 0 0-12-12Zm0 64a12 12 0 1 0 12 12 12 12 0 0 0-12-12Zm0 64a12 12 0 1 0 12 12 12 12 0 0 0-12-12Z" />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M104 40H40a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 80H40V56h64Zm112-80h-64a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16Zm0 80h-64V56h64Zm-112 32H40a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16Zm0 80H40v-64h64Zm112-80h-64a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-64a16 16 0 0 0-16-16Zm0 80h-64v-64h64Z" />
    </svg>
  );
}

export function ViewModeToggle({ value, onChange }: Props) {
  return (
    <div className="kb-view-toggle" role="group" aria-label="Вид просмотра">
      <Tooltip content="Списком" position="bottom">
        <IconButton
          aria-label="Списком"
          aria-pressed={value === 'list'}
          size="md"
          variant={value === 'list' ? 'tonal' : 'text'}
          color="neutral"
          icon={<ListViewIcon />}
          type="button"
          onClick={() => onChange('list')}
        />
      </Tooltip>
      <Tooltip content="Плиткой" position="bottom">
        <IconButton
          aria-label="Плиткой"
          aria-pressed={value === 'grid'}
          size="md"
          variant={value === 'grid' ? 'tonal' : 'text'}
          color="neutral"
          icon={<GridViewIcon />}
          type="button"
          onClick={() => onChange('grid')}
        />
      </Tooltip>
    </div>
  );
}
