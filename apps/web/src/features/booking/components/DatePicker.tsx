import { formatDate } from '@agendei/shared';
import { weekdayOf } from '../../../shared/lib/date';

interface DatePickerProps {
  days: string[];
  value: string;
  openWeekdays: Set<number>;
  onChange: (date: string) => void;
}

export function DatePicker({ days, value, openWeekdays, onChange }: DatePickerProps) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2" role="radiogroup" aria-label="Data">
      {days.map((date) => {
        const closed = !openWeekdays.has(weekdayOf(date));
        const selected = date === value;
        return (
          <button
            key={date}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={closed}
            onClick={() => onChange(date)}
            className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2 text-sm ${
              selected
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-slate-200 bg-white hover:border-brand-600 dark:border-slate-800 dark:bg-slate-900'
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200`}
          >
            <span className="text-xs uppercase">{formatDate(date, 'EEEE').slice(0, 3)}</span>
            <span className="text-lg font-semibold">{formatDate(date, 'dd')}</span>
            <span className="text-xs">{formatDate(date, 'MMM')}</span>
          </button>
        );
      })}
    </div>
  );
}
