import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Tables } from '@agendei/shared';
import { SupabaseService } from '../supabase/supabase.service';

type Appointment = Tables<'appointments'>;
export type AppointmentChange = RealtimePostgresChangesPayload<Appointment>;

// Escuta o banco via WebSocket e expõe a última mudança como signal
@Injectable({ providedIn: 'root' })
export class AppointmentsRealtime {
  private readonly supabase = inject(SupabaseService).client;
  private channel: RealtimeChannel | null = null;

  readonly lastChange = signal<AppointmentChange | null>(null);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  start(businessId: string) {
    if (this.channel) return;
    this.channel = this.supabase
      .channel(`appointments:${businessId}`)
      .on<Appointment>(
        'postgres_changes',
        // Filtro no servidor: só eventos deste negócio trafegam pela rede
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `business_id=eq.${businessId}`,
        },
        (change) => this.lastChange.set(change),
      )
      .subscribe();
  }

  stop() {
    if (this.channel) void this.supabase.removeChannel(this.channel);
    this.channel = null;
  }
}
