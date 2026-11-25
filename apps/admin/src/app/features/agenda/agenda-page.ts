import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL } from '@agendei/shared';

@Component({
  selector: 'app-agenda-page',
  imports: [MatChipsModule],
  template: `
    <h1>Agenda</h1>
    <p>Visão dia/semana (etapa 3.7). Status possíveis:</p>
    <mat-chip-set>
      @for (status of statuses; track status) {
        <mat-chip>{{ statusLabel[status] }}</mat-chip>
      }
    </mat-chip-set>
  `,
})
export class AgendaPage {
  protected readonly statuses = APPOINTMENT_STATUSES;
  protected readonly statusLabel = APPOINTMENT_STATUS_LABEL;
}
