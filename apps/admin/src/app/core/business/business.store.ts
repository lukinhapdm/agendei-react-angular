import { Injectable, inject, signal } from '@angular/core';
import type { Tables, TablesInsert } from '@agendei/shared';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from '../auth/auth.service';

export type Business = Tables<'businesses'>;
export type NewBusiness = Omit<TablesInsert<'businesses'>, 'owner_id'>;

// Estado do negócio do dono logado, compartilhado por todas as features
@Injectable({ providedIn: 'root' })
export class BusinessStore {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  readonly business = signal<Business | null>(null);
  // Evita refazer a consulta a cada navegação, mas recarrega se o usuário mudar
  private loadedForUserId: string | null = null;

  async ensureLoaded(): Promise<Business | null> {
    // Guards da mesma rota rodam em paralelo; sem isto o usuário ainda pode estar indefinido
    await this.auth.ready;
    const userId = this.auth.user()?.id ?? null;
    if (!userId) {
      this.business.set(null);
      this.loadedForUserId = null;
      return null;
    }
    if (this.loadedForUserId === userId) return this.business();

    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', userId)
      .maybeSingle();
    if (error) throw error;

    this.business.set(data);
    this.loadedForUserId = userId;
    return data;
  }

  async create(input: NewBusiness): Promise<Business> {
    const ownerId = this.auth.user()?.id;
    if (!ownerId) throw new Error('not_authenticated');

    const { data, error } = await this.supabase
      .from('businesses')
      .insert({ ...input, owner_id: ownerId })
      .select()
      .single();
    // 23505 = unique_violation (slug já usado)
    if (error) throw new Error(error.code === '23505' ? 'slug_taken' : error.message);

    this.business.set(data);
    this.loadedForUserId = ownerId;
    return data;
  }
}
