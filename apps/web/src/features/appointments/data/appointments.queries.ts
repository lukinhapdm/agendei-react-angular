import { queryOptions } from '@tanstack/react-query';
import { listMyAppointments } from './appointments.repository';

export const appointmentKeys = {
  all: ['appointments'] as const,
  mine: (userId: string) => [...appointmentKeys.all, 'mine', userId] as const,
};

export const myAppointmentsQuery = (userId: string) =>
  queryOptions({
    queryKey: appointmentKeys.mine(userId),
    queryFn: () => listMyAppointments(userId),
  });
