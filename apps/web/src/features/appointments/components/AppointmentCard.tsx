import { APPOINTMENT_STATUS_LABEL, formatInZone } from '@agendei/shared';
import { useState } from 'react';
import { Link } from 'react-router';
import { formatPrice } from '../../../shared/lib/format';
import type { MyAppointment } from '../data/appointments.repository';

const STATUS_CLASS: Record<MyAppointment['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  completed: 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-slate-200',
};

interface AppointmentCardProps {
  appointment: MyAppointment;
  canCancel: boolean;
  onCancel: (id: string) => void;
}

export function AppointmentCard({ appointment, canCancel, onCancel }: AppointmentCardProps) {
  const [confirming, setConfirming] = useState(false);
  const { business, service } = appointment;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {formatInZone(appointment.starts_at, business.timezone, "EEE, dd/MM/yyyy 'às' HH:mm")}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {/* Serviço pausado some do embed pelo RLS público */}
            {service
              ? `${service.name} · ${formatPrice(service.price_cents)}`
              : 'Serviço indisponível'}{' '}
            ·{' '}
            <Link to={`/b/${business.slug}`} className="text-brand-600 hover:underline">
              {business.name}
            </Link>
          </p>
          {appointment.notes && (
            <p className="mt-1 text-sm text-slate-500">“{appointment.notes}”</p>
          )}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[appointment.status]}`}
        >
          {APPOINTMENT_STATUS_LABEL[appointment.status]}
        </span>
      </div>

      {canCancel && (
        <div className="mt-3 flex items-center justify-end gap-2 text-sm">
          {confirming ? (
            <>
              <span>Cancelar este horário?</span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Não
              </button>
              <button
                type="button"
                onClick={() => onCancel(appointment.id)}
                className="rounded-lg bg-red-600 px-3 py-1 font-medium text-white hover:bg-red-700"
              >
                Sim, cancelar
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-lg px-3 py-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Cancelar
            </button>
          )}
        </div>
      )}
    </li>
  );
}
