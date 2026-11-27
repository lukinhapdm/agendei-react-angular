import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TZDate } from '@date-fns/tz';

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const;

// "2026-12-24T08:00" no fuso do negócio → ISO em UTC para gravar no banco
export function zonedLocalToUtcIso(localDateTime: string, timeZone: string): string {
  const [date, time = '00:00'] = localDateTime.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  return new Date(new TZDate(y, m - 1, d, h, min, timeZone).getTime()).toISOString();
}

// Formata um instante do banco no fuso do negócio, independente do fuso do navegador
export function formatInZone(iso: string, timeZone: string, pattern: string): string {
  return format(new TZDate(iso, timeZone), pattern, { locale: ptBR });
}

// Postgres devolve "09:00:00"; a UI usa "09:00"
export function trimSeconds(time: string): string {
  return time.slice(0, 5);
}

// Datas "de calendário" (yyyy-MM-dd) no fuso do negócio, sem horário
export function todayInZone(timeZone: string): string {
  return format(new TZDate(Date.now(), timeZone), 'yyyy-MM-dd');
}

export function addDaysToDate(date: string, days: number): string {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

export function startOfWeekDate(date: string): string {
  return format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

export function formatDate(date: string, pattern: string): string {
  return format(parseISO(date), pattern, { locale: ptBR });
}
