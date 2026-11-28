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

export type BookingErrorCode = 'slot_unavailable' | 'service_not_found' | 'unknown';

export class BookingError extends Error {
  readonly code: BookingErrorCode;

  constructor(code: BookingErrorCode) {
    super(code);
    this.code = code;
  }
}

// As exceções da RPC chegam como mensagem; convertemos para um código tipado
export async function bookAppointment(serviceId: string, startsAt: string, notes: string) {
  const { data, error } = await supabase.rpc('book_appointment', {
    p_service_id: serviceId,
    p_starts_at: startsAt,
    p_notes: notes || undefined,
  });

  if (error) {
    const known = ['slot_unavailable', 'service_not_found'] as const;
    throw new BookingError(known.find((c) => error.message.includes(c)) ?? 'unknown');
  }
  return data;
}
