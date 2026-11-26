import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { startBeforeEnd } from './schedule.validators';

// Valores no horário local do negócio, no formato do input datetime-local
export interface TimeOffFormValue {
  start: string;
  end: string;
  reason: string;
}

@Component({
  selector: 'app-time-off-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Nova folga</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="fields">
        <mat-form-field>
          <mat-label>Início</mat-label>
          <input matInput type="datetime-local" formControlName="start" />
        </mat-form-field>
        <mat-form-field>
          <mat-label>Fim</mat-label>
          <input matInput type="datetime-local" formControlName="end" />
        </mat-form-field>
        @if (form.hasError('startAfterEnd')) {
          <p class="error">O fim deve ser depois do início.</p>
        }
        <mat-form-field>
          <mat-label>Motivo (só você vê)</mat-label>
          <input matInput formControlName="reason" maxlength="120" />
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .fields {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
    }
    .error {
      color: var(--mat-sys-error);
      margin: 0 0 12px;
    }
  `,
})
export class TimeOffDialog {
  private readonly dialogRef = inject(MatDialogRef<TimeOffDialog, TimeOffFormValue>);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      start: ['', Validators.required],
      end: ['', Validators.required],
      reason: [''],
    },
    { validators: startBeforeEnd },
  );

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
