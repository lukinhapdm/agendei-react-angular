import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_ORDER, THEME_STORAGE_KEY, ThemeContext, type ThemeMode } from './theme-context';

function readSaved(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    return saved && THEME_ORDER.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readSaved);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.style.colorScheme = mode === 'system' ? 'light dark' : mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Navegação privada pode bloquear o storage; o tema só não fica salvo
    }
  }, [mode]);

  const cycle = useCallback(
    () => setMode((m) => THEME_ORDER[(THEME_ORDER.indexOf(m) + 1) % THEME_ORDER.length]),
    [],
  );
  const value = useMemo(() => ({ mode, cycle }), [mode, cycle]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
