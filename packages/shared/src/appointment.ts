import { Constants, type Enums } from './database.types';

// Vem direto do enum do banco: se o banco mudar, o TypeScript acusa aqui
export const APPOINTMENT_STATUSES = Constants.public.Enums.appointment_status;

export type AppointmentStatus = Enums<'appointment_status'>;

// Rótulos em pt-BR usados na UI dos dois apps
export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
};
