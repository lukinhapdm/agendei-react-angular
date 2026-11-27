import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;

  // undefined = ainda verificando; null = deslogado
  private readonly session = signal<Session | null | undefined>(undefined);

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.session());

  // Guards aguardam esta promise para não decidir antes de ler a sessão salva
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.supabase.auth.getSession().then(({ data }) => {
      this.session.set(data.session);
    });

    // Mantém o signal em dia com login, logout e renovação do token
    this.supabase.auth.onAuthStateChange((_event, session) => this.session.set(session));
  }

  async signIn(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    // O painel é só para donos; clientes usam o app web
    if (profile?.role !== 'owner') {
      await this.signOut();
      throw new Error('not_owner');
    }
  }

  // Retorna true se a sessão já foi criada; false se o Supabase exige confirmar o e-mail
  async signUp(fullName: string, email: string, password: string): Promise<boolean> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'owner' },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    // Com confirmação de e-mail ligada, o Supabase não dá erro para e-mail repetido:
    // devolve um usuário "falso" sem identidades, para não revelar quem já tem conta
    if (data.user?.identities?.length === 0) throw new Error('User already registered');
    return !!data.session;
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
  }
}
