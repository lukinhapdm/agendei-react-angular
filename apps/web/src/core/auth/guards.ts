import { redirect, type LoaderFunctionArgs } from 'react-router';
import { safeRedirectPath } from '../../shared/lib/redirect';
import { supabase } from '../supabase/client';

// getSession espera o supabase terminar de ler a sessão (inclusive do link mágico)
export async function requireAuth({ request }: LoaderFunctionArgs) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const url = new URL(request.url);
    throw redirect(`/entrar?redirect=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return null;
}

export async function guestOnly({ request }: LoaderFunctionArgs) {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    throw redirect(safeRedirectPath(new URL(request.url).searchParams.get('redirect')));
  }
  return null;
}
