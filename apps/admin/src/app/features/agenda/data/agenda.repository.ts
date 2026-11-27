import { Injectable, inject } from '@angular/core';
import type { AppointmentStatus } from '@agendei/shared';
import { SupabaseService } from '../../../core/supabase/supabase.service';

// Embeds do PostgREST: traz serviço e cliente na mesma consulta, seguindo as FKs
const AGENDA_SELECT = `
  id, starts_at, ends_at, status, notes,
  service:services ( name, price_cents ),
  customer:profiles ( full_name, phone )
`;

@Injectable({ providedIn: 'root' })
export class AgendaRepository {
  private readonly supabase = inject(SupabaseService).client;

  async listBetween(businessId: string, fromIso: string, toIso: string) {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(AGENDA_SELECT)
      .eq('business_id', businessId)
      .gte('starts_at', fromIso)
      .lt('starts_at', toIso)
      .order('starts_at');
    if (error) throw error;
    return data;
  }

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const { error } = await this.supabase.from('appointments').update({ status }).eq('id', id);
    if (error) throw error;
  }
}

// Tipo inferido do select acima: muda sozinho se o select mudar
export type AgendaItem = Awaited<ReturnType<AgendaRepository['listBetween']>>[number];
