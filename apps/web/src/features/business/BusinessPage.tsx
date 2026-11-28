import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { businessBySlugQuery } from './data/business.queries';

export function BusinessPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: business, isPending, isError, refetch } = useQuery(businessBySlugQuery(slug));

  if (isPending) return <p className="text-slate-500">Carregando…</p>;

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

  if (!business) return <h1 className="text-2xl font-bold">Negócio não encontrado</h1>;

  return (
    <section>
      <h1 className="text-2xl font-bold">{business.name}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Serviços e horários chegam na 4.3.</p>
    </section>
  );
}
