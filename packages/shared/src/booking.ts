import { z } from 'zod';

export const bookingFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo')
    .max(100, 'Use no máximo 100 caracteres'),
  // Aceita qualquer máscara e grava só os dígitos (DDD + número)
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .pipe(z.string().regex(/^\d{10,11}$/, 'Informe DDD + número, ex.: (11) 98888-0000')),
  notes: z.string().trim().max(500, 'Use no máximo 500 caracteres'),
});

// input = o que o formulário digita; output = o que vai para o banco já tratado
export type BookingFormInput = z.input<typeof bookingFormSchema>;
export type BookingFormOutput = z.output<typeof bookingFormSchema>;
