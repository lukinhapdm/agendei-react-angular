import { NavLink, useNavigate } from 'react-router';
import { useAuth } from '../core/auth/auth-context';
import { signOut } from '../features/auth/data/auth.repository';

export function UserMenu({ linkClass }: { linkClass: (s: { isActive: boolean }) => string }) {
  const { session, ready } = useAuth();
  const navigate = useNavigate();

  // Evita piscar "Entrar" enquanto a sessão salva ainda está sendo lida
  if (!ready) return null;

  if (!session) {
    return (
      <NavLink to="/entrar" className={linkClass}>
        Entrar
      </NavLink>
    );
  }

  return (
    <button
      type="button"
      title={session.user.email}
      onClick={async () => {
        await signOut();
        navigate('/');
      }}
      className={linkClass({ isActive: false })}
    >
      Sair
    </button>
  );
}
