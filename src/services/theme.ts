export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'CHINFON_THEME_MODE';

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('Could not read stored theme:', e);
  }
  return 'dark';
}

export function setStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.warn('Could not save theme:', e);
  }
  applyTheme(theme);
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.remove('theme-dark');
    root.classList.add('theme-light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('theme-light');
    root.classList.add('dark');
    root.classList.add('theme-dark');
    root.style.colorScheme = 'dark';
  }
}
