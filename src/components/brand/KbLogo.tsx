type Props = {
  className?: string;
};

/** Логотип «Ядро» — стопка glass-дисков + wordmark Moscow Sans. */
export function KbLogo({ className }: Props) {
  return (
    <span className={className ?? 'kb-logo'}>
      <svg
        className="kb-logo__mark"
        viewBox="0 0 64 72"
        width={40}
        height={45}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="kbYadroLavTop" x1="8" y1="52" x2="56" y2="64" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E8DFF8" />
            <stop offset="1" stopColor="#C9B6EF" />
          </linearGradient>
          <linearGradient id="kbYadroLavSide" x1="8" y1="58" x2="56" y2="70" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B9A4E4" />
            <stop offset="1" stopColor="#9B82D4" />
          </linearGradient>
          <linearGradient id="kbYadroDarkTop" x1="8" y1="36" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3A3A42" />
            <stop offset="0.55" stopColor="#1C1C22" />
            <stop offset="1" stopColor="#0E0E12" />
          </linearGradient>
          <linearGradient id="kbYadroDarkSide" x1="8" y1="42" x2="56" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2A2A32" />
            <stop offset="1" stopColor="#09090C" />
          </linearGradient>
          <linearGradient id="kbYadroWhiteTop" x1="8" y1="20" x2="56" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#F4F2F8" />
            <stop offset="1" stopColor="#E4E0EE" />
          </linearGradient>
          <linearGradient id="kbYadroWhiteSide" x1="8" y1="26" x2="56" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E8E4F0" />
            <stop offset="1" stopColor="#C8C2D6" />
          </linearGradient>
          <linearGradient id="kbYadroPurpleTop" x1="8" y1="4" x2="56" y2="16" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B57AFF" />
            <stop offset="0.4" stopColor="#8B4DFF" />
            <stop offset="1" stopColor="#6A1FE0" />
          </linearGradient>
          <linearGradient id="kbYadroPurpleSide" x1="8" y1="10" x2="56" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C28E3" />
            <stop offset="1" stopColor="#4C12A8" />
          </linearGradient>
          <radialGradient id="kbYadroHighlight" cx="0.32" cy="0.28" r="0.7">
            <stop stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="32" cy="68" rx="22" ry="3.2" fill="#7C28E3" opacity="0.12" />

        <path
          d="M8 56.5 C8 61.2 18.7 65 32 65 C45.3 65 56 61.2 56 56.5 L56 60.5 C56 65.2 45.3 69 32 69 C18.7 69 8 65.2 8 60.5 Z"
          fill="url(#kbYadroLavSide)"
        />
        <ellipse cx="32" cy="56.5" rx="24" ry="8.5" fill="url(#kbYadroLavTop)" />
        <ellipse cx="32" cy="56.5" rx="24" ry="8.5" fill="url(#kbYadroHighlight)" opacity="0.35" />

        <path
          d="M8 40.5 C8 45.2 18.7 49 32 49 C45.3 49 56 45.2 56 40.5 L56 44.5 C56 49.2 45.3 53 32 53 C18.7 53 8 49.2 8 44.5 Z"
          fill="url(#kbYadroDarkSide)"
        />
        <ellipse cx="32" cy="40.5" rx="24" ry="8.5" fill="url(#kbYadroDarkTop)" />
        <ellipse cx="24" cy="38.5" rx="10" ry="3.2" fill="#FFFFFF" opacity="0.14" />

        <path
          d="M8 24.5 C8 29.2 18.7 33 32 33 C45.3 33 56 29.2 56 24.5 L56 28.5 C56 33.2 45.3 37 32 37 C18.7 37 8 33.2 8 28.5 Z"
          fill="url(#kbYadroWhiteSide)"
        />
        <ellipse cx="32" cy="24.5" rx="24" ry="8.5" fill="url(#kbYadroWhiteTop)" />
        <ellipse cx="32" cy="24.5" rx="24" ry="8.5" fill="url(#kbYadroHighlight)" opacity="0.45" />

        <path
          d="M8 8.5 C8 13.2 18.7 17 32 17 C45.3 17 56 13.2 56 8.5 L56 12.5 C56 17.2 45.3 21 32 21 C18.7 21 8 17.2 8 12.5 Z"
          fill="url(#kbYadroPurpleSide)"
        />
        <ellipse cx="32" cy="8.5" rx="24" ry="8.5" fill="url(#kbYadroPurpleTop)" />
        <ellipse cx="32" cy="8.5" rx="24" ry="8.5" fill="url(#kbYadroHighlight)" />
        <ellipse
          cx="32"
          cy="8.5"
          rx="22.5"
          ry="7.2"
          stroke="#FFFFFF"
          strokeOpacity="0.35"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
      <span className="kb-logo__wordmark" aria-hidden>
        Ядро
      </span>
      <span className="visually-hidden">Ядро — База знаний ИЦ</span>
    </span>
  );
}
