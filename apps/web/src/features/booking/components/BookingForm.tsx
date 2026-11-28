import { bookingFormSchema, type BookingFormInput, type BookingFormOutput } from '@agendei/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

interface BookingFormProps {
  defaultValues: BookingFormInput;
  isSubmitting: boolean;
  onSubmit: (values: BookingFormOutput) => void;
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-600 focus:outline-none aria-invalid:border-red-500 dark:border-slate-700 dark:bg-slate-900';

export function BookingForm({ defaultValues, isSubmitting, onSubmit }: BookingFormProps) {
  // Terceiro genérico = tipo já transformado pelo Zod que chega no onSubmit
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormInput, unknown, BookingFormOutput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Nome completo
        </label>
        <input
          id="fullName"
          autoComplete="name"
          aria-invalid={!!errors.fullName}
          aria-describedby="fullName-error"
          className={inputClass}
          {...register('fullName')}
        />
        <p id="fullName-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.fullName?.message}
        </p>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Telefone (WhatsApp)
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(11) 98888-0000"
          aria-invalid={!!errors.phone}
          aria-describedby="phone-error"
          className={inputClass}
          {...register('phone')}
        />
        <p id="phone-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.phone?.message}
        </p>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium">
          Observações <span className="font-normal text-slate-500">(opcional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          aria-invalid={!!errors.notes}
          aria-describedby="notes-error"
          className={inputClass}
          {...register('notes')}
        />
        <p id="notes-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors.notes?.message}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {isSubmitting ? 'Confirmando…' : 'Confirmar agendamento'}
      </button>
    </form>
  );
}
