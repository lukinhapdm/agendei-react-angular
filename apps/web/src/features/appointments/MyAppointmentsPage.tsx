import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../../core/auth/auth-context';
import { businessKeys } from '../business/data/business.queries';
import { AppointmentCard } from './components/AppointmentCard';
import { myAppointmentsQuery } from './data/appointments.queries';
import { cancelAppointment, type MyAppointment } from './data/appointments.repository';

const ACTIVE = new Set<MyAppointment['status']>(['pending', 'confirmed']);

export function MyAppointmentsPage() {
  const booked = (useLocation().state as { booked?: boolean } | null)?.booked;
  // O loader requireAuth garante a sessão antes desta página montar
  const userId = useAuth().session?.user.id ?? '';
  const queryClient = useQueryClient();
  const options = myAppointmentsQuery(userId);
  const query = useQuery({ ...options, enabled: !!userId });
  // A chave vinda de queryOptions carrega o tipo dos dados para get/setQueryData
  const key = options.queryKey;

  const cancel = useMutation({
    mutationFn: cancelAppointment,
    // Otimista: marca como cancelado na hora e guarda o estado anterior para desfazer
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (list) =>
        list?.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a)),
      );
      return { previous };
    },
    onError: (_error, _id, context) => queryClient.setQueryData(key, context?.previous),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
      // O horário volta a ficar livre na vitrine
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });

  const now = new Date().toISOString();
  const all = query.data ?? [];
  const upcoming = all.filter((a) => a.starts_at >= now && ACTIVE.has(a.status));
  const history = all.filter((a) => !upcoming.includes(a)).reverse();

  return (
    <section className="space-y-6">
      <title>Meus agendamentos · Agendei</title>
      {booked && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300"
        >
          Agendamento confirmado! Você receberá a confirmação do estabelecimento.
        </p>
      )}
      {cancel.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          Não foi possível cancelar. Tente novamente.
        </p>
      )}

      <h1 className="text-2xl font-bold">Meus agendamentos</h1>

      {query.isPending ? (
        <p className="text-slate-500">Carregando…</p>
      ) : query.isError ? (
        <p role="alert">Não foi possível carregar seus agendamentos.</p>
      ) : !all.length ? (
        <div className="py-8 text-center">
          <p className="text-slate-600 dark:text-slate-300">Você ainda não tem agendamentos.</p>
          <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
            Encontrar um horário
          </Link>
        </div>
      ) : (
        <>
          <AppointmentList
            title="Próximos"
            empty="Nenhum agendamento futuro."
            items={upcoming}
            canCancel
            onCancel={(id) => cancel.mutate(id)}
          />
          {history.length > 0 && (
            <AppointmentList title="Histórico" items={history} onCancel={() => {}} />
          )}
        </>
      )}
    </section>
  );
}

interface AppointmentListProps {
  title: string;
  items: MyAppointment[];
  empty?: string;
  canCancel?: boolean;
  onCancel: (id: string) => void;
}

function AppointmentList({
  title,
  items,
  empty,
  canCancel = false,
  onCancel,
}: AppointmentListProps) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {items.length ? (
        <ul className="space-y-3">
          {items.map((a) => (
            <AppointmentCard key={a.id} appointment={a} canCancel={canCancel} onCancel={onCancel} />
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">{empty}</p>
      )}
    </div>
  );
}
