import { BR_TIMEZONES } from '@agendei/shared';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { ServiceList } from './components/ServiceList';
import { WorkingHoursTable } from './components/WorkingHoursTable';
import { businessBySlugQuery } from './data/business.queries';

export function BusinessPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: business, isPending, isError, refetch } = useQuery(businessBySlugQuery(slug));

  if (isPending) {
    return (
      <div className="animate-pulse space-y-4" aria-label="Carregando">
        <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-24 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert">
        <p>Não foi possível carregar o negócio.</p>
        <button onClick={() => refetch()} className="mt-2 text-brand-600 hover:underline">
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!business) {
    return (
      <section className="py-16 text-center">
        <title>Negócio não encontrado · Agendei</title>
        <h1 className="text-2xl font-bold">Negócio não encontrado</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Confira se o link está correto.</p>
      </section>
    );
  }

  const zoneLabel = BR_TIMEZONES.find((z) => z.value === business.timezone)?.label;

  return (
    <article className="space-y-8">
      <title>{`${business.name} · Agendei`}</title>
      <h1 className="text-3xl font-bold">{business.name}</h1>

      <section aria-labelledby="services-title">
        <h2 id="services-title" className="mb-3 text-lg font-semibold">
          Serviços
        </h2>
        <ServiceList services={business.services} />
      </section>

      <section aria-labelledby="hours-title">
        <h2 id="hours-title" className="mb-3 text-lg font-semibold">
          Horário de funcionamento
        </h2>
        <WorkingHoursTable hours={business.working_hours} />
        {zoneLabel && <p className="mt-2 text-xs text-slate-500">Fuso: {zoneLabel}</p>}
      </section>
    </article>
  );
}
