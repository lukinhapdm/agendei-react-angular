import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/auth/auth.service';

const ERROR_MESSAGES: Record<string, string> = {
  'User already registered': 'Já existe uma conta com este e-mail.',
};

import { ThemeToggle } from '../../shared/ui/theme-toggle';

@Component({
  selector: 'app-signup-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ThemeToggle,
  ],
  templateUrl: './signup-page.html',
  styleUrl: './login-page.scss',
})
export class SignupPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly awaitingConfirmation = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    try {
      const { fullName, email, password } = this.form.getRawValue();
      const loggedIn = await this.auth.signUp(fullName, email, password);
      if (loggedIn) await this.router.navigateByUrl('/onboarding');
      else this.awaitingConfirmation.set(true);
    } catch (e) {
      const key = e instanceof Error ? e.message : '';
      this.errorMessage.set(ERROR_MESSAGES[key] ?? 'Não foi possível criar a conta.');
    } finally {
      this.loading.set(false);
    }
  }
}
