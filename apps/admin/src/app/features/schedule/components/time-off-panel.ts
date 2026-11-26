import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { formatInZone, zonedLocalToUtcIso } from '@agendei/shared';
import { BusinessStore } from '../../../core/business/business.store';
import { ConfirmDialog, type ConfirmDialogData } from '../../../shared/ui/confirm-dialog';
import { ScheduleRepository, type TimeOff } from '../data/schedule.repository';
import { TimeOffDialog, type TimeOffFormValue } from './time-off-dialog';

@Component({
  selector: 'app-time-off-panel',
  imports: [MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="header">
      <p class="hint">Períodos em que você não atende. Os horários somem da página pública.</p>
      <button mat-flat-button (click)="add()">
        <mat-icon>add</mat-icon>
        Nova folga
      </button>
    </div>

    <mat-list>
      @for (item of timeOff(); track item.id) {
        <mat-list-item>
          <mat-icon matListItemIcon>event_busy</mat-icon>
          <span matListItemTitle>{{ label(item) }}</span>
          <span matListItemLine>{{ item.reason || 'Sem motivo' }}</span>
          <button mat-icon-button matListItemMeta (click)="remove(item)" aria-label="Excluir folga">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      } @empty {
        <p>Nenhuma folga programada.</p>
      }
    </mat-list>
  `,
  styles: `
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .hint {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class TimeOffPanel implements OnInit {
  private readonly repository = inject(ScheduleRepository);
  private readonly business = inject(BusinessStore).business()!;
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly timeOff = signal<TimeOff[]>([]);

  ngOnInit() {
    void this.reload();
  }

  // Sempre no fuso do negócio, mesmo que o dono esteja viajando
  protected label(item: TimeOff): string {
    const tz = this.business.timezone;
    const pattern = "EEE, dd/MM 'às' HH:mm";
    return `${formatInZone(item.starts_at, tz, pattern)} até ${formatInZone(item.ends_at, tz, pattern)}`;
  }

  async add() {
    const ref = this.dialog.open<TimeOffDialog, void, TimeOffFormValue>(TimeOffDialog, {
      width: '400px',
    });
    const value = await firstValueFrom(ref.afterClosed());
    if (!value) return;

    const tz = this.business.timezone;
    await this.run(
      () =>
        this.repository.createTimeOff(this.business.id, {
          starts_at: zonedLocalToUtcIso(value.start, tz),
          ends_at: zonedLocalToUtcIso(value.end, tz),
          reason: value.reason.trim() || null,
        }),
      'Folga adicionada.',
    );
  }

  async remove(item: TimeOff) {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: { title: 'Excluir folga', message: this.label(item), confirmLabel: 'Excluir' },
    });
    if (!(await firstValueFrom(ref.afterClosed()))) return;
    await this.run(() => this.repository.deleteTimeOff(item.id), 'Folga excluída.');
  }

  private async run(operation: () => Promise<void>, successMessage: string) {
    try {
      await operation();
      this.snackBar.open(successMessage, 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Algo deu errado. Tente novamente.', 'OK', { duration: 5000 });
    }
    await this.reload();
  }

  private async reload() {
    this.timeOff.set(await this.repository.listUpcomingTimeOff(this.business.id));
  }
}
