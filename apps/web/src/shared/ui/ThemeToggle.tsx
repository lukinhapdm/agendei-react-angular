import type { ReactNode } from 'react';
import { useTheme, type ThemeMode } from '../../core/theme/theme-context';

const META: Record<ThemeMode, { label: string; icon: ReactNode }> = {
  system: {
    label: 'Tema: automático',
    icon: <path d="M12 3a9 9 0 1 0 0 18V3Z M12 3a9 9 0 0 1 0 18" />,
  },
  light: {
    label: 'Tema: claro',
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  dark: {
    label: 'Tema: escuro',
    icon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />,
  },
};

export function ThemeToggle() {
  const { mode, cycle } = useTheme();
  const meta = META[mode];

  return (
    <button
      type="button"
      onClick={cycle}
      title={meta.label}
      aria-label={`${meta.label}. Clique para alternar`}
      className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {meta.icon}
      </svg>
    </button>
  );
}
