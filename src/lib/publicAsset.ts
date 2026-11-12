/** Путь к файлу из `public/` с учётом Vite `base` (GitHub Pages `/ic-base/`). */
export function publicAsset(path: string): string {
  const cleaned = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}${cleaned}`;
}
