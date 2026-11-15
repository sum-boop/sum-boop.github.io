import { useCallback, useEffect, useState } from 'react';
import { startSafeViewTransition } from '@/utils/viewTransition';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = 'sumit-portfolio-theme';

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyThemeToDocument(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  const meta = document.getElementById('theme-color-meta');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#f6f7fa' : '#080b12');
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light' || attr === 'dark') return attr;
    }
    return getStoredTheme() ?? getSystemTheme();
  });

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = () => {
      if (getStoredTheme() !== null) return;
      setTheme(mediaQuery.matches ? 'light' : 'dark');
    };
    mediaQuery.addEventListener('change', onSystemChange);
    return () => mediaQuery.removeEventListener('change', onSystemChange);
  }, []);

  const setAndPersistTheme = useCallback((next: ThemeMode) => {
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors in restricted browsing modes
    }
  }, []);

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
      startSafeViewTransition(
        () => {
          applyThemeToDocument(next);
          setAndPersistTheme(next);
        },
        origin ? { kind: 'theme', origin } : { kind: 'theme' },
      );
    },
    [setAndPersistTheme, theme],
  );

  return { theme, setTheme: setAndPersistTheme, toggleTheme };
}
