import { Injectable } from '@angular/core';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@agendei/shared';
import { env } from '../../../environments/env';

// providedIn: 'root' cria uma única instância compartilhada pelo app inteiro
@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient<Database> = createClient<Database>(
    env.supabaseUrl,
    env.supabasePublishableKey,
  );
}
