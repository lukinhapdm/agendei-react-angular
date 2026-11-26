import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WEEKDAY_LABELS, trimSeconds } from '@agendei/shared';
import { BusinessStore } from '../../../core/business/business.store';
import { ScheduleRepository, type WorkingHourInput } from '../data/schedule.repository';
import { noOverlap, startBeforeEnd } from './schedule.validators';

type IntervalForm = FormGroup<{ start: FormControl<string>; end: FormControl<string> }>;

@Component({
  selector: 'app-working-hours-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './working-hours-form.html',
  styleUrl: './working-hours-form.scss',
})
export class WorkingHoursForm implements OnInit {
  private readonly repository = inject(ScheduleRepository);
  private readonly businessId = inject(BusinessStore).business()!.id;
  private readonly snackBar = inject(MatSnackBar);

  protected readonly weekdays = WEEKDAY_LABELS;
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  // Um FormArray por dia da semana (índice 0 = domingo), cada um com seus intervalos
  protected readonly days = new FormArray(
    WEEKDAY_LABELS.map(() => new FormArray<IntervalForm>([], noOverlap)),
  );

  async ngOnInit() {
    try {
      const hours = await this.repository.listWorkingHours(this.businessId);
      for (const h of hours) {
        this.addInterval(h.weekday, trimSeconds(h.start_time), trimSeconds(h.end_time));
      }
      this.days.markAsPristine();
    } finally {
      this.loading.set(false);
    }
  }

  addInterval(weekday: number, start = '09:00', end = '18:00') {
    const interval: IntervalForm = new FormGroup(
      {
        start: new FormControl(start, { nonNullable: true, validators: Validators.required }),
        end: new FormControl(end, { nonNullable: true, validators: Validators.required }),
      },
      startBeforeEnd,
    );
    this.days.at(weekday).push(interval);
    this.days.markAsDirty();
  }

  removeInterval(weekday: number, index: number) {
    this.days.at(weekday).removeAt(index);
    this.days.markAsDirty();
  }

  async save() {
    if (this.days.invalid) {
      this.days.markAllAsTouched();
      return;
    }

    const hours: WorkingHourInput[] = this.days
      .getRawValue()
      .flatMap((intervals, weekday) =>
        intervals.map((i) => ({ weekday, start_time: i.start, end_time: i.end })),
      );

    this.saving.set(true);
    try {
      await this.repository.replaceWorkingHours(this.businessId, hours);
      this.days.markAsPristine();
      this.snackBar.open('Expediente salvo.', 'OK', { duration: 3000 });
    } catch {
      this.snackBar.open('Não foi possível salvar o expediente.', 'OK', { duration: 5000 });
    } finally {
      this.saving.set(false);
    }
  }
}
