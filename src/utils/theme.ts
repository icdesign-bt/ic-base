export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'ic-base-theme';

function resolveThemeMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export function getStoredThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    /* ignore */
  }
  return 'light';
}

export function setThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = resolveThemeMode(mode);
}

export function initAppearance(): void {
  document.documentElement.dataset.brand = 'ic';
  document.documentElement.dataset.skin = 'glass';
  applyThemeMode(getStoredThemeMode());
}
