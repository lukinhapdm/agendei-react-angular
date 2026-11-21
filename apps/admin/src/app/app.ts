import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { APPOINTMENT_STATUSES, APPOINTMENT_STATUS_LABEL } from '@agendei/shared';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('dono do negócio');
  protected readonly statuses = APPOINTMENT_STATUSES;
  protected readonly statusLabel = APPOINTMENT_STATUS_LABEL;
}
