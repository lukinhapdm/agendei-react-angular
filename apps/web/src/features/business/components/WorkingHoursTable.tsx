import { WEEKDAY_LABELS, trimSeconds } from '@agendei/shared';
import type { PublicWorkingHour } from '../data/business.repository';

// Semana começando na segunda, como no admin
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function WorkingHoursTable({ hours }: { hours: PublicWorkingHour[] }) {
  return (
    <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {WEEK_ORDER.map((weekday) => {
        const ranges = hours.filter((h) => h.weekday === weekday);
        return (
          <div key={weekday} className="flex justify-between px-4 py-2 text-sm">
            <dt className="font-medium">{WEEKDAY_LABELS[weekday]}</dt>
            <dd className={ranges.length ? '' : 'text-slate-500'}>
              {ranges.length
                ? ranges
                    .map((r) => `${trimSeconds(r.start_time)}–${trimSeconds(r.end_time)}`)
                    .join(', ')
                : 'Fechado'}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
