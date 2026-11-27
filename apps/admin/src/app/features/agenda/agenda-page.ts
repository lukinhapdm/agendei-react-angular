import { Component, computed, inject, resource, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  type AppointmentStatus,
  addDaysToDate,
  formatDate,
  formatInZone,
  startOfWeekDate,
  todayInZone,
  zonedLocalToUtcIso,
} from '@agendei/shared';
import { BusinessStore } from '../../core/business/business.store';
import { AppointmentCard } from './components/appointment-card';
import { AgendaRepository, type AgendaItem } from './data/agenda.repository';

type ViewMode = 'day' | 'week';

@Component({
  selector: 'app-agenda-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    AppointmentCard,
  ],
  templateUrl: './agenda-page.html',
  styleUrl: './agenda-page.scss',
})
export class AgendaPage {
  private readonly repository = inject(AgendaRepository);
  private readonly business = inject(BusinessStore).business()!;
  private readonly snackBar = inject(MatSnackBar);

  protected readonly timeZone = this.business.timezone;
  protected readonly today = todayInZone(this.timeZone);
  protected readonly view = signal<ViewMode>('day');
  protected readonly anchor = signal(this.today);

  // Datas visíveis (yyyy-MM-dd) derivadas do modo e da data âncora
  protected readonly days = computed(() => {
    if (this.view() === 'day') return [this.anchor()];
    const monday = startOfWeekDate(this.anchor());
    return Array.from({ length: 7 }, (_, i) => addDaysToDate(monday, i));
  });

  protected readonly title = computed(() => {
    const days = this.days();
    return days.length === 1
      ? formatDate(days[0], "EEEE, d 'de' MMMM")
      : `${formatDate(days[0], 'd MMM')} – ${formatDate(days[6], 'd MMM yyyy')}`;
  });

  // resource recarrega sozinho sempre que o intervalo de datas muda
  protected readonly appointments = resource({
    params: () => {
      const days = this.days();
      return {
        from: zonedLocalToUtcIso(`${days[0]}T00:00`, this.timeZone),
        to: zonedLocalToUtcIso(`${addDaysToDate(days[days.length - 1], 1)}T00:00`, this.timeZone),
      };
    },
    loader: ({ params }) => this.repository.listBetween(this.business.id, params.from, params.to),
    defaultValue: [],
  });

  protected readonly byDay = computed(() => {
    const groups = new Map<string, AgendaItem[]>(this.days().map((d) => [d, []]));
    for (const item of this.appointments.value()) {
      groups.get(formatInZone(item.starts_at, this.timeZone, 'yyyy-MM-dd'))?.push(item);
    }
    return [...groups].map(([date, items]) => ({ date, items }));
  });

  protected dayLabel(date: string): string {
    return formatDate(date, 'EEE dd/MM');
  }

  move(direction: 1 | -1) {
    this.anchor.update((d) => addDaysToDate(d, direction * (this.view() === 'day' ? 1 : 7)));
  }

  goToday() {
    this.anchor.set(this.today);
  }

  async changeStatus(item: AgendaItem, status: AppointmentStatus) {
    try {
      await this.repository.updateStatus(item.id, status);
      this.appointments.reload();
    } catch {
      this.snackBar.open('Não foi possível alterar o status.', 'OK', { duration: 5000 });
    }
  }
}
