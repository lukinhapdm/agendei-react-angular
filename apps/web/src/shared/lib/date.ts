import { addDaysToDate } from '@agendei/shared';

// Data de calendário sem fuso; meio-dia evita virar o dia em qualquer fuso do navegador
export const weekdayOf = (date: string) => new Date(`${date}T12:00:00`).getDay();

export const nextDays = (from: string, count: number) =>
  Array.from({ length: count }, (_, i) => addDaysToDate(from, i));
