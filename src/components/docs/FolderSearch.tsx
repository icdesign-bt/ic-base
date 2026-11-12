import { useNavigate } from 'react-router-dom';
import { Button, Icon, IconButton } from 'ic-kit';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useApp } from '@/state/AppContext';

type Props = {
  folderId: string;
};

/** Кнопка «Поиск» → /search?q=…&folder=… (лейаут поиска по папке). */
export function FolderSearch({ folderId }: Props) {
  const navigate = useNavigate();
  const iconOnly = useMediaQuery('(max-width: 720px)');
  const { getFolderSearchDraft } = useApp();

  function openSearch() {
    const saved = getFolderSearchDraft(folderId);
    navigate(
      `/search?q=${encodeURIComponent(saved)}&folder=${encodeURIComponent(folderId)}`,
    );
  }

  if (iconOnly) {
    return (
      <IconButton
        className="kb-folder-toolbar__icon-btn"
        aria-label="Поиск"
        size="md"
        color="neutral"
        variant="outlined"
        icon={<Icon path="System Devices/MagnifyingGlass" size={18} weight="regular" />}
        onClick={openSearch}
      />
    );
  }

  return (
    <Button
      className="kb-folder-toolbar__btn"
      size="md"
      color="neutral"
      variant="outlined"
      startIcon={<Icon path="System Devices/MagnifyingGlass" size={18} weight="regular" />}
      onClick={openSearch}
    >
      <span className="kb-folder-toolbar__label">Поиск</span>
    </Button>
  );
}
