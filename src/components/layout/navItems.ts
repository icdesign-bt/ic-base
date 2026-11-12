export const NAV_ITEMS = [
  {
    to: '/folders/management',
    label: 'Папки управлений',
    icon: 'Commerce/Buildings',
    match: (path: string) => path.startsWith('/folders/management'),
  },
  {
    to: '/folders/shared',
    label: 'Общие файлы и папки',
    icon: 'Office & Editing/FolderSimple',
    match: (path: string) => path.startsWith('/folders/shared'),
  },
  {
    to: '/meetings',
    label: 'Встречи',
    icon: 'Time/CalendarBlank',
    match: (path: string) => path.startsWith('/meeting'),
  },
  {
    to: '/favorites',
    label: 'Избранное',
    icon: 'Communication/Star',
    match: (path: string) => path.startsWith('/favorites'),
  },
] as const;
