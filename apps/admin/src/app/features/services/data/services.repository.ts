import { Injectable, inject } from '@angular/core';
import type { Tables } from '@agendei/shared';
import { SupabaseService } from '../../../core/supabase/supabase.service';

export type Service = Tables<'services'>;

// Único ponto da feature que conversa com o banco; a página não conhece o Supabase
@Injectable({ providedIn: 'root' })
export class ServicesRepository {
  private readonly supabase = inject(SupabaseService).client;

  async list(): Promise<Service[]> {
    const { data, error } = await this.supabase.from('services').select('*').order('name');
    if (error) throw error;
    return data;
  }
}
