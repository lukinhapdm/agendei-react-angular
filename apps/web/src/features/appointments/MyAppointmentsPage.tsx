import { useLocation } from 'react-router';

export function MyAppointmentsPage() {
  const booked = (useLocation().state as { booked?: boolean } | null)?.booked;

  return (
    <section className="space-y-4">
      {booked && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-300"
        >
          Agendamento confirmado! Você receberá a confirmação do estabelecimento.
        </p>
      )}
      <h1 className="text-2xl font-bold">Meus agendamentos</h1>
      <p className="text-slate-600 dark:text-slate-300">Lista e cancelamento chegam na 4.7.</p>
    </section>
  );
}
