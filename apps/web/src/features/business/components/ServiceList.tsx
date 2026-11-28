import { Link } from 'react-router';
import { formatDuration, formatPrice } from '../../../shared/lib/format';
import type { PublicService } from '../data/business.repository';

export function ServiceList({ services }: { services: PublicService[] }) {
  if (!services.length) {
    return <p className="text-slate-500">Nenhum serviço disponível no momento.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => (
        <li key={service.id}>
          <Link
            to={`agendar?servico=${service.id}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-600 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <h3 className="font-semibold">{service.name}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {formatDuration(service.duration_min)} · {formatPrice(service.price_cents)}
              </p>
            </div>
            <span className="text-sm font-medium text-brand-600">Agendar</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
