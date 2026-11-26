import { Injectable, inject } from '@angular/core';
import type { Tables } from '@agendei/shared';
import { SupabaseService } from '../../../core/supabase/supabase.service';

export type WorkingHour = Tables<'working_hours'>;
export type TimeOff = Tables<'time_off'>;
export type WorkingHourInput = Pick<WorkingHour, 'weekday' | 'start_time' | 'end_time'>;
export type TimeOffInput = Pick<TimeOff, 'starts_at' | 'ends_at' | 'reason'>;

@Injectable({ providedIn: 'root' })
export class ScheduleRepository {
  private readonly supabase = inject(SupabaseService).client;

  async listWorkingHours(businessId: string): Promise<WorkingHour[]> {
    const { data, error } = await this.supabase
      .from('working_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('weekday')
      .order('start_time');
    if (error) throw error;
    return data;
  }

  // Uma chamada só, para não deixar a agenda pela metade se algo falhar no meio
  async replaceWorkingHours(businessId: string, hours: WorkingHourInput[]): Promise<void> {
    const { error } = await this.supabase.rpc('replace_working_hours', {
      p_business_id: businessId,
      p_hours: hours,
    });
    if (error) throw error;
  }

  async listUpcomingTimeOff(businessId: string): Promise<TimeOff[]> {
    const { data, error } = await this.supabase
      .from('time_off')
      .select('*')
      .eq('business_id', businessId)
      .gte('ends_at', new Date().toISOString())
      .order('starts_at');
    if (error) throw error;
    return data;
  }

  async createTimeOff(businessId: string, input: TimeOffInput): Promise<void> {
    const { error } = await this.supabase
      .from('time_off')
      .insert({ ...input, business_id: businessId });
    if (error) throw error;
  }

  async deleteTimeOff(id: string): Promise<void> {
    const { error } = await this.supabase.from('time_off').delete().eq('id', id);
    if (error) throw error;
  }
}
