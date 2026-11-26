import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { multipleOf } from '../../../shared/validators/multiple-of.validator';
import type { Service } from '../data/services.repository';

export interface ServiceFormValue {
  name: string;
  duration_min: number;
  price_cents: number;
  active: boolean;
}

@Component({
  selector: 'app-service-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
  ],
  templateUrl: './service-form-dialog.html',
  styles: `
    .fields {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
    }
  `,
})
export class ServiceFormDialog {
  // null = criando; Service = editando
  protected readonly service = inject<Service | null>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ServiceFormDialog, ServiceFormValue>);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: [
      this.service?.name ?? '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    ],
    durationMin: [
      this.service?.duration_min ?? 30,
      [Validators.required, Validators.min(5), Validators.max(480), multipleOf(5)],
    ],
    // O usuário digita em reais; o banco guarda em centavos
    price: [
      this.service ? this.service.price_cents / 100 : 0,
      [Validators.required, Validators.min(0)],
    ],
    active: [this.service?.active ?? true],
  });

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, durationMin, price, active } = this.form.getRawValue();
    this.dialogRef.close({
      name: name.trim(),
      duration_min: durationMin,
      price_cents: Math.round(price * 100),
      active,
    });
  }
}
