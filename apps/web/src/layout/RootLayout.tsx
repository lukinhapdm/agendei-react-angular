import { Link, NavLink, Outlet, useNavigation } from 'react-router';
import { ThemeToggle } from '../shared/ui/ThemeToggle';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-white'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
  }`;

export function RootLayout() {
  const navigation = useNavigation();

  return (
    <div className="flex min-h-dvh flex-col">
      {navigation.state === 'loading' && (
        <div className="fixed inset-x-0 top-0 h-1 animate-pulse bg-brand-600" role="progressbar" />
      )}

      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-brand-600">
            Agendei
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/meus-agendamentos" className={navLinkClass}>
              Meus agendamentos
            </NavLink>
            <NavLink to="/entrar" className={navLinkClass}>
              Entrar
            </NavLink>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-slate-500">
        Agendei · projeto de portfólio
      </footer>
    </div>
  );
}
