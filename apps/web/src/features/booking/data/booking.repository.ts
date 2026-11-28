import { supabase } from '../../../core/supabase/client';

export interface Slot {
  slot_start: string;
  slot_end: string;
}

export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  date: string,
): Promise<Slot[]> {
  const { data, error } = await supabase.rpc('get_available_slots', {
    p_business_id: businessId,
    p_service_id: serviceId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}
