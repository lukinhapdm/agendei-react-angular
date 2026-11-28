import { formatInZone } from '@agendei/shared';
import { useQuery } from '@tanstack/react-query';
import { slotsQuery } from '../data/booking.queries';

interface SlotGridProps {
  businessId: string;
  serviceId: string;
  date: string;
  timeZone: string;
  value: string | null;
  onChange: (slotStart: string) => void;
}

export function SlotGrid({
  businessId,
  serviceId,
  date,
  timeZone,
  value,
  onChange,
}: SlotGridProps) {
  const {
    data: slots,
    isPending,
    isError,
    refetch,
  } = useQuery(slotsQuery(businessId, serviceId, date));

  if (isPending) {
    return (
      <div className="grid animate-pulse grid-cols-4 gap-2 sm:grid-cols-6" aria-label="Carregando">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert">
        <p>Não foi possível carregar os horários.</p>
        <button onClick={() => refetch()} className="mt-2 text-brand-600 hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!slots.length) return <p className="text-slate-500">Sem horários livres neste dia.</p>;

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6" role="radiogroup" aria-label="Horário">
      {slots.map(({ slot_start }) => {
        const selected = slot_start === value;
        return (
          <button
            key={slot_start}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(slot_start)}
            className={`rounded-lg border py-2 text-sm font-medium ${
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-200 bg-white hover:border-brand-600 dark:border-slate-800 dark:bg-slate-900'
            }`}
          >
            {formatInZone(slot_start, timeZone, 'HH:mm')}
          </button>
        );
      })}
    </div>
  );
}
