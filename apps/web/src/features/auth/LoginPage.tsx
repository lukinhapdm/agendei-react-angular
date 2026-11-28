import { isAuthApiError } from '@supabase/supabase-js';
import { useActionState } from 'react';
import { useSearchParams } from 'react-router';
import { safeRedirectPath } from '../../shared/lib/redirect';
import { sendMagicLink } from './data/auth.repository';

type LoginState =
  { status: 'idle' } | { status: 'sent'; email: string } | { status: 'error'; message: string };

function errorMessage(error: unknown): string {
  if (isAuthApiError(error) && error.code === 'over_email_send_rate_limit') {
    return 'Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo.';
  }
  return 'Não foi possível enviar o link. Tente novamente.';
}

export function LoginPage() {
  const [params] = useSearchParams();
  const redirectPath = safeRedirectPath(params.get('redirect'));

  // A action recebe o FormData do <form>; isPending fica true enquanto ela roda
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    async (_prev, formData) => {
      const email = String(formData.get('email')).trim();
      try {
        await sendMagicLink(email, redirectPath);
        return { status: 'sent', email };
      } catch (error) {
        return { status: 'error', message: errorMessage(error) };
      }
    },
    { status: 'idle' },
  );

  if (state.status === 'sent') {
    return (
      <section className="mx-auto max-w-sm py-12 text-center" aria-live="polite">
        <title>Verifique seu e-mail · Agendei</title>
        <h1 className="text-2xl font-bold">Verifique seu e-mail</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Enviamos um link de acesso para <strong>{state.email}</strong>. Abra-o neste mesmo
          navegador.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-sm py-12">
      <title>Entrar · Agendei</title>
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Sem senha: enviamos um link de acesso para o seu e-mail.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {state.status === 'error' && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {isPending ? 'Enviando…' : 'Enviar link de acesso'}
        </button>
      </form>
    </section>
  );
}
