import { createContext, useContext } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'agendei-theme';
export const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export interface ThemeContextValue {
  mode: ThemeMode;
  cycle: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return value;
}
