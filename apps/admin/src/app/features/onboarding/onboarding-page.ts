import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BR_TIMEZONES, SLUG_PATTERN, slugify } from '@agendei/shared';
import { BusinessStore } from '../../core/business/business.store';

@Component({
  selector: 'app-onboarding-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './onboarding-page.html',
  styleUrl: '../auth/login-page.scss',
})
export class OnboardingPage {
  private readonly store = inject(BusinessStore);
  private readonly router = inject(Router);

  protected readonly timezones = BR_TIMEZONES;
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    slug: ['', [Validators.required, Validators.pattern(SLUG_PATTERN)]],
    timezone: ['America/Sao_Paulo', Validators.required],
  });

  // Preenche o slug a partir do nome até o usuário editar o slug manualmente
  private slugEditedByUser = false;

  constructor() {
    this.form.controls.name.valueChanges.pipe(takeUntilDestroyed()).subscribe((name) => {
      if (!this.slugEditedByUser) this.form.controls.slug.setValue(slugify(name));
    });
  }

  onSlugInput() {
    this.slugEditedByUser = true;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      await this.store.create(this.form.getRawValue());
      await this.router.navigateByUrl('/dashboard');
    } catch (e) {
      const taken = e instanceof Error && e.message === 'slug_taken';
      this.errorMessage.set(
        taken
          ? 'Esse endereço já está em uso. Escolha outro.'
          : 'Não foi possível criar o negócio.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
