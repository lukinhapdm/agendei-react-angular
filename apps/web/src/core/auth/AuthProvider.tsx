import { useEffect, useState, type ReactNode } from 'react';
import { queryClient } from '../query/query-client';
import { supabase } from '../supabase/client';
import { AuthContext, type AuthContextValue } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({ session: null, ready: false });

  useEffect(() => {
    // Dispara INITIAL_SESSION logo ao assinar, já com a sessão vinda do link mágico
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState({ session, ready: true });
      // Não deixa dados do usuário anterior no cache
      if (event === 'SIGNED_OUT') queryClient.clear();
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext value={state}>{children}</AuthContext>;
}
