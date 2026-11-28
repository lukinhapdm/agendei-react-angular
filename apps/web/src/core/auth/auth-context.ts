import type { Session } from '@supabase/supabase-js';
import { createContext, useContext } from 'react';

export interface AuthContextValue {
  session: Session | null;
  ready: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return value;
}
