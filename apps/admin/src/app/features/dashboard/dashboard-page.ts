import { Component, computed, effect, inject, resource, untracked } from '@angular/core';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BusinessStore } from '../../core/business/business.store';
import { AppointmentsRealtime } from '../../core/realtime/appointments-realtime.service';
import { DailyChart } from './components/daily-chart';
import { DashboardRepository } from './data/dashboard.repository';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, PercentPipe, MatCardModule, MatProgressBarModule, DailyChart],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly repository = inject(DashboardRepository);
  private readonly businessId = inject(BusinessStore).business()!.id;

  protected readonly metrics = resource({
    loader: () => this.repository.getMetrics(this.businessId),
  });

  // Maior contagem do ranking, para dimensionar as barras horizontais
  protected readonly topMax = computed(() =>
    Math.max(1, ...(this.metrics.value()?.top_services_30d.map((s) => s.count) ?? [])),
  );

  constructor() {
    const realtime = inject(AppointmentsRealtime);
    // Números atualizam sozinhos quando um agendamento muda
    effect(() => {
      if (!realtime.lastChange()) return;
      untracked(() => this.metrics.reload());
    });
  }
}
