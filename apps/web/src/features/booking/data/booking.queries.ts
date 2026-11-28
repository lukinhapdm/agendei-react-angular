import { queryOptions } from '@tanstack/react-query';
import { businessKeys } from '../../business/data/business.queries';
import { getAvailableSlots } from './booking.repository';

export const slotsQuery = (businessId: string, serviceId: string, date: string) =>
  queryOptions({
    queryKey: [...businessKeys.all, businessId, 'slots', serviceId, date] as const,
    queryFn: () => getAvailableSlots(businessId, serviceId, date),
    // Horários livres mudam quando outra pessoa agenda; sempre revalida ao voltar
    staleTime: 0,
  });
