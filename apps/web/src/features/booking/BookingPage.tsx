import { formatInZone, todayInZone } from '@agendei/shared';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import { useAuth } from '../../core/auth/auth-context';
import { nextDays, weekdayOf } from '../../shared/lib/date';
import { formatDuration, formatPrice } from '../../shared/lib/format';
import { businessBySlugQuery } from '../business/data/business.queries';
import { DatePicker } from './components/DatePicker';
import { SlotGrid } from './components/SlotGrid';

const DAYS_AHEAD = 14;

export function BookingPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const { data: business, isPending, isError } = useQuery(businessBySlugQuery(slug));
  const { session } = useAuth();
  const location = useLocation();

  if (isPending) return <p className="text-slate-500">Carregando…</p>;
  if (isError) return <p role="alert">Não foi possível carregar o negócio.</p>;

  const service = business?.services.find((s) => s.id === params.get('servico'));
  if (!business || !service) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Serviço não encontrado</h1>
        <Link to={`/b/${slug}`} className="mt-6 inline-block text-brand-600 hover:underline">
          Ver serviços disponíveis
        </Link>
      </section>
    );
  }

  const openWeekdays = new Set(business.working_hours.map((h) => h.weekday));
  const days = nextDays(todayInZone(business.timezone), DAYS_AHEAD);
  const openDays = days.filter((d) => openWeekdays.has(weekdayOf(d)));
  // Data inválida, passada ou fechada na URL cai no primeiro dia aberto
  const requested = params.get('data');
  const date = requested && openDays.includes(requested) ? requested : openDays[0];
  const slot = params.get('horario');

  // replace evita uma entrada no histórico a cada clique de data ou horário
  const update = (changes: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          if (value === null) next.delete(key);
          else next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );

  return (
    <article className="space-y-8">
      <title>{`Agendar ${service.name} · ${business.name}`}</title>
      <header>
        <Link to={`/b/${slug}`} className="text-sm text-brand-600 hover:underline">
          ← {business.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{service.name}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {formatDuration(service.duration_min)} · {formatPrice(service.price_cents)}
        </p>
      </header>

      <section aria-labelledby="date-title">
        <h2 id="date-title" className="mb-3 text-lg font-semibold">
          Escolha o dia
        </h2>
        <DatePicker
          days={days}
          value={date}
          openWeekdays={openWeekdays}
          onChange={(d) => update({ data: d, horario: null })}
        />
      </section>

      <section aria-labelledby="slot-title">
        <h2 id="slot-title" className="mb-3 text-lg font-semibold">
          Escolha o horário
        </h2>
        {date ? (
          <SlotGrid
            businessId={business.id}
            serviceId={service.id}
            date={date}
            timeZone={business.timezone}
            value={slot}
            onChange={(s) => update({ data: date, horario: s })}
          />
        ) : (
          <p className="text-slate-500">Sem dias de atendimento nas próximas duas semanas.</p>
        )}
      </section>

      {slot && (
        <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm">
            <span className="font-semibold">
              {formatInZone(slot, business.timezone, "EEEE, dd 'de' MMMM 'às' HH:mm")}
            </span>
          </p>
          {session ? (
            <button
              type="button"
              disabled
              title="A confirmação chega na etapa 4.6"
              className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white disabled:opacity-50"
            >
              Continuar
            </button>
          ) : (
            <Link
              to={`/entrar?redirect=${encodeURIComponent(location.pathname + location.search)}`}
              className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
            >
              Entrar para continuar
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
