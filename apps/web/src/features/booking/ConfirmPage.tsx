import { formatInZone, type BookingFormOutput } from '@agendei/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { useAuth } from '../../core/auth/auth-context';
import { formatDuration, formatPrice } from '../../shared/lib/format';
import { businessBySlugQuery, businessKeys } from '../business/data/business.queries';
import { profileKeys, ownProfileQuery } from '../profile/data/profile.queries';
import { updateOwnProfile } from '../profile/data/profile.repository';
import { BookingForm } from './components/BookingForm';
import { BookingError, bookAppointment } from './data/booking.repository';

const ERROR_MESSAGES = {
  slot_unavailable: 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.',
  service_not_found: 'Este serviço não está mais disponível.',
  unknown: 'Não foi possível confirmar. Tente novamente.',
};

export function ConfirmPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // O loader requireAuth garante a sessão antes desta página montar
  const userId = useAuth().session?.user.id ?? '';

  const businessQuery = useQuery(businessBySlugQuery(slug));
  const profileQuery = useQuery({ ...ownProfileQuery(userId), enabled: !!userId });

  const business = businessQuery.data;
  const service = business?.services.find((s) => s.id === params.get('servico'));
  const slot = params.get('horario');

  const booking = useMutation({
    mutationFn: async (values: BookingFormOutput) => {
      await updateOwnProfile(userId, { full_name: values.fullName, phone: values.phone });
      return bookAppointment(service!.id, slot!, values.notes);
    },
    onSuccess: () => {
      // Horários livres e "meus agendamentos" ficaram desatualizados
      queryClient.invalidateQueries({ queryKey: businessKeys.all });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: profileKeys.own(userId) });
      navigate('/meus-agendamentos', { state: { booked: true } });
    },
  });

  if (businessQuery.isPending || profileQuery.isPending) {
    return <p className="text-slate-500">Carregando…</p>;
  }
  if (businessQuery.isError || profileQuery.isError) {
    return <p role="alert">Não foi possível carregar os dados. Recarregue a página.</p>;
  }

  if (!business || !service || !slot) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-2xl font-bold">Agendamento incompleto</h1>
        <Link to={`/b/${slug}`} className="mt-6 inline-block text-brand-600 hover:underline">
          Escolher serviço e horário
        </Link>
      </section>
    );
  }

  const backParams = new URLSearchParams(params);
  backParams.delete('horario');
  const backTo = `/b/${slug}/agendar?${backParams}`;
  const errorCode = booking.error instanceof BookingError ? booking.error.code : 'unknown';

  return (
    <article className="mx-auto max-w-md space-y-6">
      <title>{`Confirmar agendamento · ${business.name}`}</title>
      <header>
        <Link to={backTo} className="text-sm text-brand-600 hover:underline">
          ← Trocar horário
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Confirmar agendamento</h1>
      </header>

      <dl className="space-y-1 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Local</dt>
          <dd className="font-medium">{business.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Serviço</dt>
          <dd className="font-medium">
            {service.name} · {formatDuration(service.duration_min)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Quando</dt>
          <dd className="font-medium">
            {formatInZone(slot, business.timezone, "EEE, dd/MM 'às' HH:mm")}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Valor</dt>
          <dd className="font-medium">{formatPrice(service.price_cents)}</dd>
        </div>
      </dl>

      {booking.isError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {ERROR_MESSAGES[errorCode]}{' '}
          {errorCode === 'slot_unavailable' && (
            <Link to={backTo} className="font-medium underline">
              Ver horários livres
            </Link>
          )}
        </div>
      )}

      <BookingForm
        defaultValues={{
          fullName: profileQuery.data?.full_name ?? '',
          phone: profileQuery.data?.phone ?? '',
          notes: '',
        }}
        isSubmitting={booking.isPending}
        onSubmit={(values) => booking.mutate(values)}
      />
    </article>
  );
}
