import { Button, Icon, IconButton } from 'ic-kit';
import { FolderPlusIcon } from '@/components/icons/FolderPlusIcon';
import { FolderSearch } from '@/components/docs/FolderSearch';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  canManageFolder,
  folderCreateActionLabel,
  isOwnedFolder,
} from '@/lib/corpus';
import { useApp } from '@/state/AppContext';
import type { Folder } from '@/types/knowledge';

type Props = {
  folder: Folder;
};

export function FolderToolbar({ folder }: Props) {
  const { role, isFolderFavorite, toggleFolderFavorite } = useApp();
  const iconOnly = useMediaQuery('(max-width: 720px)');
  const canManage = canManageFolder(folder, role);
  const owned = isOwnedFolder(folder.id);
  const fav = isFolderFavorite(folder.id);
  const createLabel = folderCreateActionLabel(folder);
  const favLabel = fav ? 'Убрать из избранного' : 'Добавить в избранное';

  return (
    <div className="kb-folder-toolbar" role="toolbar" aria-label="Действия с папкой">
      <FolderSearch folderId={folder.id} />
      <IconButton
        className={`kb-folder-toolbar__icon-btn kb-folder-toolbar__fav${fav ? ' is-active' : ''}`}
        aria-label={favLabel}
        aria-pressed={fav}
        size="md"
        color="neutral"
        variant={fav ? 'tonal' : 'outlined'}
        icon={<Icon path="Communication/Star" size={18} weight={fav ? 'fill' : 'regular'} />}
        onClick={() => toggleFolderFavorite(folder.id)}
      />

      {canManage ? (
        iconOnly ? (
          <>
            <IconButton
              className="kb-folder-toolbar__icon-btn"
              aria-label="Загрузить файл"
              size="md"
              color="primary"
              variant="contained"
              icon={<Icon path="System Devices/UploadSimple" size={18} weight="regular" />}
              onClick={() => window.alert('Мок: загрузка файла — в следующем контуре')}
            />
            <IconButton
              className="kb-folder-toolbar__icon-btn"
              aria-label={createLabel}
              size="md"
              color="primary"
              variant="tonal"
              icon={<FolderPlusIcon size={18} />}
              onClick={() =>
                window.alert(
                  createLabel === 'Создать папку'
                    ? 'Мок: создать папку — в следующем контуре'
                    : 'Мок: создать раздел — в следующем контуре',
                )
              }
            />
          </>
        ) : (
          <>
            <Button
              className="kb-folder-toolbar__btn"
              size="md"
              color="primary"
              variant="contained"
              startIcon={<Icon path="System Devices/UploadSimple" size={18} weight="regular" />}
              onClick={() => window.alert('Мок: загрузка файла — в следующем контуре')}
            >
              <span className="kb-folder-toolbar__label">Загрузить файл</span>
            </Button>
            <Button
              className="kb-folder-toolbar__btn"
              size="md"
              color="primary"
              variant="tonal"
              startIcon={<FolderPlusIcon size={18} />}
              onClick={() =>
                window.alert(
                  createLabel === 'Создать папку'
                    ? 'Мок: создать папку — в следующем контуре'
                    : 'Мок: создать раздел — в следующем контуре',
                )
              }
            >
              <span className="kb-folder-toolbar__label">{createLabel}</span>
            </Button>
          </>
        )
      ) : null}

      {owned ? (
        iconOnly ? (
          <IconButton
            className="kb-folder-toolbar__icon-btn"
            aria-label="Настройки доступа"
            size="md"
            color="neutral"
            variant="outlined"
            icon={<Icon path="System Devices/GearSix" size={18} weight="regular" />}
            onClick={() => window.alert('Мок: настройки доступа')}
          />
        ) : (
          <Button
            className="kb-folder-toolbar__btn"
            size="md"
            color="neutral"
            variant="outlined"
            startIcon={<Icon path="System Devices/GearSix" size={18} weight="regular" />}
            onClick={() => window.alert('Мок: настройки доступа')}
          >
            <span className="kb-folder-toolbar__label">Настройки доступа</span>
          </Button>
        )
      ) : null}
    </div>
  );
}
