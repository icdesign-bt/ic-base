import { Avatar } from 'ic-kit';
import type { Person } from '@/mocks/meetings';

type Props = {
  person: Person;
  size?: 'sm' | 'md';
  className?: string;
};

/** Аватар участника: фото профиля, если есть, иначе инициалы. */
export function PersonAvatar({ person, size = 'sm', className }: Props) {
  const classes = ['kb-person-avatar', className].filter(Boolean).join(' ');
  return (
    <Avatar
      size={size}
      color={person.avatarColor}
      variant="tonal"
      initials={person.initials}
      src={person.avatarSrc}
      alt={person.name}
      className={classes}
    />
  );
}
