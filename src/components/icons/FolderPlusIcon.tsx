type Props = {
  size?: number;
  className?: string;
};

/** Папка с плюсом — в ic-kit нет FolderPlus. */
export function FolderPlusIcon({ size = 18, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4.1l1.7 1.7h7.2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 11.25v5.5M9.25 14h5.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
