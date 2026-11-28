import { supabase } from '../../../core/supabase/client';

export async function listMyAppointments(userId: string) {
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `id, starts_at, status, notes,
       service:services ( name, duration_min, price_cents ),
       business:businesses ( name, slug, timezone )`,
    )
    .eq('customer_id', userId)
    .order('starts_at');

  if (error) throw error;
  return data;
}

export type MyAppointment = Awaited<ReturnType<typeof listMyAppointments>>[number];

export async function cancelAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .select('id');

  if (error) throw error;
  // RLS barra o update sem erro: só retorna 0 linhas afetadas
  if (!data.length) throw new Error('not_allowed');
}
