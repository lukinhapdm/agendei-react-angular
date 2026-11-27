import { Component, computed, input } from '@angular/core';
import { formatDate } from '@agendei/shared';

type Point = { date: string; count: number };

// Gráfico de barras de uma série só: altura = quantidade de agendamentos no dia
@Component({
  selector: 'app-daily-chart',
  templateUrl: './daily-chart.html',
  styleUrl: './daily-chart.scss',
})
export class DailyChart {
  readonly data = input.required<Point[]>();

  protected readonly max = computed(() => Math.max(1, ...this.data().map((p) => p.count)));
  protected readonly bars = computed(() =>
    this.data().map((p) => ({
      ...p,
      percent: (p.count / this.max()) * 100,
      label: formatDate(p.date, 'EEE dd/MM'),
      short: formatDate(p.date, 'dd'),
    })),
  );
}
