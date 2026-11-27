import { Injectable, inject } from '@angular/core';
import type { DashboardMetrics } from '@agendei/shared';
import { SupabaseService } from '../../../core/supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class DashboardRepository {
  private readonly supabase = inject(SupabaseService).client;

  async getMetrics(businessId: string): Promise<DashboardMetrics> {
    const { data, error } = await this.supabase.rpc('get_dashboard_metrics', {
      p_business_id: businessId,
    });
    if (error) throw error;
    // jsonb chega como Json genérico; o formato é garantido pela RPC
    return data as unknown as DashboardMetrics;
  }
}
