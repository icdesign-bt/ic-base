type Props = {
  active: boolean;
  label: string;
  onToggle: () => void;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="kb-fav-star__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.6 14.7 9l5.9.7-4.4 4 1.2 5.8L12 16.8 6.6 19.5l1.2-5.8-4.4-4L9.3 9 12 3.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FavoriteStar({ active, label, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`kb-fav-star${active ? ' kb-fav-star--active' : ''}`}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      <StarIcon filled={active} />
    </button>
  );
}
