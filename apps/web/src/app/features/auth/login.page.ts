import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { errorMessage } from '../../core/http/api-utils';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen items-center justify-center p-6">
      <form class="w-full max-w-sm" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="mb-8 flex items-center gap-2.5">
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"
          >
            <ui-icon name="wrench" [size]="5" />
          </span>
          <span class="text-lg font-semibold">Configuración de empresas</span>
        </div>

        <h1 class="text-2xl font-semibold tracking-tight text-slate-900">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-slate-500">Acceso exclusivo del super administrador.</p>

        @if (error()) {
          <div
            class="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            role="alert"
          >
            <ui-icon name="alert" [size]="4" />
            <span>{{ error() }}</span>
          </div>
        }

        <div class="mt-6 space-y-4">
          <div>
            <label class="label" for="email">Correo electrónico</label>
            <input
              id="email"
              class="input"
              type="email"
              formControlName="email"
              autocomplete="username"
              autofocus
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="field-error">Ingresa un correo válido.</p>
            }
          </div>
          <div>
            <label class="label" for="password">Contraseña</label>
            <input
              id="password"
              class="input"
              type="password"
              formControlName="password"
              autocomplete="current-password"
            />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <p class="field-error">Ingresa tu contraseña.</p>
            }
          </div>
        </div>

        <button type="submit" class="btn btn-primary mt-6 h-10 w-full" [disabled]="pending()">
          {{ pending() ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </div>
  `,
})
export class LoginPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly pending = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.pending()) return;

    this.pending.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl('/companies'),
      error: (error: unknown) => {
        this.pending.set(false);
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Correo o contraseña incorrectos.'
            : errorMessage(error, 'No se pudo iniciar sesión.'),
        );
      },
    });
  }
}
