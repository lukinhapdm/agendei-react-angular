import { describe, expect, it } from 'vitest';
import { bookingFormSchema } from './booking';

const valid = { fullName: 'Carla Cliente', phone: '11988880000', notes: '' };

describe('bookingFormSchema', () => {
  it('normaliza nome, telefone e observações', () => {
    const result = bookingFormSchema.parse({
      fullName: '  Carla Cliente ',
      phone: '(11) 98888-0000',
      notes: '  Sem máquina  ',
    });

    expect(result).toEqual({
      fullName: 'Carla Cliente',
      phone: '11988880000',
      notes: 'Sem máquina',
    });
  });

  it.each(['1133334444', '(11) 3333-4444', '11 9 8888 0000'])('aceita o telefone %s', (phone) => {
    expect(bookingFormSchema.safeParse({ ...valid, phone }).success).toBe(true);
  });

  it.each(['', '988880000', '119888800001', 'abc'])('rejeita o telefone "%s"', (phone) => {
    const result = bookingFormSchema.safeParse({ ...valid, phone });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(['phone']);
  });

  it('rejeita nome curto mesmo com espaços em volta', () => {
    const result = bookingFormSchema.safeParse({ ...valid, fullName: '  Al  ' });

    expect(result.error?.issues[0].message).toBe('Informe seu nome completo');
  });

  it('limita observações a 500 caracteres', () => {
    expect(bookingFormSchema.safeParse({ ...valid, notes: 'a'.repeat(500) }).success).toBe(true);
    expect(bookingFormSchema.safeParse({ ...valid, notes: 'a'.repeat(501) }).success).toBe(false);
  });
});
