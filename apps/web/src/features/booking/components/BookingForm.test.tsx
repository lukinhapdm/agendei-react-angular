import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingForm } from './BookingForm';

function setup(defaults = { fullName: '', phone: '', notes: '' }) {
  const onSubmit = vi.fn();
  render(<BookingForm defaultValues={defaults} isSubmitting={false} onSubmit={onSubmit} />);
  return { onSubmit, user: userEvent.setup() };
}

describe('BookingForm', () => {
  it('mostra os erros e não envia com campos vazios', async () => {
    const { onSubmit, user } = setup();

    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }));

    expect(await screen.findByText('Informe seu nome completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Telefone (WhatsApp)')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia os valores já tratados pelo schema', async () => {
    const { onSubmit, user } = setup();

    await user.type(screen.getByLabelText('Nome completo'), ' Carla Cliente ');
    await user.type(screen.getByLabelText('Telefone (WhatsApp)'), '(11) 98888-0000');
    await user.click(screen.getByRole('button', { name: 'Confirmar agendamento' }));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toEqual({
      fullName: 'Carla Cliente',
      phone: '11988880000',
      notes: '',
    });
  });

  it('vem preenchido com os dados do profile', () => {
    setup({ fullName: 'Carla Cliente', phone: '11988880000', notes: '' });

    expect(screen.getByLabelText('Nome completo')).toHaveValue('Carla Cliente');
  });

  it('bloqueia o botão enquanto envia', () => {
    render(
      <BookingForm
        defaultValues={{ fullName: '', phone: '', notes: '' }}
        isSubmitting
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Confirmando…' })).toBeDisabled();
  });
});
