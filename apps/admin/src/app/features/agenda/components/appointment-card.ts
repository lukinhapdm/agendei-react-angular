import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { APPOINTMENT_STATUS_LABEL, type AppointmentStatus, formatInZone } from '@agendei/shared';
import type { AgendaItem } from '../data/agenda.repository';

// Transições permitidas a partir de cada status
const NEXT_STATUSES: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  cancelled: [],
  completed: [],
};

@Component({
  selector: 'app-appointment-card',
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './appointment-card.html',
  styleUrl: './appointment-card.scss',
  host: { '[class]': '"status-" + item().status' },
})
export class AppointmentCard {
  readonly item = input.required<AgendaItem>();
  readonly timeZone = input.required<string>();
  readonly statusChange = output<AppointmentStatus>();

  protected readonly statusLabel = APPOINTMENT_STATUS_LABEL;
  protected readonly nextStatuses = computed(() => NEXT_STATUSES[this.item().status]);
  protected readonly time = computed(
    () =>
      `${formatInZone(this.item().starts_at, this.timeZone(), 'HH:mm')}–${formatInZone(this.item().ends_at, this.timeZone(), 'HH:mm')}`,
  );
}
