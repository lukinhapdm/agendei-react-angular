import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ServicesRepository, type Service } from './data/services.repository';

@Component({
  selector: 'app-services-page',
  imports: [CurrencyPipe, MatListModule, MatProgressBarModule],
  template: `
    <h1>Serviços</h1>

    @if (loading()) {
      <mat-progress-bar mode="indeterminate" />
    } @else if (error()) {
      <p role="alert">Não foi possível carregar os serviços: {{ error() }}</p>
    } @else {
      <mat-list>
        @for (service of services(); track service.id) {
          <mat-list-item>
            <span matListItemTitle>{{ service.name }}</span>
            <span matListItemLine>
              {{ service.duration_min }} min ·
              {{ service.price_cents / 100 | currency: 'BRL' }}
            </span>
          </mat-list-item>
        } @empty {
          <p>Nenhum serviço cadastrado.</p>
        }
      </mat-list>
    }
  `,
})
export class ServicesPage implements OnInit {
  private readonly repository = inject(ServicesRepository);

  protected readonly services = signal<Service[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  async ngOnInit() {
    try {
      this.services.set(await this.repository.list());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'erro desconhecido');
    } finally {
      this.loading.set(false);
    }
  }
}
