import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs';
import { BusinessStore } from '../../core/business/business.store';
import { ConfirmDialog, type ConfirmDialogData } from '../../shared/ui/confirm-dialog';
import { ServiceFormDialog, type ServiceFormValue } from './components/service-form-dialog';
import { ServicesRepository, type Service } from './data/services.repository';

@Component({
  selector: 'app-services-page',
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    MatTableModule,
  ],
  templateUrl: './services-page.html',
  styleUrl: './services-page.scss',
})
export class ServicesPage implements OnInit {
  private readonly repository = inject(ServicesRepository);
  private readonly businessStore = inject(BusinessStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['name', 'duration', 'price', 'active', 'actions'];
  protected readonly services = signal<Service[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    void this.reload();
  }

  async openForm(service: Service | null = null) {
    const ref = this.dialog.open<ServiceFormDialog, Service | null, ServiceFormValue>(
      ServiceFormDialog,
      { data: service, width: '440px' },
    );
    const value = await firstValueFrom(ref.afterClosed());
    if (!value) return;

    await this.run(
      () =>
        service
          ? this.repository.update(service.id, value)
          : this.repository.create({ ...value, business_id: this.businessId() }),
      service ? 'Serviço atualizado.' : 'Serviço criado.',
    );
  }

  async toggleActive(service: Service) {
    await this.run(
      () => this.repository.update(service.id, { active: !service.active }),
      service.active ? 'Serviço ocultado dos clientes.' : 'Serviço visível para clientes.',
    );
  }

  async remove(service: Service) {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Excluir serviço',
        message: `Excluir "${service.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
      },
    });
    if (!(await firstValueFrom(ref.afterClosed()))) return;

    await this.run(() => this.repository.remove(service.id), 'Serviço excluído.');
  }

  // Executa a operação, mostra feedback e recarrega a lista
  private async run(operation: () => Promise<void>, successMessage: string) {
    try {
      await operation();
      this.snackBar.open(successMessage, 'OK', { duration: 3000 });
    } catch (e) {
      const inUse = e instanceof Error && e.message === 'service_in_use';
      this.snackBar.open(
        inUse
          ? 'Este serviço tem agendamentos. Desative-o em vez de excluir.'
          : 'Algo deu errado. Tente novamente.',
        'OK',
        { duration: 5000 },
      );
    }
    await this.reload();
  }

  private async reload() {
    this.loading.set(true);
    try {
      this.services.set(await this.repository.listByBusiness(this.businessId()));
    } finally {
      this.loading.set(false);
    }
  }

  // O hasBusinessGuard garante que o negócio existe nesta tela
  private businessId(): string {
    return this.businessStore.business()!.id;
  }
}
