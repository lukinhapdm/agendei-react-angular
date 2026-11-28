import { supabase } from '../../../core/supabase/client';

export async function sendMagicLink(email: string, redirectPath: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Precisa estar na lista de Redirect URLs do Supabase, senão cai na Site URL
    options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
