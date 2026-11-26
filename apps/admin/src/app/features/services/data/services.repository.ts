import { Injectable, inject } from '@angular/core';
import type { Tables, TablesInsert, TablesUpdate } from '@agendei/shared';
import { SupabaseService } from '../../../core/supabase/supabase.service';

export type Service = Tables<'services'>;
export type NewService = TablesInsert<'services'>;
export type ServiceChanges = TablesUpdate<'services'>;

// Único ponto da feature que conversa com o banco; a página não conhece o Supabase
@Injectable({ providedIn: 'root' })
export class ServicesRepository {
  private readonly supabase = inject(SupabaseService).client;

  async listByBusiness(businessId: string): Promise<Service[]> {
    const { data, error } = await this.supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('active', { ascending: false })
      .order('name');
    if (error) throw error;
    return data;
  }

  async create(input: NewService): Promise<void> {
    const { error } = await this.supabase.from('services').insert(input);
    if (error) throw error;
  }

  async update(id: string, changes: ServiceChanges): Promise<void> {
    const { error } = await this.supabase.from('services').update(changes).eq('id', id);
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.from('services').delete().eq('id', id);
    // 23503 = foreign_key_violation: o serviço já tem agendamentos
    if (error) throw new Error(error.code === '23503' ? 'service_in_use' : error.message);
  }
}
