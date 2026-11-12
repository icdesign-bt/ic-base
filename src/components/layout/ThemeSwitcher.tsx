import { useEffect, useState } from 'react';
import { ButtonGroup } from 'ic-kit';
import {
  applyThemeMode,
  getStoredThemeMode,
  setThemeMode,
  type ThemeMode,
} from '@/utils/theme';

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Системная' },
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredThemeMode());

  useEffect(() => {
    applyThemeMode(mode);
    setThemeMode(mode);
  }, [mode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (mode === 'system') applyThemeMode('system');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  return (
    <div className="kb-theme">
      <ButtonGroup
        className="kb-theme__group"
        value={mode}
        onChange={(value) => setMode(value as ThemeMode)}
        variant="outlined"
        color="neutral"
        size="md"
        aria-label="Тема оформления"
        options={THEME_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
          ariaLabel: opt.label,
        }))}
      />
    </div>
  );
}
