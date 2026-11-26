import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkingHoursForm } from './components/working-hours-form';
import { TimeOffPanel } from './components/time-off-panel';

@Component({
  selector: 'app-schedule-page',
  imports: [MatTabsModule, WorkingHoursForm, TimeOffPanel],
  template: `
    <h1>Horários</h1>
    <mat-tab-group>
      <mat-tab label="Expediente">
        <app-working-hours-form />
      </mat-tab>
      <!-- Lazy: o painel de folgas só é criado quando a aba é aberta -->
      <mat-tab label="Folgas">
        <ng-template matTabContent>
          <app-time-off-panel />
        </ng-template>
      </mat-tab>
    </mat-tab-group>
  `,
})
export class SchedulePage {}
